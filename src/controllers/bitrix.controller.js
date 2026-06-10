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
export const recibirEventoBitrix = async (req, res) => {

    try {

        let entityType = null;
        let entityId = null;

        //////////////////////////////////////////////////////
        // BUSINESS PROCESS
        //////////////////////////////////////////////////////

        if (req.body.document_id) {

            const code = req.body.document_id[2];

            if (code.startsWith("DEAL_")) {
                entityType = "DEAL";
                entityId = Number(code.replace("DEAL_", ""));
            }

            else if (code.startsWith("CONTACT_")) {
                entityType = "CONTACT";
                entityId = Number(code.replace("CONTACT_", ""));
            }

            else if (code.startsWith("LEAD_")) {
                entityType = "LEAD";
                entityId = Number(code.replace("LEAD_", ""));
            }

            else if (code.startsWith("COMPANY_")) {
                entityType = "COMPANY";
                entityId = Number(code.replace("COMPANY_", ""));
            }

            else if (code.startsWith("PRODUCT_")) {
                entityType = "PRODUCT";
                entityId = Number(code.replace("PRODUCT_", ""));
            }
        }

        console.log({
            entityType,
            entityId
        });

        if (!entityType || !entityId) {

            return res.status(400).json({
                success: false,
                message: "Entidad no válida"
            });

        }

        await procesarEntidadBitrix(
            entityType,
            entityId
        );

        return res.json({
            success: true
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////
/*
export const recibirEventoBitrix = async (req, res) => {

    try {

        let event = null;
        let entityId = null;
        let entityType = null;

        ////////////////////////////////////////////////////
        // WEBHOOK CRM
        ////////////////////////////////////////////////////

        if (req.body.event) {

            event = req.body.event;

            entityId =
                req.body.data?.FIELDS?.ID ||
                req.body.data?.FIELDS?.CONTACT_ID ||
                req.body.data?.FIELDS?.COMPANY_ID;

        }

        ////////////////////////////////////////////////////
        // BUSINESS PROCESS / ROBOT
        ////////////////////////////////////////////////////

        else if (req.body.document_id) {

            const documentId = req.body.document_id;

            const code = documentId[2];

            if (code.startsWith("DEAL_")) {

                entityType = "DEAL";

                entityId = Number(
                    code.replace("DEAL_", "")
                );

            }

            if (code.startsWith("CONTACT_")) {

                entityType = "CONTACT";

                entityId = Number(
                    code.replace("CONTACT_", "")
                );

            }

            event = "BUSINESS_PROCESS";

        }

        console.log({
            event,
            entityType,
            entityId
        });

        if (!entityId) {

            return res.status(400).json({
                success: false,
                message: "Evento inválido"
            });

        }

        return res.json({
            success: true
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};
*/



/*
export const recibirEventoBitrix = async (req, res) => {

    console.log("================================");
    console.log("HEADERS");
    console.log(JSON.stringify(req.headers, null, 2));

    console.log("QUERY");
    console.log(JSON.stringify(req.query, null, 2));

    console.log("BODY");
    console.log(JSON.stringify(req.body, null, 2));

    console.log("================================");

    return res.status(200).json({
        success: true,
        recibido: true
    });
};
*/


///////////////////////////////////////////////////

/*export const recibirEventoBitrix =
async (req, res) => {

    try {

        console.log("================================");
        console.log("HEADERS");
        console.log(JSON.stringify(req.headers, null, 2));

        console.log("QUERY");
        console.log(JSON.stringify(req.query, null, 2));

        console.log("BODY");
        console.log(JSON.stringify(req.body, null, 2));

        console.log("================================");

//        console.log("HEADERS:", req.headers);
//        console.log("QUERY:", req.query);
//        console.log("BODY:", req.body);
//        
//        return res.status(200).json({
//            success: true,
//            query: req.query,
//            body: req.body
//        });

        const event =
            req.body.event ||
            req.query.event;

        const entityId =
            req.body.data?.FIELDS?.ID ||
            req.query.contact_id;

        console.log({
            event,
            entityId
        });
        //////////////////////////////////////////////////
        // Valida que el evento y el ID estén presentes //
        //////////////////////////////////////////////////
        if (!event || !entityId) {
            return res.status(400).json({
                success: false,
                message: "Evento inválido"
            });
        }

        let entityType = null;
        ///////////////////////////////////////////////////
        // CONTACTOS
        ///////////////////////////////////////////////////
        if (event.startsWith("ONCRMCONTACT")) {
            entityType = "CONTACT";
        }
        ///////////////////////////////////////////////////
        // LEAD
        ///////////////////////////////////////////////////
        if (event.startsWith("ONCRMLEAD")) {
            entityType = "LEAD";
        }
        ///////////////////////////////////////////////////
        // DEAL
        ///////////////////////////////////////////////////
        if (event.startsWith("ONCRMDEAL")) {
            entityType = "DEAL";
        }
        ///////////////////////////////////////////////////
        // COMPANY
        ///////////////////////////////////////////////////
        if (event.startsWith("ONCRMCOMPANY")) {
            entityType = "COMPANY";
        }
        ///////////////////////////////////////////////////
        // PRODUCT
        ///////////////////////////////////////////////////
        if (event.startsWith("ONCRMPRODUCT")) {
            entityType = "PRODUCT";
        }
        ///////////////////////////////////////////////////
        // GUARDAR EVENTO
        ///////////////////////////////////////////////////
        if (entityType) {

            await guardarEvento({
                entityType,
                entityId,
                eventType: event
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
*/


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