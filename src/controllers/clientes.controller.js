// src/controllers/clientes.controller.js
import validator from "validator";

///////////////////////////////////////////////////////////

import {
    insertarCliente,
    actualizarCliente,
    eliminarCliente,
    buscarClientePorId
} from "../services/mysql.service.js";

///////////////////////////////////////////////////////////

import {
    crearContactoBitrix,
    actualizarContactoBitrix,
    eliminarContactoBitrix
} from "../services/bitrix.service.js";

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

        console.log(nombre);
        console.log(apellido);
        console.log(correo);
        console.log(telefono);

        res.send('Cliente recibido');

        ///////////////////////////////////////////////////

        if (!nombre || !apellido || !correo) {
            return res.status(400).json({
                success: false,
                message: "Datos incompletos"
            });
        }

        ///////////////////////////////////////////////////

        if (!validator.isEmail(correo)) {
            return res.status(400).json({
                success: false,
                message: "Correo inválido"
            });
        }

        ///////////////////////////////////////////////////
        // CREAR EN BITRIX
        ///////////////////////////////////////////////////

//        const bitrix = await crearContactoBitrix({
//            nombre,
//            apellido,
//            correo,
//            telefono
//        });

        ///////////////////////////////////////////////////

//      const clienteData = {
//            bitrix_id: bitrix,
//            nombre,
//            apellido,
//            correo,
//            telefono
//        };

        const clienteData = {
            bitrix_id: bitrix,
            nombre,
            apellido,
            correo,
            telefono
        };

        ///////////////////////////////////////////////////
        // INSERTAR MYSQL
        ///////////////////////////////////////////////////

        const clienteId = await insertarCliente(clienteData);

        ///////////////////////////////////////////////////

        return res.status(201).json({
            success: true,
            message: "Cliente creado correctamente",
            data: {
                id: clienteId,
                ...clienteData
            }
        });

    } catch (error) {

        console.error("ERROR INSERTAR CLIENTE:", error);

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

///////////////////////////////////////////////////////////
// ACTUALIZAR CLIENTE
///////////////////////////////////////////////////////////

export const actualizarClienteController = async (req, res) => {

    try {

        const { id } = req.params;

        ///////////////////////////////////////////////////

        if (!validator.isNumeric(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido"
            });
        }

        ///////////////////////////////////////////////////

        const cliente = await buscarClientePorId(id);

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado"
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

        if (correo && !validator.isEmail(correo)) {
            return res.status(400).json({
                success: false,
                message: "Correo inválido"
            });
        }

        ///////////////////////////////////////////////////
        // ACTUALIZAR BITRIX
        ///////////////////////////////////////////////////

        await actualizarContactoBitrix(cliente.bitrix_id, {
            nombre,
            apellido,
            correo,
            telefono
        });

        ///////////////////////////////////////////////////
        // ACTUALIZAR MYSQL
        ///////////////////////////////////////////////////

        await actualizarCliente(id, {
            nombre,
            apellido,
            correo,
            telefono
        });

        ///////////////////////////////////////////////////

        return res.status(200).json({
            success: true,
            message: "Cliente actualizado correctamente"
        });

    } catch (error) {

        console.error("ERROR ACTUALIZAR CLIENTE:", error);

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};

///////////////////////////////////////////////////////////
// ELIMINAR CLIENTE
///////////////////////////////////////////////////////////

export const eliminarClienteController = async (req, res) => {

    try {

        const { id } = req.params;

        ///////////////////////////////////////////////////

        if (!validator.isNumeric(id)) {
            return res.status(400).json({
                success: false,
                message: "ID inválido"
            });
        }

        ///////////////////////////////////////////////////

        const cliente = await buscarClientePorId(id);

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado"
            });
        }

        ///////////////////////////////////////////////////
        // ELIMINAR EN BITRIX
        ///////////////////////////////////////////////////

        await eliminarContactoBitrix(cliente.bitrix_id);

        ///////////////////////////////////////////////////
        // ELIMINAR MYSQL
        ///////////////////////////////////////////////////

        await eliminarCliente(id);

        ///////////////////////////////////////////////////

        return res.status(200).json({
            success: true,
            message: "Cliente eliminado correctamente"
        });

    } catch (error) {

        console.error("ERROR ELIMINAR CLIENTE:", error);

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};