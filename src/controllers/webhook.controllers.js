//import { Router } from "express";
//import axios from 'axios'
//import { pool } from '../config/db.js'

//////////////////////////////////
//const router = Router();

// ======================================================
// WEBHOOK BITRIX24
// ======================================================
//export const postpro_clienteswebhook = router.post('/api/pro_clientes', async (req, res) => {
//    try {
//        console.log('=== NUEVA LLAMADA AL WEBHOOK ===')
//        console.log('BODY:')
//        console.log(req.body)

        /////////////////////////////////////////////////
//        const data = req.body.data
//        console.log('DATA:')
//        console.log(data)
        /////////////////////////////////////////////////

//        res.status(200).json({
//            success: true,
//            message: 'Webhook recibido correctamente'
//        })

//    } catch (err) {
//        console.log(err)
        // PASO 5 — verificar ruta correcta
        // IMPORTANTE. Tu webhook en Bitrix24 debe apuntar EXACTAMENTE a:
        // PASO 6 — IMPORTANTE SOBRE RENDER
        // Render puede dormir el servicio gratuito. La primera llamada puede fallar. Revisar logs:
        // PASO 7 — Verificar req.body
        // Agregar temporalmente:
//        return res.status(500).json({
//            error: err.message
//        })
//    }
// })

////////////////////////////////////////////////////////////////////////
//export default router;