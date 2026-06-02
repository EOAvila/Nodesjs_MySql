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
// INSERTAR CLIENTE EN MYSQL
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
////////////////////////////////////////////////////////////

export const buscarClientePorId = async (
    id
) => {

    try {

        ////////////////////////////////////////////////////

        if (
            id === undefined ||
            id === null
        ) {
            throw new Error(
                "El ID es obligatorio"
            );
        }

        ////////////////////////////////////////////////////

        const numericId = Number(id);

        ////////////////////////////////////////////////////

        if (
            !Number.isInteger(numericId) ||
            numericId <= 0
        ) {
            throw new Error(
                "El ID debe ser un número entero positivo"
            );
        }

        ////////////////////////////////////////////////////

        const sql = `
            SELECT *
            FROM pro_clientes
            WHERE id = ?
            LIMIT 1
        `;

        ////////////////////////////////////////////////////

        const [rows] = await pool.query(
            sql,
            [numericId]
        );

        ////////////////////////////////////////////////////

        if (!Array.isArray(rows)) {
            throw new Error(
                "Respuesta inválida de MySQL"
            );
        }

        ////////////////////////////////////////////////////

        return rows.length > 0
            ? rows[0]
            : null;

    } catch (error) {

        ////////////////////////////////////////////////////

        console.error(
            "ERROR BUSCAR CLIENTE POR ID:",
            {
                id,
                message: error.message
            }
        );

        ////////////////////////////////////////////////////

        throw new Error(
            error.message ||
            "Error al buscar cliente"
        );
    }
};


///////////////////////////////////////////////////////////
// ACTUALIZAR CLIENTE EN MYSQL
///////////////////////////////////////////////////////////

export const actualizarCliente = async (
    id,
    cliente
) => {

    try {

        ////////////////////////////////////////////////////
        // VALIDAR ID
        ////////////////////////////////////////////////////

        const numericId = Number(id);

        ////////////////////////////////////////////////////

        if (
            !Number.isInteger(numericId) ||
            numericId <= 0
        ) {
            throw new Error(
                "El ID es inválido"
            );
        }

        ////////////////////////////////////////////////////
        // VALIDAR OBJETO
        ////////////////////////////////////////////////////

        if (
            !cliente ||
            typeof cliente !== "object" ||
            Array.isArray(cliente)
        ) {
            throw new Error(
                "Los datos del cliente son inválidos"
            );
        }

        ////////////////////////////////////////////////////
        // LIMPIAR DATOS
        ////////////////////////////////////////////////////

        const nombre =
            cliente.nombre?.trim() || "";

        const apellido =
            cliente.apellido?.trim() || "";

        const correo =
            cliente.correo?.trim() || "";

        const telefono =
            cliente.telefono?.trim() || "";

        ////////////////////////////////////////////////////
        // VALIDAR EMAIL
        ////////////////////////////////////////////////////

        if (
            correo &&
            !validator.isEmail(correo)
        ) {
            throw new Error(
                "El correo electrónico es inválido"
            );
        }

        ////////////////////////////////////////////////////

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

        ////////////////////////////////////////////////////

        const values = [
            nombre,
            apellido,
            correo,
            telefono,
            numericId
        ];

        ////////////////////////////////////////////////////

        const [result] = await pool.query(
            sql,
            values
        );

        ////////////////////////////////////////////////////

        if (
            !result ||
            result.affectedRows === 0
        ) {
            throw new Error(
                "Cliente no encontrado"
            );
        }

        ////////////////////////////////////////////////////

        return {
            success: true,
            message:
                "Cliente actualizado correctamente",
            affectedRows:
                result.affectedRows
        };

    } catch (error) {

        ////////////////////////////////////////////////////

        console.error(
            "ERROR ACTUALIZAR CLIENTE:",
            {
                id,
                message: error.message
            }
        );

        ////////////////////////////////////////////////////

        throw new Error(
            error.message ||
            "Error al actualizar cliente"
        );
    }
};

///////////////////////////////////////////////////////////
// ELIMINAR CLIENTE EN MYSQL
///////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////

export const eliminarCliente = async (
    id
) => {

    try {

        ////////////////////////////////////////////////////
        // VALIDAR ID
        ////////////////////////////////////////////////////

        const numericId = Number(id);

        ////////////////////////////////////////////////////

        if (
            !Number.isInteger(numericId) ||
            numericId <= 0
        ) {
            throw new Error(
                "El ID es inválido"
            );
        }

        const cliente =
               await buscarClientePorId(id);

        if (!cliente) {
            throw new Error(
                "Cliente no existe"
            );
        }

        ////////////////////////////////////////////////////

        const sql = `
            DELETE FROM pro_clientes
            WHERE id = ?
            LIMIT 1
        `;

        ////////////////////////////////////////////////////

        const [result] = await pool.query(
            sql,
            [numericId]
        );

        ////////////////////////////////////////////////////
        // VALIDAR RESPUESTA MYSQL
        ////////////////////////////////////////////////////

        if (!result) {

            throw new Error(
                "Respuesta inválida de MySQL"
            );
        }

        ////////////////////////////////////////////////////
        // VALIDAR ELIMINACIÓN
        ////////////////////////////////////////////////////

        if (result.affectedRows === 0) {

            throw new Error(
                "Cliente no encontrado"
            );
        }

        ////////////////////////////////////////////////////

        return {
            success: true,
            message:
                "Cliente eliminado correctamente",
            affectedRows:
                result.affectedRows
        };

    } catch (error) {

        ////////////////////////////////////////////////////

        console.error(
            "ERROR ELIMINAR CLIENTE:",
            {
                id,
                message: error.message
            }
        );

        ////////////////////////////////////////////////////

        throw new Error(
            error.message ||
            "Error al eliminar cliente"
        );
    }
};