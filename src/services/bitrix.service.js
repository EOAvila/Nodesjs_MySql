//////////////////////////////////////////////
// bitrix.service.js
//////////////////////////////////////////////

import axios from "axios";

import {
BITRIX_WEBHOOK_IN
} from "../config.js";

/////////////////////////////////////////////////////////////
// CLIENTE AXIOS BITRIX24
/////////////////////////////////////////////////////////////

const bitrixApi = axios.create({

baseURL:
    BITRIX_WEBHOOK_IN,

timeout:
    20000,

headers: {

    "Content-Type":
        "application/json"

}

});

/////////////////////////////////////////////////////////////
// FUNCIÓN AUXILIAR
// NORMALIZAR VALORES DE TEXTO
/////////////////////////////////////////////////////////////

const normalizarTexto = (valor) => {

if (
    valor === undefined ||
    valor === null
) {

    return null;

}

const texto =
    String(valor).trim();

return texto !== ""
    ? texto
    : null;

};

/////////////////////////////////////////////////////////////
// FUNCIÓN AUXILIAR
// CREAR CAMPO DE CONTACTO
/////////////////////////////////////////////////////////////

const crearCampoContacto = (
valor,
tipo
) => {

const valorNormalizado =
    normalizarTexto(valor);

if (!valorNormalizado) {

    return [];

}

return [

    {

        VALUE:
            valorNormalizado,

        VALUE_TYPE:
            tipo

    }

];

};

/////////////////////////////////////////////////////////////
// FUNCIÓN AUXILIAR
// VALIDAR RESPUESTA BITRIX24
/////////////////////////////////////////////////////////////

const validarRespuestaBitrix = (
response
) => {

if (
    !response ||
    !response.data
) {

    throw new Error(
        "Bitrix24 no devolvió una respuesta válida"
    );

}

if (
    response.data.error
) {

    const errorBitrix =
        new Error(

            response.data.error_description ||
            response.data.error ||
            "Error desconocido de Bitrix24"

        );

    errorBitrix.bitrixError =
        response.data.error;

    errorBitrix.bitrixDescription =
        response.data.error_description;

    errorBitrix.response =
        response;

    throw errorBitrix;

}

return response.data;

};

/////////////////////////////////////////////////////////////
// OBTENER CONTACTO BITRIX
/////////////////////////////////////////////////////////////

export const obtenerContactoBitrix = async (

id

) => {

try {

    /////////////////////////////////////////////////////
    // VALIDAR ID
    /////////////////////////////////////////////////////

    if (
        id === undefined ||
        id === null ||
        String(id).trim() === ""
    ) {

        throw new Error(
            "El ID del contacto Bitrix24 es requerido"
        );

    }

    /////////////////////////////////////////////////////
    // CONSULTAR CONTACTO
    /////////////////////////////////////////////////////

    const response =
        await bitrixApi.get(

            "crm.contact.get.json",

            {

                params: {

                    id

                }

            }

        );

    /////////////////////////////////////////////////////
    // VALIDAR RESPUESTA
    /////////////////////////////////////////////////////

    const data =
        validarRespuestaBitrix(
            response
        );

    /////////////////////////////////////////////////////
    // VALIDAR RESULTADO
    /////////////////////////////////////////////////////

    if (
        !data.result
    ) {

        throw new Error(
            "Bitrix24 no devolvió el contacto solicitado"
        );

    }

    /////////////////////////////////////////////////////
    // RETORNAR CONTACTO
    /////////////////////////////////////////////////////

    return data.result;

} catch (error) {

    console.error(
        "================================="
    );

    console.error(
        "ERROR BITRIX SERVICE"
    );

    console.error({

        message:
            error.message,

        response:
            error.response?.data || null,

        status:
            error.response?.status || null,

        url:
            error.config?.url || null,

        method:
            error.config?.method || null

    });

    console.error(
        "================================="
    );

    throw error;

}

};

/////////////////////////////////////////////////////////////
// CREAR CONTACTO
/////////////////////////////////////////////////////////////

export const crearContactoBitrix = async (

cliente

) => {

try {

    /////////////////////////////////////////////////////
    // CREAR CONTACTO
    /////////////////////////////////////////////////////

    const response =
        await bitrixApi.post(

            "crm.contact.add.json",

            {

                fields: {

                    NAME:
                        normalizarTexto(
                            cliente.nombre
                        ),

                    LAST_NAME:
                        normalizarTexto(
                            cliente.apellido
                        ),

                    PHONE:
                        crearCampoContacto(

                            cliente.telefono,

                            "WORK"

                        ),

                    EMAIL:
                        crearCampoContacto(

                            cliente.correo,

                            "WORK"

                        ),

                    DUI:
                        normalizarTexto(
                            cliente.dui
                        )

                }

            }

        );

    /////////////////////////////////////////////////////
    // VALIDAR RESPUESTA
    /////////////////////////////////////////////////////

    const data =
        validarRespuestaBitrix(
            response
        );

    /////////////////////////////////////////////////////
    // VALIDAR RESULTADO
    /////////////////////////////////////////////////////

    if (
        !data.result
    ) {

        throw new Error(
            "Bitrix24 no devolvió el ID del contacto creado"
        );

    }

    return data.result;

} catch (error) {

    console.error(
        "================================="
    );

    console.error(
        "ERROR CREANDO CONTACTO BITRIX24"
    );

    console.error({

        message:
            error.message,

        response:
            error.response?.data || null,

        status:
            error.response?.status || null,

        url:
            error.config?.url || null,

        method:
            error.config?.method || null

    });

    console.error(
        "================================="
    );

    throw error;

}

};

/////////////////////////////////////////////////////////////
// ACTUALIZAR CONTACTO
/////////////////////////////////////////////////////////////

export const actualizarContactoBitrix = async (

bitrix_id,

cliente

) => {

try {

    /////////////////////////////////////////////////////
    // ACTUALIZAR CONTACTO
    /////////////////////////////////////////////////////

    const response =
        await bitrixApi.post(

            "crm.contact.update.json",

            {

                id:
                    bitrix_id,

                fields: {

                    NAME:
                        normalizarTexto(
                            cliente.nombre
                        ),

                    LAST_NAME:
                        normalizarTexto(
                            cliente.apellido
                        ),

                    PHONE:
                        crearCampoContacto(

                            cliente.telefono,

                            "WORK"

                        ),

                    EMAIL:
                        crearCampoContacto(

                            cliente.correo,

                            "WORK"

                        ),

                    DUI:
                        normalizarTexto(
                            cliente.dui
                        )

                }

            }

        );

    /////////////////////////////////////////////////////
    // VALIDAR RESPUESTA
    /////////////////////////////////////////////////////

    const data =
        validarRespuestaBitrix(
            response
        );

    /////////////////////////////////////////////////////
    // VALIDAR RESULTADO
    /////////////////////////////////////////////////////

    if (
        data.result === false
    ) {

        throw new Error(
            "Bitrix24 no pudo actualizar el contacto"
        );

    }

    return data.result;

} catch (error) {

    console.error(
        "================================="
    );

    console.error(
        "ERROR ACTUALIZANDO CONTACTO BITRIX24"
    );

    console.error({

        message:
            error.message,

        response:
            error.response?.data || null,

        status:
            error.response?.status || null,

        url:
            error.config?.url || null,

        method:
            error.config?.method || null

    });

    console.error(
        "================================="
    );

    throw error;

}

};