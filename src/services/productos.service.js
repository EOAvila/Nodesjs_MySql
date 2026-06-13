/////////////////////////////////////////////////////////////
// productos.service.js
/////////////////////////////////////////////////////////////

import validator from "validator";
import pool from "../config/db.js";

/////////////////////////////////////////////////////////////
// VALIDAR PRODUCTO
/////////////////////////////////////////////////////////////

const validarProducto = (producto) => {

    const errores = [];

    if (!producto.nombre?.trim()) {
        errores.push(
            "El nombre es obligatorio"
        );
    }

    if (
        producto.precio !== undefined &&
        (
            isNaN(producto.precio) ||
            Number(producto.precio) < 0
        )
    ) {
        errores.push(
            "Precio inválido"
        );
    }

    if (
        producto.moneda &&
        producto.moneda.length > 10
    ) {
        errores.push(
            "Moneda inválida"
        );
    }

    if (
        producto.descripcion &&
        producto.descripcion.length > 5000
    ) {
        errores.push(
            "Descripción demasiado larga"
        );
    }

    if (errores.length > 0) {
        throw new Error(
            errores.join(", ")
        );
    }
};

/////////////////////////////////////////////////////////////
// EXISTE PRODUCTO
/////////////////////////////////////////////////////////////

export const existeProducto =
async (bitrix_id) => {

    const sql = `
        SELECT id
        FROM pro_productos
        WHERE bitrix_id = ?
        LIMIT 1
    `;

    const [rows] =
        await pool.query(
            sql,
            [bitrix_id]
        );

    return rows.length > 0;
};

/////////////////////////////////////////////////////////////
// OBTENER PRODUCTO
/////////////////////////////////////////////////////////////

export const obtenerProducto =
async (bitrix_id) => {

    const sql = `
        SELECT *
        FROM pro_productos
        WHERE bitrix_id = ?
        LIMIT 1
    `;

    const [rows] =
        await pool.query(
            sql,
            [bitrix_id]
        );

    return rows[0] || null;
};

/////////////////////////////////////////////////////////////
// LISTAR PRODUCTOS
/////////////////////////////////////////////////////////////

export const listarProductos =
async () => {

    const sql = `
        SELECT *
        FROM pro_productos
        ORDER BY nombre
    `;

    const [rows] =
        await pool.query(sql);

    return rows;
};

/////////////////////////////////////////////////////////////
// INSERTAR PRODUCTO
/////////////////////////////////////////////////////////////

export const insertarProducto =
async (producto) => {

    validarProducto(producto);

    const sql = `
        INSERT INTO pro_productos
        (
            bitrix_id,
            nombre,
            descripcion,
            precio,
            moneda,
            categoria_id,
            activo
        )
        VALUES
        (
            ?, ?, ?, ?, ?, ?, ?
        )
    `;

    const [result] =
        await pool.query(
            sql,
            [
                producto.bitrix_id,
                producto.nombre,
                producto.descripcion || null,
                producto.precio || 0,
                producto.moneda || "USD",
                producto.categoria_id || null,
                producto.activo ?? true
            ]
        );

    return result.insertId;
};

/////////////////////////////////////////////////////////////
// ACTUALIZAR PRODUCTO
/////////////////////////////////////////////////////////////

export const actualizarProducto =
async (
    bitrix_id,
    producto
) => {

    validarProducto(producto);

    const sql = `
        UPDATE pro_productos
        SET
            nombre = ?,
            descripcion = ?,
            precio = ?,
            moneda = ?,
            categoria_id = ?,
            activo = ?
        WHERE bitrix_id = ?
    `;

    const [result] =
        await pool.query(
            sql,
            [
                producto.nombre,
                producto.descripcion || null,
                producto.precio || 0,
                producto.moneda || "USD",
                producto.categoria_id || null,
                producto.activo ?? true,
                bitrix_id
            ]
        );

    return result.affectedRows;
};

/////////////////////////////////////////////////////////////
// UPSERT PRODUCTO
/////////////////////////////////////////////////////////////

export const upsertProducto =
async (producto) => {

    validarProducto(producto);

    const sql = `
        INSERT INTO pro_productos
        (
            bitrix_id,
            nombre,
            descripcion,
            precio,
            moneda,
            categoria_id,
            activo
        )
        VALUES
        (
            ?, ?, ?, ?, ?, ?, ?
        )

        ON DUPLICATE KEY UPDATE

            nombre = VALUES(nombre),
            descripcion = VALUES(descripcion),
            precio = VALUES(precio),
            moneda = VALUES(moneda),
            categoria_id = VALUES(categoria_id),
            activo = VALUES(activo)
    `;

    const [result] =
        await pool.query(
            sql,
            [
                producto.bitrix_id,
                producto.nombre,
                producto.descripcion || null,
                producto.precio || 0,
                producto.moneda || "USD",
                producto.categoria_id || null,
                producto.activo ?? true
            ]
        );

    return result;
};

/////////////////////////////////////////////////////////////
// ELIMINAR PRODUCTO
/////////////////////////////////////////////////////////////

export const eliminarProducto =
async (bitrix_id) => {

    const sql = `
        DELETE FROM pro_productos
        WHERE bitrix_id = ?
    `;

    const [result] =
        await pool.query(
            sql,
            [bitrix_id]
        );

    return result.affectedRows;
};

/////////////////////////////////////////////////////////////
// CAMBIAR ESTADO
/////////////////////////////////////////////////////////////

export const cambiarEstadoProducto =
async (
    bitrix_id,
    activo
) => {

    const sql = `
        UPDATE pro_productos
        SET activo = ?
        WHERE bitrix_id = ?
    `;

    const [result] =
        await pool.query(
            sql,
            [
                activo,
                bitrix_id
            ]
        );

    return result.affectedRows;
};