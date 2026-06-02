import { Router } from "express";
import axios from "axios";
import validator from "validator";
import { pool } from "../../config/db.js";
import { BITRIX_WEBHOOK_IN } from "../config.js";

const router = Router();

///////////////////////////////////////////////////////
// CONFIG
///////////////////////////////////////////////////////

const WEBHOOK = BITRIX_WEBHOOK_IN;

const bitrix = axios.create({
    baseURL: WEBHOOK,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json"
    }
});


///////////////////////////////////////////////////////
// HELPERS
///////////////////////////////////////////////////////

const validateEmail = (email) => {
    return validator.isEmail(email || "");
};

const validatePhone = (phone) => {
    return validator.isMobilePhone(phone || "", "any");
};

const sanitizeString = (value) => {
    return String(value || "").trim();
};

const buildBitrixContact = ({
    nombre,
    apellido,
    telefono,
    correo
}) => ({
    NAME: sanitizeString(nombre),
    LAST_NAME: sanitizeString(apellido),
    PHONE: telefono
        ? [
              {
                  VALUE: telefono,
                  VALUE_TYPE: "WORK"
              }
          ]
        : [],
    EMAIL: correo
        ? [
              {
                  VALUE: correo,
                  VALUE_TYPE: "WORK"
              }
          ]
        : []
});


///////////////////////////////////////////////////////
// BITRIX API
///////////////////////////////////////////////////////

const getBitrixContact = async (id) => {
    const response = await bitrix.post(
        "crm.contact.get.json",
        { id }
    );

    return response.data;
};

const createBitrixContact = async (fields) => {
    const response = await bitrix.post(
        "crm.contact.add.json",
        { fields }
    );

    return response.data;
};

const updateBitrixContact = async (id, fields) => {
    const response = await bitrix.post(
        "crm.contact.update.json",
        {
            id,
            fields
        }
    );

    return response.data;
};

const deleteBitrixContact = async (id) => {
    const response = await bitrix.post(
        "crm.contact.delete.json",
        { id }
    );

    return response.data;
};



///////////////////////////////////////////////////////
// MYSQL HELPERS
///////////////////////////////////////////////////////

const getMysqlContactByBitrixId = async (bitrixId) => {
    const [rows] = await pool.query(
        `
        SELECT * 
        FROM pro_clientes
        WHERE bitrix_id = ?
        LIMIT 1
        `,
        [bitrixId]
    );

    return rows[0];
};

const getMysqlContactByEmail = async (correo) => {
    const [rows] = await pool.query(
        `
        SELECT *
        FROM pro_clientes
        WHERE email = ?
        LIMIT 1
        `,
        [correo]
    );

    return rows[0];
};


///////////////////////////////////////////////////////
// OBTENER CONTACTO DE BITRIX24 Y GUARDAR EN MYSQL
///////////////////////////////////////////////////////

router.get("/contacto/:id", async (req, res) => {

    try {

        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID inválido"
            });
        }

        const response = await getBitrixContact(id);

        return res.json({
            success: true,
            data: response.result
        });

    } catch (error) {

        console.error("ERROR GET CONTACT:", error.message);

        return res.status(500).json({
            success: false,
            message: "Error obteniendo contacto",
            error: error.message
        });
    }
});


///////////////////////////////////////////////////////
// CREAR CONTACTO
///////////////////////////////////////////////////////

router.post("/contacto", async (req, res) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const {
            nombre,
            apellido,
            telefono,
            correo
        } = req.body;

        ///////////////////////////////////////////////////
        // VALIDACIONES
        ///////////////////////////////////////////////////

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: "Nombre requerido"
            });
        }

        if (correo && !validateEmail(correo)) {
            return res.status(400).json({
                success: false,
                message: "Correo inválido"
            });
        }

        if (telefono && !validatePhone(telefono)) {
            return res.status(400).json({
                success: false,
                message: "Teléfono inválido"
            });
        }

        ///////////////////////////////////////////////////
        // VALIDAR DUPLICADO MYSQL
        ///////////////////////////////////////////////////

        const existing = await getMysqlContactByEmail(correo);

        if (existing) {

            return res.status(409).json({
                success: false,
                message: "El contacto ya existe"
            });
        }

        ///////////////////////////////////////////////////
        // CREAR EN BITRIX
        ///////////////////////////////////////////////////

        const fields = buildBitrixContact({
            nombre,
            apellido,
            telefono,
            correo
        });

        const bitrixResponse = await createBitrixContact(fields);

        const bitrixId = bitrixResponse.result;

        ///////////////////////////////////////////////////
        // GUARDAR EN MYSQL
        ///////////////////////////////////////////////////

        await connection.query(
            `
            INSERT INTO pro_clientes (
                pri_nombre,
                Pri_apellido,
                telefono,
                email,
                bitrix_id
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                nombre,
                apellido,
                telefono,
                correo,
                bitrixId
            ]
        );

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Contacto creado correctamente en Bitrix y MySQL",
            bitrix_id: bitrixId
        });

    } catch (error) {

        await connection.rollback();

        console.error("ERROR CREATE CONTACT:", error);

        return res.status(200).json({
            success: false,
            message: "Error creando contacto en Bitrix o MySQL",
            error: error.message
        });

    } finally {

        connection.release();
    }
});



///////////////////////////////////////////////////////
// ACTUALIZAR CONTACTO
///////////////////////////////////////////////////////

router.put("/contacto/:id", async (req, res) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID inválido"
            });
        }

        const {
            nombre,
            apellido,
            telefono,
            correo
        } = req.body;

        ///////////////////////////////////////////////////
        // VALIDACIONES
        ///////////////////////////////////////////////////

        if (correo && !validateEmail(correo)) {
            return res.status(400).json({
                success: false,
                message: "Correo inválido"
            });
        }

        if (telefono && !validatePhone(telefono)) {
            return res.status(400).json({
                success: false,
                message: "Teléfono inválido"
            });
        }

        ///////////////////////////////////////////////////
        // ACTUALIZAR BITRIX
        ///////////////////////////////////////////////////

        const fields = buildBitrixContact({
            nombre,
            apellido,
            telefono,
            correo
        });

        await updateBitrixContact(id, fields);

        ///////////////////////////////////////////////////
        // ACTUALIZAR MYSQL
        ///////////////////////////////////////////////////

        await connection.query(
            `
            UPDATE pro_clientes
            SET
                pri_nombre = ?,
                Pri_apellido = ?,
                telefono = ?,
                email = ?
            WHERE bitrix_id = ?
            `,
            [
                nombre,
                apellido,
                telefono,
                correo,
                id
            ]
        );

        await connection.commit();

        return res.json({
            success: true,
            message: "Contacto actualizado en Bitrix y MySQL"
        });

    } catch (error) {

        await connection.rollback();

        console.error("ERROR UPDATE:", error);

        return res.status(200).json({
            success: false,
            message: "Error actualizando contacto en Bitrix o MySQL",
            error: error.message
        });

    } finally {

        connection.release();
    }
});


///////////////////////////////////////////////////////
// ELIMINAR CONTACTO
///////////////////////////////////////////////////////

router.delete("/contacto/:id", async (req, res) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const id = Number(req.params.id);

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID inválido"
            });
        }

        ///////////////////////////////////////////////////
        // ELIMINAR EN BITRIX
        ///////////////////////////////////////////////////

        await deleteBitrixContact(id);

        ///////////////////////////////////////////////////
        // ELIMINAR MYSQL
        ///////////////////////////////////////////////////

        await connection.query(
            `
            DELETE FROM pro_clientes
            WHERE bitrix_id = ?
            `,
            [id]
        );

        await connection.commit();

        return res.json({
            success: true,
            message: "Contacto eliminado en Bitrix y MySQL"
        });

    } catch (error) {

        await connection.rollback();

        console.error("ERROR DELETE:", error);

        return res.status(200).json({
            success: false,
            message: "Error eliminando contacto en Bitrix o MySQL",
            error: error.message
        });

    } finally {

        connection.release();
    }
});

///////////////////////////////////////////////////////
// WEBHOOKS BIDIRECCIONALES BITRIX24
///////////////////////////////////////////////////////

router.post("/webhook/bitrix", async (req, res) => {

    try {

        const event = req.body.event;
        const data = req.body.data;

        ///////////////////////////////////////////////////
        // VALIDAR EVENTO
        ///////////////////////////////////////////////////

        if (!event) {
            return res.status(400).json({
                success: false,
                message: "Evento requerido"
            });
        }

        ///////////////////////////////////////////////////
        // CONTACTO AGREGADO
        ///////////////////////////////////////////////////

        if (event === "ONCRMCONTACTADD") {

            console.log("Nuevo contacto agregado");

            // SINCRONIZAR MYSQL
        }

        ///////////////////////////////////////////////////
        // CONTACTO ACTUALIZADO
        ///////////////////////////////////////////////////

        if (event === "ONCRMCONTACTUPDATE") {

            console.log("Contacto actualizado");

            // SINCRONIZAR MYSQL
        }

        ///////////////////////////////////////////////////
        // CONTACTO ELIMINADO
        ///////////////////////////////////////////////////

        if (event === "ONCRMCONTACTDELETE") {

            console.log("Contacto eliminado");

            // ELIMINAR MYSQL
        }

        ///////////////////////////////////////////////////
        // LEAD AGREGADO
        ///////////////////////////////////////////////////

        if (event === "ONCRMLEADADD") {

            console.log("Lead agregado");
        }

        ///////////////////////////////////////////////////
        // LEAD ACTUALIZADO
        ///////////////////////////////////////////////////

        if (event === "ONCRMLEADUPDATE") {

            console.log("Lead actualizado");
        }

        ///////////////////////////////////////////////////
        // LEAD ELIMINADO
        ///////////////////////////////////////////////////

        if (event === "ONCRMLEADDELETE") {

            console.log("Lead eliminado");
        }

        return res.json({
            success: true
        });

    } catch (error) {

        console.error("WEBHOOK ERROR:", error);

        return res.status(200).json({
            success: false,
            error: error.message
        });
    }
});

///////////////////////////////////////////////////////
export default router;




















//////////////////////////////////
const router = Router();
const WEBHOOKENT = BITRIX_WEBHOOK_IN
/////////////////////////////////////////

const webhookUrl_contact_update = `${WEBHOOKENT}crm.contact.update.json`
const webhookUrl_lead_update    = `${WEBHOOKENT}crm.lead.update.json`
const webhookUrl_contact_add    = `${WEBHOOKENT}crm.contact.add.json`
const webhookUrl_lead_add       = `${WEBHOOKENT}crm.lead.add.json`
const webhookUrl_contact_delete = `${WEBHOOKENT}crm.contact.delete.json`
const webhookUrl_lead_delete    = `${WEBHOOKENT}crm.lead.delete.json`
//////////////////////////////////

// ======================================================
// WEBHOOK BITRIX24 ENTRANTE
// ======================================================

// ======================================================
// OBTENER CONTACTO
// ======================================================
router.get('/contacto/:id', async (req, res) => {

    try {

        const id = req.params.id

        const response = await axios.post(
            `${WEBHOOKENT}crm.contact.get.json`,
            {
                id: id
            }
        )

        return res.json(response.data)

    } catch (error) {

        console.log(error)

        return res.status(500).json({
            error: error.message
        })
    }
})

// ======================================================
// CREAR CONTACTO
// ======================================================
router.post('/contacto', async (req, res) => {

    try {

        const {
            nombre,
            apellido,
            telefono,
            correo
        } = req.body

        const response = await axios.post(
            `${WEBHOOKENT}crm.contact.add.json`,
            {
                fields: {
                    NAME: nombre,
                    LAST_NAME: apellido,
                    PHONE: [
                        {
                            VALUE: telefono,
                            VALUE_TYPE: 'WORK'
                        }
                    ],
                    EMAIL: [
                        {
                            VALUE: correo,
                            VALUE_TYPE: 'WORK'
                        }
                    ]
                }
            }
        )

        return res.json({
            success: true,
            data: response.data
        })

    } catch (error) {

        console.log(error)

        return res.status(500).json({
            error: error.message
        })
    }
})

// ======================================================
// ACTUALIZAR CONTACTO
// ======================================================
router.put('/contacto/:id', async (req, res) => {

    try {

        const id = req.params.id

        const {
            nombre,
            apellido
        } = req.body

        const response = await axios.post(
            `${WEBHOOKENT}crm.contact.update.json`,
            {
                id: id,
                fields: {
                    NAME: nombre,
                    LAST_NAME: apellido,
                    PHONE: [
                        {
                            VALUE: telefono,
                            VALUE_TYPE: 'WORK'
                        }
                    ]
                }
            }
        )

        return res.json({
            success: true,
            data: response.data
        })

    } catch (error) {

        console.log(error)

        return res.status(500).json({
            error: error.message
        })
    }
})

// ======================================================
// ELIMINAR CONTACTO
// ======================================================
app.delete('/contacto/:id', async (req, res) => {

    try {

        const id = req.params.id

        const response = await axios.post(
            `${WEBHOOKENT}crm.contact.delete.json`,
            {
                id: id
            }
        )

        return res.json({
            success: true,
            data: response.data
        })

    } catch (error) {

        console.log(error)

        return res.status(500).json({
            error: error.message
        })
    }
})

////////////////////////////////////////////////////////////////////////
export default router;










//export const postpro_clientesRouter = router.post('/api/pro_clientes', async (req, res) => {
//    try {

//        console.log('=== NUEVA LLAMADA AL WEBHOOK ===')
//        console.log('BODY:')
//        console.log(req.body)

        //if (!req.body.auth) {
        //    return res.status(401).json({
        //        error: 'Acceso no autorizado. Se requiere autenticación.'
        //    })
        //}

//        if (!req.body.event) {
//            return res.status(400).json({
//            error: 'Evento no recibido'
//            })
//        }

        // ==================================================
        // EVENTO
        // ==================================================

//        if (!req.body.event || !req.body.data || !req.body.data.FIELDS || !req.body.data.FIELDS.ID) {
//            return res.status(401).json({
//                error: 'Datos incompletos. Se requiere autenticación.'
//            })
//        }
        /////////////////////////////////////////////////
//        const event = req.body.event
//        console.log('EVENTO:', event)
        /////////////////////////////////////////////////
//        const entityId = req.body.data.FIELDS.ID
//        console.log('ID ENTIDAD:', entityId)
        /////////////////////////////////////////////////
//        let response

        // ==================================================
        // ID CONTACTO / LEAD
        // ==================================================

//        if (!entityId) {
//            return res.status(401).json({
//                error: 'ID de entidad no proporcionado.'
//            })
//        }

        //Bash JavaScript
        // ==================================================
        // WEBHOOK BITRIX
        // ==================================================

        // ==================================================
        // CONTACT
        // ==================================================
//        if (event === 'ONCRMCONTACTADD') {
//                response = await axios.post(
//                        `${WEBHOOKENT}crm.contact.get.json`,
//                {
//                        id: entityId
//                }
//            )
//        }

        // ==================================================
        // LEAD
        // ==================================================
//        if (event === 'ONCRMLEADADD') {
//                response = await axios.post(
//                `${WEBHOOKENT}crm.lead.get.json`,
 //               {
 //                       id: entityId
//                })
//        }

//        if (!response || !response.data || !response.data.result) {
//            return res.status(404).json({
//                error: 'No se pudo obtener información de Bitrix24.'
//            })
//        }


        // ==================================================
        // DATOS COMPLETOS
        // ==================================================
//        const data2 = response.data.result
//        console.log(data2)
//        const nombre =    data2.NAME || ''
//        const apellido =  data2.LAST_NAME || ''
//        const telefono =  data2.PHONE?.[0]?.VALUE || ''
//        const correo =    data2.EMAIL?.[0]?.VALUE || ''
//        const id_bitrix = data2.ID || ''

//        if (!telefono && !correo) {
//            return res.status(401).json({
//                error: 'No se proporcionó teléfono ni correo electrónico.'
//            })
//        }

        // ==================================================
        // VALIDAR EXISTENCIA DEL CLIENTE EN LA BASE DE DATOS
        // ==================================================
 //       const [rows] = await pool.query(
 //           `SELECT * FROM pro_clientes
//                WHERE bitrix_id = ?
//                LIMIT 1 `,
//                [id_bitrix]
//        )

        // ==================================================
        // UPDATE
        // ==================================================
 //       if (rows.length > 0) {
 //           await pool.query(
 //               `UPDATE pro_clientes 
 //               SET
 //                   pri_nombre = ?, 
 //                   pri_apellido = ?, 
//                    telefono = ?, 
//                    email = ? 
//                WHERE bitrix_id = ? `,
//                [
//                    nombre,
//                    apellido,
//                    telefono,
//                    correo,
//                    id_bitrix
//                ]
//            )
//            return res.json({
//                success: true,
//                accion: 'ACTUALIZADO'
//            })
//        }
//        if (event === 'ONCRMCONTACTADD' || event === 'ONCRMLEADADD'){
            // ==================================================
            // INSERT
            // ==================================================
//            await pool.query(
//                `INSERT INTO pro_clientes
//                (
//                    pri_nombre,
//                    pri_apellido,
//                    telefono,
//                    email,
//                    bitrix_id
//                )
//                VALUES (?, ?, ?, ?, ?) `,
//                [
//                    nombre,
//                    apellido,
//                    telefono,
//                    correo,
//                    id_bitrix
//                ]
//            )}
//            return res.json({
//                success: true,
//                accion: 'INSERTADO'
//            })

        // ==================================================
        // DELETE
        // ==================================================
//      if (event === 'ONCRMCONTACTDELETE') {
//            await pool.query(
//                `DELETE FROM pro_clientes
//                WHERE bitrix_id = ?`,
//                [entityId]
//            )
//        }
//        return res.json({
//        success: true,
//        accion: 'ELIMINADO'
//        })
//} catch (err) {
//
//        console.log(err)
//
//        return res.status(500).json({
//            error: err.message
//            })
//        }
//})

////////////////////////////////////////////////////////////////////////
//export default router;
