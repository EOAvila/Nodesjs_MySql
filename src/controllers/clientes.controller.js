// src/controllers/clientes.controller.js
import validator from "validator";
//////////////////////////////////
import {
    upsertCliente,
    eliminarCliente,
    buscarClientePorId,
    upsertDeal,
    upsertLead,
    upsertCompany,
    upsertProducto
}
from "../services/mysql.service.js";
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
import {
    obtenerContactoBitrix,
    obtenerDealBitrix,
    obtenerLeadBitrix,
    obtenerCompanyBitrix,
    obtenerProductoBitrix
}
from "../services/bitrix.service.js";
/////////////////////////////////////////

/////////////////////////////////////////
export const procesarEntidadBitrix =
async (entityType, entityId) => {

    switch(entityType) {

        case "CONTACT":

            const contacto =
                await obtenerContactoBitrix(entityId);

            await upsertCliente(contacto);

            break;

        case "DEAL":

            const deal =
                await obtenerDealBitrix(entityId);

            await upsertDeal(deal);

            break;

        case "LEAD":

            const lead =
                await obtenerLeadBitrix(entityId);

            await upsertLead(lead);

            break;

        case "COMPANY":

            const company =
                await obtenerCompanyBitrix(entityId);

            await upsertCompany(company);

            break;

        case "PRODUCT":

            const producto =
                await obtenerProductoBitrix(entityId);

            await upsertProducto(producto);

            break;
    }
};
//////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////
// INSERTAR CLIENTE
///////////////////////////////////////////////////////////

export const insertarClienteController = async (req, res) => {

    try {

        const {
            nombre,
            apellido,
            correo,
            telefono
        } = req.body;

        ///////////////////////////////////////////////////

        if (!nombre || !apellido) {

            return res.status(400).json({
                success: false,
                message: "Nombre y apellido son obligatorios"
            });
        }

        ///////////////////////////////////////////////////

        if (
            correo &&
            !validator.isEmail(correo)
        ) {

            return res.status(400).json({
                success: false,
                message: "Correo inválido"
            });
        }

        ///////////////////////////////////////////////////
        // CREAR EN BITRIX
        ///////////////////////////////////////////////////
/*
        const bitrixId =
            await crearContactoBitrix({

                nombre,
                apellido,
                correo,
                telefono
            });
*/
        ///////////////////////////////////////////////////
        // GUARDAR EN MYSQL
        ///////////////////////////////////////////////////

        await upsertCliente({

            bitrix_id: Number(bitrixId),

            nombre,

            apellido,

            correo,

            telefono
        });

        ///////////////////////////////////////////////////

        return res.status(201).json({

            success: true,

            message:
                "Cliente creado correctamente",

            bitrix_id:
                bitrixId
        });

    } catch (error) {

        console.error(
            "ERROR INSERTAR CLIENTE:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message
        });
    }
};

///////////////////////////////////////////////////////////
// ACTUALIZAR CLIENTE
///////////////////////////////////////////////////////////

export const actualizarClienteController =
async (req, res) => {

    try {

        const { id } = req.params;

        ///////////////////////////////////////////////////

        if (
            !validator.isNumeric(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "ID inválido"
            });
        }

        ///////////////////////////////////////////////////

        const cliente =
            await buscarClientePorId(id);

        if (!cliente) {

            return res.status(404).json({

                success: false,

                message:
                    "Cliente no encontrado"
            });
        }

        ///////////////////////////////////////////////////

        const {

            nombre,

            apellido,

            correo,

            telefono

        } = req.body;

        ///////////////////////////////////////////////////

        if (
            correo &&
            !validator.isEmail(correo)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Correo inválido"
            });
        }

        ///////////////////////////////////////////////////
        // ACTUALIZAR BITRIX
        ///////////////////////////////////////////////////

        await actualizarContactoBitrix(

            cliente.bitrix_id,

            {
                nombre,
                apellido,
                correo,
                telefono
            }
        );

        ///////////////////////////////////////////////////
        // UPSERT MYSQL
        ///////////////////////////////////////////////////

        await upsertCliente({

            bitrix_id:
                cliente.bitrix_id,

            nombre:
                nombre ??
                cliente.pri_nombre,

            apellido:
                apellido ??
                cliente.pri_apellido,

            correo:
                correo ??
                cliente.correo,

            telefono:
                telefono ??
                cliente.telefono
        });

        ///////////////////////////////////////////////////

        return res.status(200).json({

            success: true,

            message:
                "Cliente actualizado correctamente"
        });

    } catch (error) {

        console.error(
            "ERROR ACTUALIZAR CLIENTE:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message
        });
    }
};

///////////////////////////////////////////////////////////
// ELIMINAR CLIENTE
///////////////////////////////////////////////////////////

export const eliminarClienteController =
async (req, res) => {

    try {

        const { id } = req.params;

        ///////////////////////////////////////////////////

        if (
            !validator.isNumeric(id)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "ID inválido"
            });
        }

        ///////////////////////////////////////////////////

        const cliente =
            await buscarClientePorId(id);

        if (!cliente) {

            return res.status(404).json({

                success: false,

                message:
                    "Cliente no encontrado"
            });
        }

        ///////////////////////////////////////////////////
        // ELIMINAR BITRIX
        ///////////////////////////////////////////////////

        await eliminarContactoBitrix(
            cliente.bitrix_id
        );

        ///////////////////////////////////////////////////
        // ELIMINAR MYSQL
        ///////////////////////////////////////////////////

        await eliminarCliente(id);

        ///////////////////////////////////////////////////

        return res.status(200).json({

            success: true,

            message:
                "Cliente eliminado correctamente"
        });

    } catch (error) {

        console.error(
            "ERROR ELIMINAR CLIENTE:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message
        });
    }
};
