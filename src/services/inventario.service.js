import pool from "../config/db.js";

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