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
router.get('/', (req, res) => {

    res.status(200).json({
        success: true,
        message: 'Webhook funcionando'
    });

});

router.post("/", BitrixController.recibirEventoBitrix);

router.post(
    "/sincronizar/:id",
    BitrixController.sincronizarContacto
);

/////////////////////////////////////////
router.post('/', async (req, res) => {

    console.log('HEADERS:');
    console.log(req.headers);

    console.log("QUERY:");
    console.log(JSON.stringify(req.query, null, 2));

    console.log('BODY:');
    console.log(JSON.stringify(req.body, null, 2));

    return res.status(200).json({
        success: true,
        recibido: req.body
    });

});

router.post("/", async (req, res) => {

    const contactId = req.query.contact_id;

    console.log("CONTACT ID:", contactId);

    return res.status(200).json({
        success: true,
        contactId
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

/*
//////////////////////////////////////////////
router.post("/:evento", async (req, res) => {

    console.log("EVENTO URL:", req.params.evento);

    console.log("BODY:");
    console.log(JSON.stringify(req.body, null, 2));

    return res.status(200).json({
        success: true,
        evento: req.params.evento
    });

});
*/
////////////////////////
export default router;