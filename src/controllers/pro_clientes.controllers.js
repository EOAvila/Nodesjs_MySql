import { Router } from "express";
import { pool } from '../../config/db.js'
import axios from 'axios'

//////////////////////////////////
const router = Router();

///////////////////////////////////////////////////////////////
//  EXTRAE SOLO UN CLIENTE
///////////////////////////////////////////////////////////////
export const getPro_cliente = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(
            "SELECT * FROM pro_clientes WHERE id_pro_clientes = ?",
            [id]
        );

        // Si el array está vacío, devolvemos 404
        if (rows.length <= 0) {
            return res.status(404).json({
                message: "Cliente no encontrado"
            });
        }

        // Devolvemos el primer objeto (el cliente) en lugar del array completo si prefieres
        res.json(rows[0]);

    } catch (error) {
        return res.status(500).json({
            message: "Algo salió mal",
            error: error.message
        });
    }
};

///////////////////////////////////////////////////////////////
//  EXTRAE TODOS LOS CLIENTES
///////////////////////////////////////////////////////////////
export const getPro_clientes = async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM pro_clientes");
    res.json(rows);
};

///////////////////////////////////////////////////////////////
// CREA NUEVOS CLIENTES
////////////////////////////////////////////////////////////////
export const postPro_clientes = async (req, res) => {
    try {
        const { pri_nombre, pri_apellido, dui, celular, email, estado, fecha_creacion, usuario_creacion, equipo_creacion } = req.body;

        // Validación simple: evitar que intenten insertar si el body llegó vacío
        if (!pri_nombre || !email) {
            return res.status(400).json({ message: "Faltan campos obligatorios" });
        }

        const [rows] = await pool.query(
            "INSERT INTO pro_clientes (pri_nombre, pri_apellido, dui, celular, email, estado, fecha_creacion, usuario_creacion, equipo_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [pri_nombre, pri_apellido, dui, celular, email, estado, fecha_creacion, usuario_creacion, equipo_creacion]
        );

        res.status(201).json({
            id: rows.insertId,
            pri_nombre,
            pri_apellido,
            dui,
            celular,
            email,
            estado,
            fecha_creacion,
            usuario_creacion,
            equipo_creacion
        });

    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

///////////////////////////////////////////////////////////////
//  ACTUALIZA DATOS DE CLIENTES
////////////////////////////////////////////////////////////////
export const patchPro_clientes = async (req, res) => {
    try {
        const { id } = req.params;
        const { pri_nombre, pri_apellido, dui, celular, email, estado, fecha_creacion, usuario_creacion, equipo_creacion } = req.body;

        // Validación simple: evitar que intenten actualizar si el body llegó vacío
        //if (!pri_nombre || !email) {
        //    return res.status(400).json({ message: "Faltan campos obligatorios" });
        //}

        const [rows] = await pool.query(
            "UPDATE pro_clientes SET pri_nombre = COALESCE(?, pri_nombre), pri_apellido = COALESCE(?, pri_apellido), dui = COALESCE(?, dui), celular = COALESCE(?, celular), email = COALESCE(?, email), estado = COALESCE(?, estado), fecha_creacion = COALESCE(?, fecha_creacion), usuario_creacion = COALESCE(?, usuario_creacion), equipo_creacion = COALESCE(?, equipo_creacion) WHERE id_pro_clientes = ?",
            [pri_nombre, pri_apellido, dui, celular, email, estado, fecha_creacion, usuario_creacion, equipo_creacion, id]
        );

        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: "Cliente no encontrado...???" });
        }

        res.json({ message: "Cliente actualizado" });

    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};
///////////////////////////////////////////////////////////////////////
//  ELIMINA REGISTROS CLIENTES
////////////////////////////////////////////////////////////////
export const deletePro_clientes = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("DELETE FROM pro_clientes WHERE id_pro_clientes = ?", [id]);

        if (rows.affectedRows === 0) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        res.json({ message: "Cliente eliminado correctamente"});
        console.log(`Cliente con id ${id} eliminado`);
        console.log(rows);

    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

////////    ///////////////////////////////////////////////////////////////
export default router
