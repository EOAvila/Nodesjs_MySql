import { Router } from "express";
import { pool } from '../../config/db.js'
import { getPro_clientes, postPro_clientes, getPro_cliente, patchPro_clientes, deletePro_clientes } from '../controllers/pro_clientes.controllers.js'
import { getPro_cliente } from '../controllers/pro_clientes.controllers.js'
import { getPro_clientes } from '../controllers/pro_clientes.controllers.js'
import { postPro_clientes } from '../controllers/pro_clientes.controllers.js'
import { patchPro_clientes } from '../controllers/pro_clientes.controllers.js'
import { deletePro_clientes } from '../controllers/pro_clientes.controllers.js'
import axios from 'axios'
//import { postpro_clientesRouter } from '../controllers/pro_clientes_b24.controllers.js'

////////////////////////////////////////////////////////////////////////
const router = Router();

////////////////////////////////////////////////////////////////////////
//router.post('/pro_clientes', postpro_clientesRouter);

////////////////////////////////////////////////////////////////////////
router.get("/pro_clientes", getPro_clientes);
router.post("/pro_clientes", postPro_clientes);
router.get("/pro_cliente/:id", getPro_cliente);
router.patch("/pro_clientes/:id", patchPro_clientes);
router.delete("/pro_clientes/:id", deletePro_clientes);

/////////////////////////////////////////////////////////////////////////////////////////////////////
export default router;