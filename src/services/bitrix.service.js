import axios from "axios";

import {
    BITRIX_WEBHOOK_IN
} from "../config/bitrix.js";

import {
    rateLimitBitrix,
    sleep
} from "../utils/rateLimiter.js";

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

///////////////////////////////////////////////////////////

export const bitrixRequest =
async (
    method,
    data = {}
) => {

    let retries = 0;

    while (retries < 5) {

        try {

            await rateLimitBitrix();

            const response =
                await bitrixApi.post(
                    `${method}.json`,
                    data
                );

            const responseData =
                response.data;

            if (
                responseData.error
            ) {

                throw {
                    response: {
                        data:
                            responseData
                    }
                };
            }

            return responseData.result;

        } catch (error) {

            const bitrixError =
                error.response?.data?.error;

            ///////////////////////////////////////////////////
            // RATE LIMIT
            ///////////////////////////////////////////////////

            if (

                bitrixError ===
                    "QUERY_LIMIT_EXCEEDED"

                ||

                bitrixError ===
                    "TOO_MANY_REQUESTS"
            ) {

                const waitTime =

                    Math.pow(
                        2,
                        retries
                    ) * 5000;

                console.log(
                    `BITRIX LIMIT: esperando ${waitTime} ms`
                );

                await sleep(
                    waitTime
                );

                retries++;

                continue;
            }

            ///////////////////////////////////////////////////

            throw new Error(

                error.response?.data
                    ?.error_description

                ||

                error.message

                ||

                "Error Bitrix24"
            );
        }
    }

    throw new Error(
        "Número máximo de reintentos alcanzado"
    );
};

///////////////////////////////////////////////////////////
// CONTACT GET
///////////////////////////////////////////////////////////

export const obtenerContactoBitrix =
async (id) => {

    return await bitrixRequest(
        "crm.contact.get",
        {
            id:
                Number(id)
        }
    );
};

///////////////////////////////////////////////////////////
// CONTACT ADD
///////////////////////////////////////////////////////////

export const crearContactoBitrix =
async ({
    nombre,
    apellido,
    correo,
    telefono
}) => {

    return await bitrixRequest(
        "crm.contact.add",
        {
            fields: {

                NAME:
                    nombre,

                LAST_NAME:
                    apellido,

                EMAIL:
                    correo
                        ? [{
                            VALUE:
                                correo,
                            VALUE_TYPE:
                                "WORK"
                        }]
                        : [],

                PHONE:
                    telefono
                        ? [{
                            VALUE:
                                telefono,
                            VALUE_TYPE:
                                "WORK"
                        }]
                        : []
            }
        }
    );
};

///////////////////////////////////////////////////////////
// CONTACT UPDATE
///////////////////////////////////////////////////////////

export const actualizarContactoBitrix =
async (
    id,
    datos
) => {

    return await bitrixRequest(
        "crm.contact.update",
        {

            id:
                Number(id),

            fields: {

                NAME:
                    datos.nombre,

                LAST_NAME:
                    datos.apellido,

                EMAIL:
                    datos.correo
                        ? [{
                            VALUE:
                                datos.correo,
                            VALUE_TYPE:
                                "WORK"
                        }]
                        : [],

                PHONE:
                    datos.telefono
                        ? [{
                            VALUE:
                                datos.telefono,
                            VALUE_TYPE:
                                "WORK"
                        }]
                        : []
            }
        }
    );
};

///////////////////////////////////////////////////////////
// CONTACT DELETE
///////////////////////////////////////////////////////////

export const eliminarContactoBitrix =
async (id) => {

    return await bitrixRequest(
        "crm.contact.delete",
        {
            id:
                Number(id)
        }
    );
};