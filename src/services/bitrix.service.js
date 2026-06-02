import axios from "axios";
import { BITRIX_WEBHOOK_IN } from "../config/bitrix.js";

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

///////////////////////////////////////////////////////////

export const bitrixRequest = async (
    method,
    data = {}
) => {

    try {

        const url =
            `${BITRIX_WEBHOOK_IN}${method}.json`;

        const response =
            await axios.post(url, data);

        if (response.data.error) {
            throw new Error(
                response.data.error_description
            );
        }

        return response.data.result;

    } catch (error) {

        console.error(
            "BITRIX ERROR:",
            error.response?.data || error.message
        );

        throw error;
    }
};

///////////////////////////////////////////////////////////
// GET CONTACT
///////////////////////////////////////////////////////////

export const obtenerContactoBitrix =
    async (id) => {

        return await bitrixRequest(
            "crm.contact.get",
            {
                id: Number(id)
            }
        );
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