import validator from "validator";
import { pool } from "../config/db.js";

///////////////////////////////////////////////////////////
// BUSCAR POR BITRIX ID
///////////////////////////////////////////////////////////

export const buscarClientePorBitrixId =
async (bitrixId) => {

    const sql = `
        SELECT *
        FROM pro_clientes
        WHERE bitrix_id = ?
        LIMIT 1
    `;

    const [rows] =
        await pool.query(
            sql,
            [Number(bitrixId)]
        );

    return rows.length
        ? rows[0]
        : null;
};

///////////////////////////////////////////////////////////
// BUSCAR POR ID
///////////////////////////////////////////////////////////

export const buscarClientePorId =
async (id) => {

    const sql = `
        SELECT *
        FROM pro_clientes
        WHERE id_pro_clientes = ?
        LIMIT 1
    `;

    const [rows] =
        await pool.query(
            sql,
            [Number(id)]
        );

    return rows.length
        ? rows[0]
        : null;
};

///////////////////////////////////////////////////////////
// UPSERT CLIENTE
///////////////////////////////////////////////////////////

export const upsertCliente =
async ({
    bitrix_id,
    nombre,
    apellido,
    correo,
    telefono
}) => {

    if (!bitrix_id) {
        throw new Error(
            "bitrix_id requerido"
        );
    }

    if (
        correo &&
        !validator.isEmail(correo)
    ) {
        throw new Error(
            "Correo inválido"
        );
    }

    const sql = `
        INSERT INTO pro_clientes
        (
            bitrix_id,
            pri_nombre,
            pri_apellido,
            correo,
            telefono
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?
        )

        ON DUPLICATE KEY UPDATE

        pri_nombre =
            VALUES(pri_nombre),

        pri_apellido =
            VALUES(pri_apellido),

        correo =
            VALUES(correo),

        telefono =
            VALUES(telefono),

        updated_at =
            NOW()
    `;

    const values = [

        Number(bitrix_id),

        nombre || "",

        apellido || "",

        correo || "",

        telefono || ""
    ];

    const [result] =
        await pool.query(
            sql,
            values
        );

    return result;
};

///////////////////////////////////////////////////////////
// ELIMINAR
///////////////////////////////////////////////////////////

export const eliminarCliente =
async (id) => {

    const sql = `
        DELETE
        FROM pro_clientes
        WHERE id_pro_clientes = ?
    `;

    const [result] =
        await pool.query(
            sql,
            [Number(id)]
        );

    return result;
};