import axios from "axios";
import { BITRIX_WEBHOOK_IN } from "../config/bitrix.js";
import validator from "validator";

///////////////////////////////////////////////////////////

if (!BITRIX_WEBHOOK_IN) {
    throw new Error("BITRIX_WEBHOOK_IN no está definido en .env");
}

///////////////////////////////////////////////////////////

const bitrixApi = axios.create({
    baseURL: BITRIX_WEBHOOK_IN,
    timeout: 15000,
    headers: {
        "Content-Type": "application/json"
    }
});

////////////////////////////////////////////////////////////
//-- Bitrix24 API Service
//-- Este servicio se encarga de manejar todas las interacciones con la API de Bitrix24, incluyendo:
//-- - Obtener contactos
//-- - Crear contactos
//-- - Actualizar contactos
//-- - Eliminar contactos
//-- Además, incluye una función genérica para realizar cualquier solicitud a la API de Bitrix24, manejando errores y validaciones comunes.
////////////////////////////////////////////////////////////    

///////////////////////////////////////////
// bitrix.service.js
// bitrix Request Function
////////////////////////////////////////////
export const bitrixRequest = async (
    method,
    data = {}
) => {

    try {

        ////////////////////////////////////////////////////

        if (!method) {
            throw new Error(
                "El método de Bitrix es obligatorio"
            );
        }

        ////////////////////////////////////////////////////

        const url =
            `${BITRIX_WEBHOOK_IN}${method}.json`;

        ////////////////////////////////////////////////////

        const {
            data: responseData
        } = await axios.post(
            url,
            data,
            {
                timeout: 15000,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        ////////////////////////////////////////////////////

        if (responseData.error) {

            throw new Error(
                responseData.error_description ||
                responseData.error ||
                "Error desconocido en Bitrix24"
            );
        }

        ////////////////////////////////////////////////////

        if (!responseData || typeof responseData !== "object") {
            throw new Error(
                "Respuesta inválida de Bitrix24"
            );
        }

////////////////////////////////////////////////////

        if (responseData.error) {

            throw new Error(
                responseData.error_description ||
                responseData.error
            );
        }

////////////////////////////////////////////////////

        if (!Object.hasOwn(responseData, "result")) {

            throw new Error(
                "La respuesta no contiene resultados"
            );
        }

////////////////////////////////////////////////////

        return responseData.result;

    } catch (error) {

        ////////////////////////////////////////////////////

        console.error("BITRIX ERROR:", {
            method,
            message: error.message,
            response: error.response?.data || null
        });

        ////////////////////////////////////////////////////

        throw new Error(
            error.response?.data?.error_description ||
            error.message ||
            "Error de conexión con Bitrix24"
        );
    }
};

///////////////////////////////////////////////////////////
// GET CONTACT
///////////////////////////////////////////////////////////
export const obtenerContactoBitrix = async (
    id
) => {

    try {

        ////////////////////////////////////////////////////

        if (
            id === undefined ||
            id === null
        ) {
            throw new Error(
                "El ID del contacto es obligatorio"
            );
        }

        ////////////////////////////////////////////////////

        const numericId = Number(id);

        ////////////////////////////////////////////////////

        if (
            !Number.isInteger(numericId) ||
            numericId <= 0
        ) {
            throw new Error(
                "El ID del contacto es inválido"
            );
        }

        ////////////////////////////////////////////////////

        const contacto = await bitrixRequest(
            "crm.contact.get",
            {
                id: numericId
            }
        );

        ////////////////////////////////////////////////////

        if (
            !contacto ||
            Array.isArray(contacto)
        ) {
            throw new Error(
                "Contacto no encontrado en Bitrix24"
            );
        }

        ////////////////////////////////////////////////////

        return contacto;

    } catch (error) {

        ////////////////////////////////////////////////////

        console.error(
            "ERROR OBTENER CONTACTO BITRIX:",
            {
                id,
                message: error.message
            }
        );

        ////////////////////////////////////////////////////

        throw new Error(
            error.message ||
            "Error al obtener contacto desde Bitrix24"
        );
    }
};

///////////////////////////////////////////////////////////
// CREATE CONTACT
///////////////////////////////////////////////////////////

export const crearContactoBitrix =
    async ({
        nombre,
        apellido,
        email,
        telefono
    }) => {

        return await bitrixRequest(
            "crm.contact.add",
            {
                fields: {

                    NAME: nombre,

                    LAST_NAME: apellido || "",

                    OPENED: "Y",

                    TYPE_ID: "CLIENT",

                    SOURCE_ID: "WEB",

                    PHONE: telefono
                        ? [{
                            VALUE: telefono,
                            VALUE_TYPE: "WORK"
                        }]
                        : [],

                    EMAIL: [{
                        VALUE: email,
                        VALUE_TYPE: "WORK"
                    }]
                }
            }
        );
    };

///////////////////////////////////////////////////////////
// UPDATE CONTACT
///////////////////////////////////////////////////////////

export const actualizarContactoBitrix =
    async (
        id,
        {
            nombre,
            apellido,
            email,
            telefono
        }
    ) => {

        return await bitrixRequest(
            "crm.contact.update",
            {
                id: Number(id),

                fields: {

                    NAME: nombre,

                    LAST_NAME: apellido,

                    PHONE: telefono
                        ? [{
                            VALUE: telefono,
                            VALUE_TYPE: "WORK"
                        }]
                        : [],

                    EMAIL: email
                        ? [{
                            VALUE: email,
                            VALUE_TYPE: "WORK"
                        }]
                        : []
                }
            }
        );
    };

///////////////////////////////////////////////////////////
// DELETE CONTACT
///////////////////////////////////////////////////////////

export const eliminarContactoBitrix =
    async (id) => {

        return await bitrixRequest(
            "crm.contact.delete",
            {
                id: Number(id)
            }
        );
    };