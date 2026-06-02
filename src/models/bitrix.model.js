import { pool } from "../../config/db.js";

////////////////////////////////////////////////////////////
// MODELO BITRIX24
////////////////////////////////////////////////////////////

/**
 * Buscar cliente por Bitrix ID
 */
export const buscarClientePorBitrixId = async (bitrixId) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM clientes
        WHERE bitrix_id = ?
        LIMIT 1
        `,
        [bitrixId]
    );

    return rows[0] || null;
};

////////////////////////////////////////////////////////////

/**
 * Buscar cliente por correo
 */
export const buscarClientePorCorreo = async (correo) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM clientes
        WHERE email = ?
        LIMIT 1
        `,
        [correo]
    );

    return rows[0] || null;
};

////////////////////////////////////////////////////////////

/**
 * Insertar cliente
 */
export const insertarCliente = async (cliente) => {

    const {
        bitrix_id,
        nombre,
        apellido,
        telefono,
        email
    } = cliente;

    const [result] = await pool.query(
        `
        INSERT INTO clientes (
            bitrix_id,
            nombre,
            apellido,
            telefono,
            email
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            bitrix_id,
            nombre,
            apellido,
            telefono,
            email
        ]
    );

    return result.insertId;
};

////////////////////////////////////////////////////////////

/**
 * Actualizar cliente
 */
export const actualizarCliente = async (id, cliente) => {

    const {
        nombre,
        apellido,
        telefono,
        email
    } = cliente;

    const [result] = await pool.query(
        `
        UPDATE clientes
        SET
            nombre = ?,
            apellido = ?,
            telefono = ?,
            email = ?
        WHERE id = ?
        `,
        [
            nombre,
            apellido,
            telefono,
            email,
            id
        ]
    );

    return result.affectedRows;
};

////////////////////////////////////////////////////////////

/**
 * Obtener todos los clientes
 */
export const obtenerClientesDB = async () => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM clientes
        ORDER BY id DESC
        `
    );

    return rows;
};

////////////////////////////////////////////////////////////

/**
 * Obtener cliente por ID
 */
export const obtenerClientePorIdDB = async (id) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM clientes
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );

    return rows[0] || null;
};

////////////////////////////////////////////////////////////

/**
 * Eliminar cliente
 */
export const eliminarClienteDB = async (id) => {

    const [result] = await pool.query(
        `
        DELETE FROM clientes
        WHERE id = ?
        `,
        [id]
    );

    return result.affectedRows;
};