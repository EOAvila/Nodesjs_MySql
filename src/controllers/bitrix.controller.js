// src/controllers/bitrix.controller.js
import validator from "validator";

///////////////////////////////////////////////////////////

import {
    obtenerContactoBitrix
} from "../services/bitrix.service.js";

///////////////////////////////////////////////////////////

import {
    buscarClientePorBitrixId,
    insertarCliente,
    actualizarCliente
} from "../services/mysql.service.js";

///////////////////////////////////////////////////////////
// SYNC CONTACT
///////////////////////////////////////////////////////////

export const sincronizarContacto = async (req, res) => {

    try {

        const { id } = req.params;

        ///////////////////////////////////////////////////
        // VALIDAR ID
        ///////////////////////////////////////////////////

        if (!validator.isNumeric(String(id))) {

            return res.status(400).json({
                success: false,
                message: "ID inválido"
            });
        }

        ///////////////////////////////////////////////////
        // OBTENER CONTACTO BITRIX
        ///////////////////////////////////////////////////

        const contacto =
            await obtenerContactoBitrix(Number(id));

        ///////////////////////////////////////////////////

        if (!contacto) {

            return res.status(404).json({
                success: false,
                message: "Contacto no encontrado en Bitrix24"
            });
        }

        ///////////////////////////////////////////////////
        // NORMALIZAR DATOS
        ///////////////////////////////////////////////////

        const clienteData = {

            bitrix_id:
                Number(contacto.ID),

            nombre:
                contacto.NAME?.trim() || "",

            apellido:
                contacto.LAST_NAME?.trim() || "",

            email:
                contacto.EMAIL?.[0]?.VALUE?.trim() || "",

            telefono:
                contacto.PHONE?.[0]?.VALUE?.trim() || ""
        };

        ///////////////////////////////////////////////////
        // VALIDAR EMAIL
        ///////////////////////////////////////////////////

        if (
            clienteData.email &&
            !validator.isEmail(clienteData.email)
        ) {

            return res.status(400).json({
                success: false,
                message: "Correo inválido"
            });
        }

        ///////////////////////////////////////////////////
        // BUSCAR CLIENTE EN MYSQL
        ///////////////////////////////////////////////////

        const clienteExistente =
            await buscarClientePorBitrixId(
                clienteData.bitrix_id
            );

        ///////////////////////////////////////////////////
        // INSERTAR
        ///////////////////////////////////////////////////

        if (!clienteExistente) {

            const nuevoId =
                await insertarCliente(clienteData);

            ///////////////////////////////////////////////////

            return res.status(201).json({
                success: true,
                message: "Cliente sincronizado correctamente",
                data: {
                    id: nuevoId,
                    ...clienteData
                }
            });
        }

        ///////////////////////////////////////////////////
        // ACTUALIZAR MYSQL
        ///////////////////////////////////////////////////

        await actualizarCliente(
            clienteExistente.id,
            clienteData
        );

        ///////////////////////////////////////////////////

        return res.status(200).json({
            success: true,
            message: "Cliente actualizado correctamente",
            data: {
                id: clienteExistente.id,
                ...clienteData
            }
        });

    } catch (error) {

        ///////////////////////////////////////////////////

        console.error(
            "ERROR SINCRONIZAR CONTACTO:",
            error
        );

        ///////////////////////////////////////////////////

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};