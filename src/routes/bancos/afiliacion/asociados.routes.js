//////////////////////////////////////////////
// asociados.routes.js
/////////////////////////////////////////////
import { Router } from "express";

import 
    asociadosController 
from '../../../controllers/bancos/afiliacion/asociados.controller.js';
//////////////////////////////////////////////

const router = Router();

//////////////////////////////////////////////
router.get('/', asociadosController.getAll);

router.get('/:id', asociadosController.getById);

router.post('/', asociadosController.create);

router.put('/:id', asociadosController.update);

router.delete('/:id', asociadosController.delete);

export default router;