import { pool } from "../../config/db.js";

////////////////////////////////////////////////////////////
// MODELO CLIENTES
////////////////////////////////////////////////////////////

/**
 * Obtener todos los clientes
 */
export const obtenerClientesDB = async () => {

    const [rows] = await pool.query(
        `
        SELECT
            id,
            bitrix_id,
            nombre,
            apellido,
            telefono,
            email,
            created_at
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
        SELECT
            id,
            bitrix_id,
            nombre,
            apellido,
            telefono,
            email,
            created_at
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
 * Crear cliente
 */
export const crearClienteDB = async (cliente) => {

    const {
        bitrix_id = null,
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
export const actualizarClienteDB = async (id, cliente) => {

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

////////////////////////////////////////////////////////////

/**
 * Buscar cliente por correo
 */
export const buscarClientePorCorreoDB = async (email) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM clientes
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );

    return rows[0] || null;
};

////////////////////////////////////////////////////////////

/**
 * Buscar cliente por Bitrix ID
 */
export const buscarClientePorBitrixIdDB = async (bitrixId) => {

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