//////////////////////////////////////////////
// bitrix.service.js
//////////////////////////////////////////////
import axios from "axios";
import rateLimit from "express-rate-limit";

import {
    BITRIX_WEBHOOK_IN
} from "../config/bitrix.js";

import 
    rateLimiter 
from "../utils/rateLimiter.js";

///////////////////////////////////////////////////////////

const bitrixApi = axios.create({

    baseURL:
        BITRIX_WEBHOOK_IN,

    timeout: 20000,

    headers: {
        "Content-Type":
            "application/json"
    }
});

/////////////////////////////////////////////////////////////
// OBTENER CONTACTO BITRIX
/////////////////////////////////////////////////////////////
export const obtenerContactoBitrix = async (
    id
) => {

    try {

        /*const response = await axios.get(
            `${bitrixApi}crm.contact.get.json?id=${id}`,
            {
                timeout: 10000
            }
        );*/
        
        const response = await bitrixApi.get(
            `crm.contact.get.json?id=${id}`
        );

        ///////////////////////////////////////////////////////
        // VALIDAR ERROR BITRIX
        ///////////////////////////////////////////////////////

        if (response.data.error) {

            throw new Error(
                response.data.error_description ||
                "Error Bitrix24"
            );
        }

        ///////////////////////////////////////////////////////
        // RETORNAR RESULT
        ///////////////////////////////////////////////////////

        return response.data.result;

    } catch (error) {

        console.error(
            "ERROR BITRIX SERVICE:",
            error.message
        );

        throw new Error(
            "No se pudo obtener contacto Bitrix24"
        );
    }
};

/////////////////////////////////////////////////////////////
// CREAR CONTACTO
/////////////////////////////////////////////////////////////

export const crearContactoBitrix = async (cliente) => {

    const response = await bitrixApi.post(
        "crm.contact.add.json",
        {
            fields: {
                NAME: cliente.nombre,
                LAST_NAME: cliente.apellido,
                PHONE: [
                    {
                        VALUE: cliente.telefono,
                        VALUE_TYPE: "WORK"
                    }
                ],
                EMAIL: [
                    {
                        VALUE: cliente.correo,
                        VALUE_TYPE: "WORK"
                    }
                ]
            }
        }
    );

    return response.data.result;
};

/////////////////////////////////////////////////////////////
// ACTUALIZAR CONTACTO
/////////////////////////////////////////////////////////////

export const actualizarContactoBitrix = async (
    bitrix_id,
    cliente
) => {

    await bitrixApi.post(
        `crm.contact.update.json`,
        {
            id: bitrix_id,
            fields: {
                NAME: cliente.nombre,
                LAST_NAME: cliente.apellido,
                PHONE: [
                    {
                        VALUE: cliente.telefono,
                        VALUE_TYPE: "WORK"
                    }
                ],
                EMAIL: [
                    {
                        VALUE: cliente.correo,
                        VALUE_TYPE: "WORK"
                    }
                ]
            }
        }
    );
};
