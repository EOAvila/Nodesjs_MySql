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
crearContactoBitrix,
actualizarContactoBitrix
} from "../services/bitrix.service.js";

/////////////////////////////////////////////////////////////
// FUNCIÓN AUXILIAR
// NORMALIZAR DUI
/////////////////////////////////////////////////////////////

const normalizarDui = (dui) => {

if (
    dui === undefined ||
    dui === null
) {
    return null;
}

const duiTexto = String(dui).trim();

return duiTexto !== ""
    ? duiTexto
    : null;

};

/////////////////////////////////////////////////////////////
// CREAR CLIENTE MYSQL -> BITRIX
/////////////////////////////////////////////////////////////

export const crearCliente = async (req, res) => {

try {

    const {
        nombre,
        apellido,
        correo,
        telefono,
        dui
    } = req.body || {};

    if (!nombre) {

        return res.status(400).json({
            exito: false,
            mensaje: "El nombre es requerido"
        });
    }

    /////////////////////////////////////////////////////
    // NORMALIZAR DUI
    /////////////////////////////////////////////////////

    const duiNormalizado =
        normalizarDui(dui);

    /////////////////////////////////////////////////////
    // CREAR EN BITRIX
    /////////////////////////////////////////////////////

    const bitrix_id =
        await crearContactoBitrix({

            nombre,
            apellido,
            correo,
            telefono,
            dui: duiNormalizado

        });

    /////////////////////////////////////////////////////
    // INSERTAR MYSQL
    /////////////////////////////////////////////////////

    await upsertCliente({

        bitrix_id,
        nombre,
        apellido,
        correo,
        telefono,
        dui: duiNormalizado

    });

    /*
    await pool.query(
        `
        INSERT INTO pro_clientes
        (
            pri_nombre,
            pri_apellido,
            correo,
            telefono,
            dui,
            bitrix_id
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            nombre,
            apellido,
            correo,
            telefono,
            duiNormalizado,
            bitrix_id
        ]
    );
    */

    return res.json({

        success: true

    });

} catch (error) {

    console.error(
        "ERROR CREAR CLIENTE:"
    );

    console.error(error);

    if (error.response) {

        console.error(
            "BITRIX RESPONSE:",
            error.response.data
        );

        console.error(
            "BITRIX STATUS:",
            error.response.status
        );
    }

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
        telefono,
        dui

    } = req.body;

    /////////////////////////////////////////////////////
    // OBTENER CLIENTE
    /////////////////////////////////////////////////////

    const [rows] = await pool.query(

        `
        SELECT * FROM pro_clientes
        WHERE id_pro_clientes = ?
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
    // NORMALIZAR DUI
    /////////////////////////////////////////////////////

    const duiNormalizado =
        normalizarDui(dui);

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
            telefono = ?,
            dui = ?
        WHERE id_pro_clientes = ?
        `,

        [

            nombre,
            apellido,
            correo,
            telefono,
            duiNormalizado,
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
            telefono,
            dui: duiNormalizado

        }

    );

    return res.json({

        success: true

    });

} catch (error) {

    console.error(
        "ERROR ACTUALIZAR CLIENTE:"
    );

    console.error(error);

    if (error.response) {

        console.error(
            "BITRIX RESPONSE:",
            error.response.data
        );

        console.error(
            "BITRIX STATUS:",
            error.response.status
        );
    }

    return res.status(500).json({

        success: false,
        message: error.message

    });
}

};
