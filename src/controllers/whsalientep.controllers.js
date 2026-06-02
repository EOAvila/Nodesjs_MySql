import { Router } from "express";
import axios from "axios";
import { pool } from '../../config/db.js'
import { BITRIX_WEBHOOK_OUT } from "../config.js";

const router = Router();

const WEBHOOKSAL = BITRIX_WEBHOOK_OUT;

// =============================================
// URLS BITRIX
// =============================================
const webhookUrl_contact_get = `${WEBHOOKSAL}crm.contact.get.json`;
const webhookUrl_lead_get    = `${WEBHOOKSAL}crm.lead.get.json`;

// ======================================================
// WEBHOOK SALIENTE DESDE BITRIX24
// ======================================================
router.post("/pro_clientes", async (req, res) => {

    try {

        console.log("================================");
        console.log("WEBHOOK RECIBIDO DESDE BITRIX24");
        console.log("================================");

        console.log(req.body);

        // =============================================
        // EVENTO
        // =============================================
        const event = req.body?.event;

        // =============================================
        // ID DE ENTIDAD
        // =============================================
        const entityId =
            req.body?.data?.FIELDS?.ID ||
            req.body?.FIELDS?.ID ||
            req.body?.id;

        console.log("EVENTO:", event);
        console.log("ENTITY ID:", entityId);

        // =============================================
        // VALIDACIONES
        // =============================================
        if (!event) {
            return res.status(400).json({
                success: false,
                error: "Evento no recibido"
            });
        }

        if (!entityId) {
            return res.status(400).json({
                success: false,
                error: "ID no recibido"
            });
        }

        // =============================================
        // VARIABLES
        // =============================================
        let response;
        let data;

        // =============================================
        // CONTACTO
        // =============================================
        if (event === "ONCRMCONTACTADD") {

            response = await axios.get(
                webhookUrl_contact_get,
                {
                    params: {
                        id: entityId
                    },
                    timeout: 10000
                }
            );

            console.log("CONTACTO RECIBIDO");
        }

        // =============================================
        // LEAD
        // =============================================
        else if (event === "ONCRMLEADADD") {

            response = await axios.get(
                webhookUrl_lead_get,
                {
                    params: {
                        id: entityId
                    },
                    timeout: 10000
                }
            );

            console.log("LEAD RECIBIDO");
        }

        // =============================================
        // EVENTO NO SOPORTADO
        // =============================================
        else {

            return res.status(200).json({
                success: true,
                mensaje: "Evento ignorado"
            });
        }

        // =============================================
        // VALIDAR RESPUESTA BITRIX
        // =============================================
        if (!response?.data) {

            return res.status(500).json({
                success: false,
                error: "Bitrix no respondió"
            });
        }

        if (response.data.error) {

            console.log(response.data);

            return res.status(500).json({
                success: false,
                error: response.data.error_description || response.data.error
            });
        }

        data = response.data.result;

        if (!data) {

            return res.status(404).json({
                success: false,
                error: "Bitrix no devolvió resultados"
            });
        }

        console.log("DATOS COMPLETOS:");
        console.log(data);

        // =============================================
        // EXTRAER DATOS
        // =============================================
        const nombre = data.NAME || "";
        const apellido = data.LAST_NAME || "";
        const telefono = data.PHONE?.[0]?.VALUE || "";
        const correo = data.EMAIL?.[0]?.VALUE || "";
        const bitrix_id = data.ID || "";

        // =============================================
        // VALIDAR EXISTENCIA
        // =============================================
        const [rows] = await pool.query(
            `
            SELECT *
            FROM pro_clientes
            WHERE bitrix_id = ?
            LIMIT 1
            `,
            [bitrix_id]
        );

        // =============================================
        // ACTUALIZAR
        // =============================================
        if (rows.length > 0) {

            console.log("CLIENTE EXISTE");
            console.log("ACTUALIZANDO...");

            await pool.query(
                `
                UPDATE pro_clientes
                SET
                    nombre = ?,
                    apellido = ?,
                    telefono = ?,
                    correo = ?
                WHERE bitrix_id = ?
                `,
                [
                    nombre,
                    apellido,
                    telefono,
                    correo,
                    bitrix_id
                ]
            );

        }

        // =============================================
        // INSERTAR
        // =============================================
        else {

            console.log("CLIENTE NUEVO");
            console.log("INSERTANDO...");

            await pool.query(
                `
                INSERT INTO pro_clientes
                (
                    nombre,
                    apellido,
                    telefono,
                    correo,
                    bitrix_id
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    nombre,
                    apellido,
                    telefono,
                    correo,
                    bitrix_id
                ]
            );
        }

        // =============================================
        // RESPUESTA FINAL
        // =============================================
        return res.status(200).json({
            success: true,
            mensaje: "Webhook procesado correctamente",
            event,
            bitrix_id
        });

    } catch (error) {

        console.log("================================");
        console.log("ERROR AL PROCESAR WEBHOOK");
        console.log("================================");

        console.log(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;