import { pool } from "../config/db.js";

///////////////////////////////////////////////////////////
// BUSCAR CLIENTE POR BITRIX ID
///////////////////////////////////////////////////////////

export const buscarClientePorBitrixId = async (bitrixId) => {

    try {

        ///////////////////////////////////////////////////
        // VALIDAR EXISTENCIA
        ///////////////////////////////////////////////////

        if (
            bitrixId === undefined ||
            bitrixId === null
        ) {
            throw new Error(
                "El bitrixId es requerido"
            );
        }

        ///////////////////////////////////////////////////
        // VALIDAR NUMÉRICO
        ///////////////////////////////////////////////////

        if (
            isNaN(Number(bitrixId))
        ) {
            throw new Error(
                "El bitrixId debe ser numérico"
            );
        }

        ///////////////////////////////////////////////////
        // NORMALIZAR
        ///////////////////////////////////////////////////

        const bitrixIdNumber =
            Number(bitrixId);

        ///////////////////////////////////////////////////
        // QUERY MYSQL
        ///////////////////////////////////////////////////

        const sql = `
            SELECT
                id,
                bitrix_id,
                pri_nombre,
                pri_apellido,
                correo,
                telefono,
                created_at,
                updated_at
            FROM pro_clientes
            WHERE bitrix_id = ?
            LIMIT 1
        `;

        ///////////////////////////////////////////////////

        const [rows] = await pool.query(
            sql,
            [bitrixIdNumber]
        );

        ///////////////////////////////////////////////////

        if (!rows || rows.length === 0) {
            return null;
        }

        ///////////////////////////////////////////////////

        return rows[0];

    } catch (error) {

        ///////////////////////////////////////////////////

        console.error(
            "ERROR BUSCAR CLIENTE POR BITRIX ID:",
            error
        );

        ///////////////////////////////////////////////////

        throw new Error(
            error.message ||
            "Error al buscar cliente"
        );
    }
};

///////////////////////////////////////////////////////////
// INSERTAR
///////////////////////////////////////////////////////////

export const insertarCliente = async ({
    bitrix_id,
    nombre,
    apellido,
    correo,
    telefono
}) => {

    try {

        if (!bitrix_id) {
            throw new Error("bitrix_id requerido");
        }

        const [rows] = await pool.query(
            "SELECT id FROM pro_clientes WHERE correo = ?",
            [correo]
        );

        if (rows.length > 0) {
            throw new Error("Cliente ya existe");
        }

        const sql = `
            INSERT INTO pro_clientes (
                bitrix_id,
                pri_nombre,
                pri_apellido,
                correo,
                telefono
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        const values = [
            bitrix_id,
            nombre,
            apellido,
            correo,
            telefono
        ];

        const [result] = await pool.query(sql, values);

//        return result.insertId;
        return {
            ok: true,
            insertId: result.insertId
        };

    } catch (error) {

        console.error("ERROR MYSQL:", error);

        throw error;
    }
};

///////////////////////////////////////////////////////////
// BUSCAR POR ID
///////////////////////////////////////////////////////////

export const buscarClientePorId = async (id) => {

    ///////////////////////////////////////////////////

    if (!id) {
        throw new Error(
            "El ID es requerido"
        );
    }

    ///////////////////////////////////////////////////

    if (isNaN(Number(id))) {
        throw new Error(
            "El ID debe ser numérico"
        );
    }

    ///////////////////////////////////////////////////

    const sql = `
        SELECT
            id,
            bitrix_id,
            pri_nombre,
            pri_apellido,
            correo,
            telefono,
            created_at,
            updated_at
        FROM pro_clientes
        WHERE id = ?
        LIMIT 1
    `;

    ///////////////////////////////////////////////////

    const [rows] = await pool.query(
        sql,
        [Number(id)]
    );

    ///////////////////////////////////////////////////

    return rows[0] || null;
};

///////////////////////////////////////////////////////////
// ACTUALIZAR
///////////////////////////////////////////////////////////

export const actualizarCliente = async (id, cliente) => {

    ///////////////////////////////////////////////////
    // VALIDAR ID
    ///////////////////////////////////////////////////

    if (!id) {
        throw new Error(
            "El ID es requerido"
        );
    }

    ///////////////////////////////////////////////////

    if (isNaN(Number(id))) {
        throw new Error(
            "El ID debe ser numérico"
        );
    }

    ///////////////////////////////////////////////////
    // VALIDAR OBJETO
    ///////////////////////////////////////////////////

    if (!cliente) {
        throw new Error(
            "Los datos del cliente son requeridos"
        );
    }

    ///////////////////////////////////////////////////

    const sql = `
        UPDATE pro_clientes
        SET
            pri_nombre = ?,
            pri_apellido = ?,
            correo = ?,
            telefono = ?,
            updated_at = NOW()
        WHERE id = ?
    `;

    ///////////////////////////////////////////////////

    const values = [
        cliente.nombre || "",
        cliente.apellido || "",
        cliente.correo || "",
        cliente.telefono || "",
        Number(id)
    ];

    ///////////////////////////////////////////////////

    const [result] =
        await pool.query(sql, values);

    ///////////////////////////////////////////////////
    // VALIDAR UPDATE
    ///////////////////////////////////////////////////

    if (result.affectedRows === 0) {

        throw new Error(
            "Cliente no encontrado"
        );
    }

    ///////////////////////////////////////////////////

    return {
        success: true,
        affectedRows:
            result.affectedRows,
        changedRows:
            result.changedRows
    };
};

///////////////////////////////////////////////////////////
// ELIMINAR
///////////////////////////////////////////////////////////

export const eliminarCliente = async (id) => {

    try {

        ///////////////////////////////////////////////////
        // VALIDAR ID
        ///////////////////////////////////////////////////

        if (!id) {

            throw new Error(
                "El ID es requerido"
            );
        }

        ///////////////////////////////////////////////////

        if (isNaN(Number(id))) {

            throw new Error(
                "El ID debe ser numérico"
            );
        }

        ///////////////////////////////////////////////////

        const sql = `
            DELETE FROM pro_clientes
            WHERE id = ?
        `;

        ///////////////////////////////////////////////////

        const [result] =
            await pool.query(
                sql,
                [Number(id)]
            );

        ///////////////////////////////////////////////////
        // VALIDAR ELIMINACIÓN
        ///////////////////////////////////////////////////

        if (result.affectedRows === 0) {

            throw new Error(
                "Cliente no encontrado"
            );
        }

        ///////////////////////////////////////////////////

        return {
            success: true,
            message:
                "Cliente eliminado correctamente",
            affectedRows:
                result.affectedRows
        };

    } catch (error) {

        ///////////////////////////////////////////////////

        console.error(
            "ERROR ELIMINAR CLIENTE:",
            error
        );

        ///////////////////////////////////////////////////

        throw new Error(
            error.message ||
            "Error al eliminar cliente"
        );
    }
};