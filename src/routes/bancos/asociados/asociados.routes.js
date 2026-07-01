//////////////////////////////////////////////
// asociados.routes.js
/////////////////////////////////////////////
import { Router } from "express";

import 
    asociadosController 
from '../../../controllers/bancos/asociados/asociados.controller.js';
import { validate } from '../../../middlewares/validate.middleware.js';
import { asociadoSchema } from '../../../modules/asociados/validator.js';
//import { createAsociado } from './asociados.controller.js';

//////////////////////////////////////////////

const router = Router();

//////////////////////////////////////////////
router.get('/', asociadosController.getAll);

router.get('/:id', asociadosController.getById);

router.post('/', asociadosController.create);

router.put('/:id', asociadosController.update);

router.delete('/:id', asociadosController.delete);

//////////////////////
export default router;

/*
router.post(
    '/',
    validate(asociadoSchema),
    createAsociado
);

export default router;
*/