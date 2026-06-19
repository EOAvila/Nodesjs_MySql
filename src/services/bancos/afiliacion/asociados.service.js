///////////////////////////////////////////////////////////////////
// asociados.service.js
///////////////////////////////////////////////////////////////////
import 
    pool 
from '../../../config/db.js';

class AsociadosService {

    async getAll() {
        const [rows] = await pool.query(`
            SELECT *
            FROM bco_asociado
            ORDER BY id DESC
        `);

        return rows;
    }

    async getById(id) {
        const [rows] = await pool.query(`
            SELECT *
            FROM bco_asociado
            WHERE id = ?
        `, [id]);

        return rows[0];
    }

    async create(data) {

        const sql = `
            INSERT INTO bco_asociado (
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
            VALUES (
                ?,?,?,?,?,?,?,?,?,?,?
            )
        `;

        const [result] = await pool.query(sql, [
            data.codigo_asociado,
            data.dui,
            data.nit,
            data.nombres,
            data.apellidos,
            data.fecha_nacimiento,
            data.genero,
            data.estado_civil,
            data.profesion,
            data.fecha_ingreso,
            data.estado
        ]);

        return result.insertId;
    }

    async update(id, data) {

        const sql = `
            UPDATE bco_asociado
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
                fecha_ingreso = ?,
                estado = ?
            WHERE id = ?
        `;

        const [result] = await pool.query(sql, [
            data.codigo_asociado,
            data.dui,
            data.nit,
            data.nombres,
            data.apellidos,
            data.fecha_nacimiento,
            data.genero,
            data.estado_civil,
            data.profesion,
            data.fecha_ingreso,
            data.estado,
            id
        ]);

        return result;
    }

    async delete(id) {

        const [result] = await pool.query(`
            DELETE FROM bco_asociado
            WHERE id = ?
        `, [id]);

        return result;
    }
}

export default new AsociadosService();