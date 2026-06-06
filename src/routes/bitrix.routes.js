import { Router } from "express";

import * as BitrixController
from "../controllers/bitrix.controller.js";

const router = Router();

router.post(
    "/",
    BitrixController.recibirEventoBitrix
);

router.post(
    "/sincronizar/:id",
    BitrixController.sincronizarContacto
);

//export default router;

router.post('/', async (req, res) => {

    console.log('HEADERS:');
    console.log(req.headers);

    console.log('BODY:');
    console.log(JSON.stringify(req.body, null, 2));

    return res.status(200).json({
        success: true,
        recibido: req.body
    });

});


router.post('/', async (req, res) => {

    try {

        console.log(
            'EVENTO RECIBIDO:',
            JSON.stringify(req.body, null, 2)
        );

        const evento = req.body.event;

        switch (evento) {

            case 'ONCRMCONTACTADD':
                console.log('Nuevo Contacto');
                break;

            case 'ONCRMCONTACTUPDATE':
                console.log('Contacto Actualizado');
                break;

            case 'ONCRMLEADADD':
                console.log('Nuevo Prospecto');
                break;

            case 'ONCRMLEADUPDATE':
                console.log('Prospecto Actualizado');
                break;

            case 'ONCRMDEALADD':
                console.log('Nuevo Negocio');
                break;

            case 'ONCRMDEALUPDATE':
                console.log('Negocio Actualizado');
                break;

            default:
                console.log('Evento no controlado:', evento);
        }

        return res.status(200).send('OK');

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;