/////////////////////////////////////////////////////////////
// bitrix.controller.js
/////////////////////////////////////////////////////////////

import validator from "validator";

import {
obtenerContactoBitrix
} from "../services/bitrix.service.js";

import {
buscarClientePorBitrixId,

upsertCliente,

actualizarCliente,

eliminarCliente,

normalizarDui

} from "../services/mysql.service.js";

/////////////////////////////////////////////////////////////
// CAMPO INTERNO DUI EN BITRIX24
/////////////////////////////////////////////////////////////

/*

Bitrix24 no devuelve el campo personalizado como:


contacto.DUI


Devuelve el identificador interno:


UF_CRM_1781908621


Este identificador corresponde al campo utilizado
para el DUI según la respuesta completa recibida.
*/

const CAMPO_DUI_BITRIX =
    process.env.BITRIX_DUI_FIELD ||
    "UF_CRM_1781908621";


    /////////////////////////////////////////////////////////////
// EVENTOS PERMITIDOS
/////////////////////////////////////////////////////////////

const EVENTOS_PERMITIDOS = [

"ONCRMCONTACTADD",

"ONCRMCONTACTUPDATE",

"ONCRMCONTACTDELETE"

];

/////////////////////////////////////////////////////////////
// OBTENER ID DEL CONTACTO
/////////////////////////////////////////////////////////////

const obtenerContactId =
(data) => {

const id =

    data?.ID ||

    data?.FIELDS?.ID;


if (

    id === null ||

    id === undefined

) {
    return null;
}


return String(
    id
).trim();

};


/////////////////////////////////////////////////////////////
// EXTRAER VALOR DE CAMPO BITRIX
/////////////////////////////////////////////////////////////

const extraerValorCampo =
(valor) => {

if (

    valor === null ||

    valor === undefined

) {
    return "";
}


if (
    Array.isArray(valor)
) {

    const primerValor =
        valor[0];


    if (

        primerValor &&

        typeof primerValor === "object"

    ) {

        return String(

            primerValor.VALUE ||

            primerValor.value ||

            ""

        ).trim();
    }


    return String(
        primerValor || ""
    ).trim();
}


if (

    typeof valor === "object"

) {

    return String(

        valor.VALUE ||

        valor.value ||

        ""

    ).trim();
}


return String(
    valor
).trim();

};

/////////////////////////////////////////////////////////////
// OBTENER DUI DE BITRIX24
/////////////////////////////////////////////////////////////

const obtenerDuiBitrix =
(contacto) => {

const valorDui =

    contacto?.[
        CAMPO_DUI_BITRIX
    ];


return extraerValorCampo(
    valorDui
);

};

/////////////////////////////////////////////////////////////
// MAPEAR CONTACTO BITRIX
/////////////////////////////////////////////////////////////

const mapearContacto =
(contacto) => {

/////////////////////////////////////////////////////////////
// EMAIL
/////////////////////////////////////////////////////////////

const correoOriginal =

    contacto.EMAIL?.[0]?.VALUE ||

    "";


const correo =

    correoOriginal

        ? validator.normalizeEmail(
            String(
                correoOriginal
            ).trim()
        )

        : "";


/////////////////////////////////////////////////////////////
// TELEFONO
/////////////////////////////////////////////////////////////

const telefono =

    contacto.PHONE?.[0]?.VALUE

        ? String(
            contacto.PHONE[0].VALUE
        ).trim()

        : "";


/////////////////////////////////////////////////////////////
// DUI
/////////////////////////////////////////////////////////////

const duiOriginal =

    obtenerDuiBitrix(
        contacto
    );


const dui =

    normalizarDui(
        duiOriginal
    );


/////////////////////////////////////////////////////////////
// CLIENTE
/////////////////////////////////////////////////////////////

return {

    bitrix_id:
        Number(
            contacto.ID
        ),

    nombre:
        String(
            contacto.NAME || ""
        ).trim(),

    apellido:
        String(
            contacto.LAST_NAME || ""
        ).trim(),

    correo:
        correo || "",

    telefono,

    dui

};

};

/////////////////////////////////////////////////////////////
// WEBHOOK BITRIX
/////////////////////////////////////////////////////////////

export const webhookBitrix =
async (
req,
res
) => {

try {


    /////////////////////////////////////////////////////////////
    // VALIDAR BODY
    /////////////////////////////////////////////////////////////

    if (

        !req.body ||

        typeof req.body !== "object"

    ) {

        return res.status(
            400
        ).json({

            success: false,

            message:
                "Body inválido"

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

    if (
        !event
    ) {

        return res.status(
            400
        ).json({

            success: false,

            message:
                "Evento requerido"

        });
    }


    /////////////////////////////////////////////////////////////
    // VALIDAR EVENTO SOPORTADO
    /////////////////////////////////////////////////////////////

    if (

        !EVENTOS_PERMITIDOS.includes(
            event
        )

    ) {

        return res.status(
            400
        ).json({

            success: false,

            message:
                "Evento no soportado"

        });
    }


    /////////////////////////////////////////////////////////////
    // OBTENER ID
    /////////////////////////////////////////////////////////////

    const contactId =

        obtenerContactId(
            data
        );


    if (

        !contactId ||

        !validator.isNumeric(
            contactId
        )

    ) {

        return res.status(
            400
        ).json({

            success: false,

            message:
                "ID de contacto inválido"

        });
    }


    /////////////////////////////////////////////////////////////
    // ELIMINAR CONTACTO
    /////////////////////////////////////////////////////////////

    if (

        event ===

        "ONCRMCONTACTDELETE"

    ) {


        await eliminarCliente(
            contactId
        );


        console.log(

            "CLIENTE ELIMINADO:",

            contactId

        );


        return res.status(
            200
        ).json({

            success: true,

            message:
                "Cliente eliminado correctamente",

            bitrix_id:
                Number(
                    contactId
                )

        });
    }


    /////////////////////////////////////////////////////////////
    // OBTENER CONTACTO COMPLETO
    /////////////////////////////////////////////////////////////

    const contacto =

        await obtenerContactoBitrix(
            contactId
        );


    if (

        !contacto ||

        typeof contacto !== "object"

    ) {

        return res.status(
            404
        ).json({

            success: false,

            message:
                "Contacto no encontrado"

        });
    }


    /////////////////////////////////////////////////////////////
    // MAPEAR CLIENTE
    /////////////////////////////////////////////////////////////

    const cliente =

        mapearContacto(
            contacto
        );


    /////////////////////////////////////////////////////////////
    // LOG PROFESIONAL DE DIAGNÓSTICO
    /////////////////////////////////////////////////////////////

    console.log(

        "BITRIX CONTACTO RECIBIDO:",

        {

            id:
                cliente.bitrix_id,

            nombre:
                cliente.nombre,

            apellido:
                cliente.apellido,

            campoDui:
                CAMPO_DUI_BITRIX,

            duiRecibido:
                contacto[
                    CAMPO_DUI_BITRIX
                ] || null,

            duiNormalizado:
                cliente.dui

        }

    );


    /////////////////////////////////////////////////////////////
    // VALIDAR CORREO
    /////////////////////////////////////////////////////////////

    if (

        cliente.correo &&

        !validator.isEmail(
            cliente.correo
        )

    ) {

        return res.status(
            400
        ).json({

            success: false,

            message:
                "Correo inválido"

        });
    }


    /////////////////////////////////////////////////////////////
    // BUSCAR CLIENTE
    /////////////////////////////////////////////////////////////

    const existe =

        await buscarClientePorBitrixId(

            cliente.bitrix_id

        );


    /////////////////////////////////////////////////////////////
    // INSERTAR
    /////////////////////////////////////////////////////////////

    if (
        !existe
    ) {


        await upsertCliente(
            cliente
        );


        console.log(

            "CLIENTE INSERTADO:",

            cliente.bitrix_id,

            "DUI:",

            cliente.dui

        );


    }


    /////////////////////////////////////////////////////////////
    // ACTUALIZAR
    /////////////////////////////////////////////////////////////

    else {


        await actualizarCliente(

            cliente.bitrix_id,

            cliente

        );


        console.log(

            "CLIENTE ACTUALIZADO:",

            cliente.bitrix_id,

            "DUI:",

            cliente.dui

        );

    }


    /////////////////////////////////////////////////////////////
    // RESPUESTA
    /////////////////////////////////////////////////////////////

    return res.status(
        200
    ).json({

        success: true,

        message:

            existe

                ? "Cliente actualizado correctamente"

                : "Cliente insertado correctamente",

        data: {

            bitrix_id:
                cliente.bitrix_id,

            dui:
                cliente.dui

        }

    });


} catch (
    error
) {


    console.error(

        "BITRIX ERROR FULL:",

        {

            message:
                error.message,

            response:
                error.response?.data ||
                null,

            status:
                error.response?.status ||
                null,

            url:
                error.config?.url ||
                null,

            stack:
                error.stack

        }

    );


    if (

        error.message.includes(
            "DUI inválido"
        )

    ) {

        return res.status(
            400
        ).json({

            success: false,

            message:
                error.message

        });
    }


    return res.status(
        500
    ).json({

        success: false,

        message:
            "Error procesando webhook Bitrix24",

        error:
            error.message

    });

}

};