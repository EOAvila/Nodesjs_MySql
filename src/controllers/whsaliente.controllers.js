import { Router } from "express";
import axios from 'axios'
import { pool } from '../config/db.js'
import { BITRIX_WEBHOOK_OUT } from "../config.js";

//////////////////////////////////
const router = Router();
const WEBHOOKSAL = BITRIX_WEBHOOK_OUT
/////////////////////////////////////////

const webhookUrl_contact_get    = `${WEBHOOKSAL}crm.contact.get.json`
const webhookUrl_lead_get       = `${WEBHOOKSAL}crm.lead.get.json`
const webhookUrl_contact_list   = `${WEBHOOKSAL}crm.contact.list.json`
const webhookUrl_lead_list      = `${WEBHOOKSAL}crm.lead.list.json`
//////////////////////////////////
/////////////////////////////////////////////////////////////////////////
// CREA LEAD O CONTACTO EN LA BASE DE DATOS CUANDO SE CREA EN BITRIX24 //
////////////////////////////////////////////////////////////////////////
/// ======================================================
// WEBHOOK SALIENTE
// ======================================================
export const postwhsalRouter = router.post('/pro_clientes', async (req, res) => {

    try {

        console.log('================================')
        console.log('WEBHOOK RECIBIDO DESDE BITRIX24')
        console.log('================================')

        console.log(req.body)
        /////////////////////////////
        // EVENTO
        /////////////////////////////
        const event = req.body.event

        /////////////////////////////
        // ID DEL CONTACTO O LEAD
        ////////////////////////////
        const entityId =
                req.body?.data?.FIELDS?.ID ||
                req.body?.FIELDS?.ID ||
                req.body?.id

        console.log('EVENTO:', event)
        console.log('ENTITY ID:', entityId)

        //////////////////////////////////////
        // VALIDAR EVENTO
        //////////////////////////////////////
        if (!event) {
            return res.status(400).json({
                error: 'Evento no recibido'
            })
        }

        //////////////////////////////////////
        // VALIDAR ID
        //////////////////////////////////////
        if (!entityId) {
            return res.status(400).json({
                error: 'ID no recibido'
            })
        }


        // ==========================================
        // CONTACTO
        // ==========================================
        if (event === 'ONCRMCONTACTADD') {

            const response = await axios.post(
                `${webhookUrl_contact_get}`,
                { id: entityId},
                {
                    timeout: 10000
                }
            )
            ////////////////////////////////////////
            console.log('CONTACTO:')
            console.log(response.data)
            ///////////////////////////////////////
            ///////////////////////////////////////
            ///////////////////////////////////////
            return res.json({
                success: true,
                tipo: 'CONTACTO',
                datos: response.data
            })
        }

        // ==========================================
        // LEAD
        // ==========================================
        if (event === 'ONCRMLEADADD') {

            const response = await axios.post(
                `${webhookUrl_lead_get}`,
                { id: entityId },
                {
                    timeout: 10000
                }
            )

            console.log('LEAD:')
            console.log(response.data)

//            return res.json({
//                success: true,
//                tipo: 'LEAD',
//                datos: response.data
//            })
        }

        /////////////////////////////////////////
        // CODIGO PARA PROCESAR EL WEBHOOK Y GUARDAR EN BASE DE DATOS.
        ///////////////////////////////////////

        // OBTENER DETALLES DEL CONTACTO O LEAD DESDE BITRIX24 USANDO LA API
        //const response = await axios.post(webhookUrl_contact_get, { id: entityId })
        //const contactData = response.data.result
        ////////////////////////////////////////
        //console.log('DETALLES OBTENIDOS DESDE BITRIX24:')
        //console.log(contactData)
        /////////////////////////////////////////////////////
        // ==================================================
        // DATOS COMPLETOS
        // ==================================================
        const data = response.data.result
        if (!response.data.result) {
            return res.status(400).json({
                    error: 'Bitrix no devolvió resultados'
            })
        }

        console.log(data)
        const nombre    = data.NAME || ''
        const apellido  = data.LAST_NAME || ''
        const telefono  = data.PHONE?.[0]?.VALUE || ''
        const correo    = data.EMAIL?.[0]?.VALUE || ''
        const bitrix_id = data.ID || ''
        
        ///////////////////////////////////////////////////////
        // VALIDACION DE CONTACTO O LEAD
        ///////////////////////////////////////////////////////
        // ==================================================
        // VALIDAR EXISTENCIA DEL CLIENTE EN LA BASE DE DATOS
        // ==================================================
        const [rows] = await pool.query(
           `SELECT * FROM pro_clientes
                WHERE bitrix_id = ?
                LIMIT 1 `,
                [bitrix_id]
        )
        //////////////////////////////////////////////////////////////////
        // ACTUALIZA CLIENTE SI EXISTE O CREA NUEVO REGISTRO SI NO EXISTE
        //////////////////////////////////////////////////////////////////
        if (rows.length > 0) {
            console.log('CLIENTE YA EXISTE EN LA BASE DE DATOS')

            console.log('ACTUALIZANDO DATOS...')
            //////////////////////////////////////////////////////////////////
                await pool.query(
                    `UPDATE pro_clientes
                    SET nombre = ?, apellido = ?, telefono = ?, correo = ?
                    WHERE bitrix_id = ?`,
                    [nombre, apellido, telefono, correo, bitrix_id]
                )
        }
        if (rows.length === 0 ) {

            console.log('CLIENTE NO EXISTE EN LA BASE DE DATOS')
            console.log('CREANDO NUEVO REGISTRO...')
            await pool.query(
                `INSERT INTO pro_clientes (nombre, apellido, telefono, correo, bitrix_id)
                VALUES (?, ?, ?, ?, ?)`,
                [nombre, apellido, telefono, correo, bitrix_id]
            )
        }

         //////////////////////////////////////////////////
        // RESPUESTA FINAL
        //////////////////////////////////////////////////
        //return res.json({
        //    success: true,
        //    event,
        //    id: entityId
        //})
        
        return res.json({
            success: true,
            mensaje: 'Evento recibido'
        })

    } catch (error) {
            console.log('ERROR AL PROCESAR EL WEBHOOK:')
            console.log(error)
            return res.status(500).json({
                error: 'Error al procesar el webhook'
            })
    }
})

    //////////////////////////////////////////////////////////
export default router;