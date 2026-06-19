import pool from "../../config/db.js";

////////////////////////////////////
// LISTAR INVENTARIO
////////////////////////////////////

export const listarInventario = async () => {

    const sql = `
        SELECT
            p.id,
            p.bitrix_id,
            p.nombre,
            p.precio,
            i.stock_actual,
            i.stock_minimo,
            i.stock_maximo
        FROM pro_productos p
        INNER JOIN pro_inventario i
            ON p.id = i.producto_id
        ORDER BY p.nombre
    `;

    const [rows] =
        await pool.query(sql);

    return rows;
};

////////////////////////////////////
// CREAR INVENTARIO INICIAL
////////////////////////////////////

export const crearInventarioInicial =
async (producto_id) => {

    const sql = `
        INSERT INTO pro_inventario
        (
            producto_id,
            stock_actual,
            stock_minimo,
            stock_maximo
        )
        VALUES
        (
            ?, 0, 0, 0
        )
    `;

    await pool.query(
        sql,
        [producto_id]
    );
};

//////////////////////////////////////////////////////
// OBTENER INVENTARIO
//////////////////////////////////////////////////////
export const obtenerInventarioService = 
async (producto_id) => {

    const sql = `
        SELECT
            i.id,
            i.producto_id,
            p.nombre,
            p.codigo,
            p.precio,
            i.stock_actual,
            i.stock_minimo,
            i.stock_maximo,
            i.fecha_actualizacion
        FROM inventarios i
        INNER JOIN productos p
            ON p.id = i.producto_id
        ORDER BY p.nombre
    `;

    const [rows] = await pool.query(sql);

    return rows;
};