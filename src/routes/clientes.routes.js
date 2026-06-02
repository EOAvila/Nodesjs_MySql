import { Router } from "express";

const router = Router();

///////////////////////////////////////////////////////////

import {
    insertarClienteController,
    actualizarClienteController,
    eliminarClienteController
} from "../controllers/clientes.controller.js";

///////////////////////////////////////////////////////////

router.post("/", insertarClienteController);

router.put("/:id", actualizarClienteController);

router.delete("/:id", eliminarClienteController);

///////////////////////////////////////////////////////////

export default router;