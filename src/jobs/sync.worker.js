import {
    obtenerEventosPendientes,
    marcarProcesando,
    marcarDone,
    marcarFailed
}
from "../services/webhook.service.js";

import {
    obtenerContactoBitrix
}
from "../services/bitrix.service.js";

import {
    upsertCliente
}
from "../services/mysql.service.js";

///////////////////////////////////////////////////////////

const procesarContacto =
async (entityId) => {

    const contacto =
        await obtenerContactoBitrix(
            entityId
        );

    if (!contacto) {

        throw new Error(
            `Contacto ${entityId} no encontrado en Bitrix`
        );
    }

    ///////////////////////////////////////////////////////

    await upsertCliente({

        bitrix_id:
            Number(contacto.ID),

        nombre:
            contacto.NAME?.trim() || "",

        apellido:
            contacto.LAST_NAME?.trim() || "",

        correo:
            contacto.EMAIL?.[0]?.VALUE?.trim() || "",

        telefono:
            contacto.PHONE?.[0]?.VALUE?.trim() || ""
    });

    ///////////////////////////////////////////////////////

    console.log(
        `CONTACTO ${contacto.ID} SINCRONIZADO`
    );
};

///////////////////////////////////////////////////////////

const procesarEvento =
async (evento) => {

    try {

        await marcarProcesando(
            evento.id
        );

        ///////////////////////////////////////////////////
        // CONTACTOS
        ///////////////////////////////////////////////////

        if (
            evento.entity_type ===
            "CONTACT"
        ) {

            await procesarContacto(
                evento.entity_id
            );
        }

        ///////////////////////////////////////////////////

        await marcarDone(
            evento.id
        );

    } catch (error) {

        console.error(

            `ERROR EVENTO ${evento.id}:`,

            error.message
        );

        await marcarFailed(
            evento.id
        );
    }
};

///////////////////////////////////////////////////////////

const worker =
async () => {

    try {

        console.log("WORKER EJECUTANDO...");
        const eventos =
            await obtenerEventosPendientes();

        if (
            eventos.length === 0
        ) {
            return;
        }

        console.log(
                "EVENTOS ENCONTRADOS:",
                eventos.length
        );
        ///////////////////////////////////////////////////

        console.log(

            `EVENTOS PENDIENTES: ${eventos.length}`
        );

        ///////////////////////////////////////////////////

        for (
            const evento
            of eventos
        ) {

            await procesarEvento(
                evento
            );
        }

    } catch (error) {

        console.error(

            "WORKER ERROR:",

            error.message
        );
    }
};

///////////////////////////////////////////////////////////

export const iniciarWorker = () => {

    console.log(
        "SYNC WORKER STARTED"
    );

    ///////////////////////////////////////////////////

    setInterval(

        worker,

        5000
    );
};