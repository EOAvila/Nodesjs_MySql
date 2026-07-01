//////////////////////////////////////////////////
// bitrix.controller.js
//////////////////////////////////////////////////
import validator from "validator";

import {
    obtenerContactoBitrix
} from "../services/bitrix.service.js";

import {
    buscarClientePorBitrixId,
    buscarClientePorCorreo,
    upsertCliente,
    actualizarCliente,
    eliminarCliente
} from "../services/mysql.service.js";

/////////////////////////////////////////////////////////////
// WEBHOOK BITRIX
/////////////////////////////////////////////////////////////

export const webhookBitrix = async (req, res) => {

    try {

        /////////////////////////////////////////////////////////////
        // VALIDAR BODY
        /////////////////////////////////////////////////////////////

        if (!req.body || typeof req.body !== "object") {

            return res.status(400).json({
                success: false,
                message: "Body inválido"
            });
        }

        /////////////////////////////////////////////////////////////
        // EXTRAER DATOS
        /////////////////////////////////////////////////////////////

        const {
            event,
            data
        } = req.body;

        /////////////////////////////////////////////////////////////
        // VALIDAR EVENTO
        /////////////////////////////////////////////////////////////

        if (!event) {

            return res.status(400).json({
                success: false,
                message: "Evento requerido"
            });
        }

        /////////////////////////////////////////////////////////////
        // EVENTOS SOPORTADOS
        /////////////////////////////////////////////////////////////

        const eventosPermitidos = [
            "ONCRMCONTACTADD",
            "ONCRMCONTACTUPDATE",
            "ONCRMCONTACTDELETE"
        ];

        if (!eventosPermitidos.includes(event)) {

            return res.status(400).json({
                success: false,
                message: "Evento no soportado"
            });
        }

        /////////////////////////////////////////////////////////////
        // VALIDAR DATA
        /////////////////////////////////////////////////////////////

/*       if (
            !data ||
            !data.FIELDS ||
            !data.FIELDS.ID
        ) {

            return res.status(400).json({
                success: false,
                message: "ID de contacto no recibido"
            });
        }
*/
        /////////////////////////////////////////////////////////////
        // ID CONTACTO
        /////////////////////////////////////////////////////////////

        const contactId =
            data?.ID ||
            data?.FIELDS?.ID ||
            data?.FIELDS?.ID?.toString();

        if (!contactId) {
            return res.status(400).json({
                success: false,
                message: "ID de contacto no recibido"
            });
        }

     //   const contactId = String(
     //       data.FIELDS.ID
     //   ).trim();

        /////////////////////////////////////////////////////////////
        // VALIDAR ID
        /////////////////////////////////////////////////////////////

        if (!validator.isNumeric(contactId)) {

            return res.status(400).json({
                success: false,
                message: "ID inválido"
            });
        }

        /////////////////////////////////////////////////////////////
        // OBTENER CONTACTO BITRIX
        /////////////////////////////////////////////////////////////

        const contacto =
            await obtenerContactoBitrix(contactId);

        res.status(200).json({
            success: true,
            message: "Webhook recibido"
        });

        setImmediate(async () => {
            try {
                await procesarWebhookBitrix(req.body);
            } catch (e) {
                console.error("ERROR PROCESANDO WEBHOOK:", e);
            }
        });

        /////////////////////////////////////////////////////////////
        // VALIDAR CONTACTO
        /////////////////////////////////////////////////////////////
        console.log("BITRIX RESPONSE:", response.data);

        if (!contacto || typeof contacto !== "object") {

            return res.status(404).json({
                success: false,
                message: "Contacto no encontrado"
            });
        }

        /////////////////////////////////////////////////////////////
        // MAPEAR DATOS
        /////////////////////////////////////////////////////////////

        const cliente = {

            nombre: validator.escape(
                contacto.NAME || ""
            ),

            apellido: validator.escape(
                contacto.LAST_NAME || ""
            ),

            correo: contacto.EMAIL?.[0]?.VALUE
                ? validator.normalizeEmail(
                    contacto.EMAIL[0].VALUE
                )
                : "",

            telefono: contacto.PHONE?.[0]?.VALUE
                ? validator.escape(
                    contacto.PHONE[0].VALUE
                )
                : "",
                
            dui: contacto.DUI?.[0]?.VALUE
                ? validator.escape(
                    contacto.DUI[0].VALUE
                )
                : "",
            bitrix_id: Number(contacto.ID)
        };

        /////////////////////////////////////////////////////////////
        // VALIDAR EMAIL
        /////////////////////////////////////////////////////////////

        if (
            cliente.correo &&
            !validator.isEmail(cliente.correo)
        ) {

            return res.status(400).json({
                success: false,
                message: "Correo inválido"
            });
        }

        /////////////////////////////////////////////////////////////
        // BUSCAR CLIENTE MYSQL
        /////////////////////////////////////////////////////////////

        let existe =
            await buscarClientePorBitrixId(
                cliente.bitrix_id
            );

        /////////////////////////////////////////////////////////////
        // BUSCAR POR CORREO
        /////////////////////////////////////////////////////////////

        /*if (!existe && cliente.correo) {

            existe =
                await buscarClientePorCorreo(
                    cliente.correo
                );
        }*/

        /////////////////////////////////////////////////////////////
        // INSERTAR O ACTUALIZAR EN MYSQL
        /////////////////////////////////////////////////////////////

        if (!existe) {

            await upsertCliente(cliente);

            console.log(
                "CLIENTE INSERTADO:",
                cliente.bitrix_id
            );

        } else {

            await actualizarCliente(
                cliente.bitrix_id,
                cliente
            );

            console.log(
                "CLIENTE ACTUALIZADO:",
                cliente.bitrix_id
            );
        }

        /////////////////////////////////////////////////////////////
        // RESPUESTA
        /////////////////////////////////////////////////////////////

        return res.status(200).json({
            success: true,
            message:
                "Cliente sincronizado correctamente"
        });

    } catch (error) {
        console.error("BITRIX ERROR FULL:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        throw new Error("No se pudo obtener contacto Bitrix24");
    }
};
//////////////////////////////////////////////////////////////////
const procesarWebhookBitrix = async (body) => {

    const { event, data } = body;

    const contactId =
        data?.ID ||
        data?.FIELDS?.ID;

    if (!contactId) return;

    const contacto = await obtenerContactoBitrix(contactId);

    const cliente = {
        nombre: contacto.NAME || "",
        apellido: contacto.LAST_NAME || "",
        correo: contacto.EMAIL?.[0]?.VALUE || "",
        telefono: contacto.PHONE?.[0]?.VALUE || "",
        dui: contacto.DUI?.[0]?.VALUE || "",
        bitrix_id: Number(contacto.ID)
    };

    const existe = await buscarClientePorBitrixId(cliente.bitrix_id);

    if (!existe) {
        await upsertCliente(cliente);
        console.log("INSERTADO:", cliente.bitrix_id);
    } else {
        await actualizarCliente(cliente.bitrix_id, cliente);
        console.log("ACTUALIZADO:", cliente.bitrix_id);
    }
};

