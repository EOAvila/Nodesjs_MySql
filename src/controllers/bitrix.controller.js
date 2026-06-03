// src/controllers/bitrix.controller.js
import {
    guardarEvento
} from "../services/webhook.service.js";

import {
    obtenerContactoBitrix
} from "../services/bitrix.service.js";

import {
    upsertCliente
} from "../services/mysql.service.js";


///////////////////////////////////////////////////

export const recibirEventoBitrix =
async (req, res) => {

    try {

        const event =
            req.body.event;

        const entityId =
            req.body.data?.FIELDS?.ID;

        if (
            !event ||
            !entityId
        ) {

            return res.status(400)
            .json({
                success:false,
                message:
                    "Evento inválido"
            });
        }

        ///////////////////////////////////////////////////
        // CONTACTOS
        ///////////////////////////////////////////////////

        if (
            event.startsWith(
                "ONCRMCONTACT"
            )
        ) {

            await guardarEvento({

                entityType:
                    "CONTACT",

                entityId,

                eventType:
                    event
            });
        }

        ///////////////////////////////////////////////////

        return res.status(200)
        .send("OK");

    } catch (error) {

        console.error(
            "WEBHOOK ERROR:",
            error
        );

        return res.status(500)
        .send();
    }
};

///////////////////////////////////////////////////////////

export const sincronizarContacto =
async (req, res) => {

    try {

        const { id } = req.params;

        const contacto =
            await obtenerContactoBitrix(id);

        await upsertCliente({

            bitrix_id:
                Number(contacto.ID),

            nombre:
                contacto.NAME || "",

            apellido:
                contacto.LAST_NAME || "",

            correo:
                contacto.EMAIL?.[0]?.VALUE || "",

            telefono:
                contacto.PHONE?.[0]?.VALUE || ""
        });

        return res.status(200).json({

            success: true,

            message:
                "Contacto sincronizado",

            bitrixId:
                contacto.ID
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message:
                error.message
        });
    }
};

console.log(
    "BITRIX CONTROLLER LOADED"
);