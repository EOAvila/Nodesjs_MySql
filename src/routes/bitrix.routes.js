import { Router } from "express";
import axios from "axios";

import {
    webhookBitrix
} from "../controllers/bitrix.controller.js";

///////////////////////////////////////////////////////////////

const router = Router();

///////////////////////////////////////////
// RUTA PARA WEBHOOK CREADA
//////////////////////////////////////////
router.get("/webhook/bitrix", (req, res) => {
    res.status(200).json({
        exito: true,
        mensaje: "Ruta webhook Bitrix activa"
    });
});

router.post("/webhook/bitrix", (req, res) => {
    console.log("Webhook recibido");
    console.log(req.body);

    res.status(200).json({
        exito: true,
        mensaje: "Webhook recibido"
    });
});

////////////////////////////////////////////////////////////////

router.post(
    "/bitrix",
    webhookBitrix
);

///////////////////////////////////////////////////////////////
export default router;
