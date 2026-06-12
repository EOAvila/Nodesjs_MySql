////////////////////////////////////////////
// mysql.service.js
/////////////////////////////////////////////
import validator from "validator";
import { pool } from "../config/db.js";

/////////////////////////////////////////////////////////////
// BUSCAR CLIENTE EN MYSQL POR BITRIX ID
/////////////////////////////////////////////////////////////
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

/////////////////////////////////////////////////////////////
// BUSCAR CLIENTE EN MYSQL POR CORREO
/////////////////////////////////////////////////////////////

export const buscarClientePorCorreo = async (
    correo
) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM pro_clientes
        WHERE correo = ?
        LIMIT 1
        `,
        [correo]
    );

    return rows[0];
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

/*
/////////////////////////////////////////////////////////////
// INSERTAR CLIENTE
/////////////////////////////////////////////////////////////

export const insertarCliente = async (cliente) => {

    const [result] = await pool.query(
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
            cliente.nombre,
            cliente.apellido,
            cliente.correo,
            cliente.telefono,
            cliente.bitrix_id
        ]
    );

    return result;
};
*/

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


/////////////////////////////////////////////////////////////
// ACTUALIZAR CLIENTE
/////////////////////////////////////////////////////////////

export const actualizarCliente = async (
    bitrix_id,
    cliente
) => {

    await pool.query(
        `
        UPDATE pro_clientes
        SET
            pri_nombre = ?,
            pri_apellido = ?,
            correo = ?,
            telefono = ?
        WHERE bitrix_id = ?
        `,
        [
            cliente.nombre,
            cliente.apellido,
            cliente.correo,
            cliente.telefono,
            bitrix_id
        ]
    );
};
