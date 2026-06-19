///////////////////////////////////////////
// asociados.repository.js
///////////////////////////////////////////
import { pool } from "../config/database.js";

export async function findAll() {

    const [rows] = await pool.query(`
        SELECT *
        FROM bco_asociados
        ORDER BY id DESC
    `);

    return rows;
}

export async function findById(id) {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM bco_asociados
        WHERE id = ?
        `,
        [id]
    );

    return rows[0];
}

export async function findByBitrixId(bitrixId) {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM bco_asociados
        WHERE bitrix_id = ?
        `,
        [bitrixId]
    );

    return rows[0];
}

export async function create(asociado) {

    const [result] = await pool.query(
        `
        INSERT INTO bco_asociados
        (
            bitrix_id,
            codigo_asociado,
            dui,
            nit,
            nombres,
            apellidos,
            fecha_nacimiento,
            genero,
            estado_civil,
            profesion,
            fecha_ingreso,
            estado
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            asociado.bitrix_id,
            asociado.codigo_asociado,
            asociado.dui,
            asociado.nit,
            asociado.nombres,
            asociado.apellidos,
            asociado.fecha_nacimiento,
            asociado.genero,
            asociado.estado_civil,
            asociado.profesion,
            asociado.fecha_ingreso,
            asociado.estado
        ]
    );

    return result.insertId;
}

export async function update(id, asociado) {

    await pool.query(
        `
        UPDATE bco_asociados
        SET
            codigo_asociado = ?,
            dui = ?,
            nit = ?,
            nombres = ?,
            apellidos = ?,
            fecha_nacimiento = ?,
            genero = ?,
            estado_civil = ?,
            profesion = ?,
            estado = ?
        WHERE id = ?
        `,
        [
            asociado.codigo_asociado,
            asociado.dui,
            asociado.nit,
            asociado.nombres,
            asociado.apellidos,
            asociado.fecha_nacimiento,
            asociado.genero,
            asociado.estado_civil,
            asociado.profesion,
            asociado.estado,
            id
        ]
    );
}