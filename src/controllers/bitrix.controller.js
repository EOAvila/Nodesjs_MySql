import validator from "validator";

import {
    obtenerContactoBitrix
} from "../services/bitrix.service.js";

import {
    buscarClientePorBitrixId,
    buscarClientePorCorreo,
    upsertCliente,
    actualizarCliente
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
            "ONCRMCONTACTUPDATE"
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

        if (
            !data ||
            !data.FIELDS ||
            !data.FIELDS.ID
        ) {

            return res.status(400).json({
                success: false,
                message: "ID de contacto no recibido"
            });
        }

        /////////////////////////////////////////////////////////////
        // ID CONTACTO
        /////////////////////////////////////////////////////////////

        const contactId = String(
            data.FIELDS.ID
        ).trim();

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

        /////////////////////////////////////////////////////////////
        // VALIDAR CONTACTO
        /////////////////////////////////////////////////////////////

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

        if (!existe && cliente.correo) {

            existe =
                await buscarClientePorCorreo(
                    cliente.correo
                );
        }

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

        /////////////////////////////////////////////////////////////
        // LOG ERROR
        /////////////////////////////////////////////////////////////

        console.error(
            "ERROR WEBHOOK BITRIX:",
            error
        );

        /////////////////////////////////////////////////////////////
        // RESPUESTA ERROR
        /////////////////////////////////////////////////////////////

        return res.status(500).json({
            success: false,
            message:
                "Error interno del servidor",
            error: error.message
        });
    }
};