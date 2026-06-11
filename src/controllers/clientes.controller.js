/////////////////////////////
// clientes.controller.js
/////////////////////////////
import { pool } from "../config/db.js";

import {
    buscarClientePorBitrixId,
    buscarClientePorCorreo,
    upsertCliente,
    actualizarCliente
} from "../services/mysql.service.js";

import {
    obtenerContactoBitrix,
    crearContactoBitrix
} from "../services/bitrix.service.js";

/////////////////////////////////////////////////////////////
// CREAR CLIENTE MYSQL -> BITRIX
/////////////////////////////////////////////////////////////

export const crearCliente = async (req, res) => {

    try {

        const {
            nombre,
            apellido,
            correo,
            telefono
        } = req.body;

        /////////////////////////////////////////////////////
        // CREAR EN BITRIX
        /////////////////////////////////////////////////////

        const bitrix_id =
            await crearContactoBitrix({
                nombre,
                apellido,
                correo,
                telefono
            });

        /////////////////////////////////////////////////////
        // INSERTAR MYSQL
        /////////////////////////////////////////////////////

        await pool.query(
            `
            INSERT INTO pro_clientes
            (
                pri_nombre,
                pri_apellido,
                correo,
                telefono,
                bitrix_id
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                nombre,
                apellido,
                correo,
                telefono,
                bitrix_id
            ]
        );

        return res.json({
            success: true
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/////////////////////////////////////////////////////////////
// ACTUALIZAR MYSQL -> BITRIX
/////////////////////////////////////////////////////////////

export const actualizarClienteMysql = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const {
            nombre,
            apellido,
            correo,
            telefono
        } = req.body;

        /////////////////////////////////////////////////////
        // OBTENER CLIENTE
        /////////////////////////////////////////////////////

        const [rows] = await pool.query(
            `
            SELECT * FROM pro_clientes
            WHERE id = ?
            `,
            [id]
        );

        if (!rows.length) {

            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado"
            });
        }

        const cliente = rows[0];

        /////////////////////////////////////////////////////
        // ACTUALIZAR MYSQL
        /////////////////////////////////////////////////////

        await pool.query(
            `
            UPDATE pro_clientes
            SET
                pri_nombre = ?,
                pri_apellido = ?,
                correo = ?,
                telefono = ?
            WHERE id = ?
            `,
            [
                nombre,
                apellido,
                correo,
                telefono,
                id
            ]
        );

        /////////////////////////////////////////////////////
        // ACTUALIZAR BITRIX
        /////////////////////////////////////////////////////

        await actualizarContactoBitrix(
            cliente.bitrix_id,
            {
                nombre,
                apellido,
                correo,
                telefono
            }
        );

        return res.json({
            success: true
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
