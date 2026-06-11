////////////////////////////////
// clientes.routes.js
////////////////////////////////
import { Router } from "express";

import {
    crearCliente,
    actualizarClienteMysql
} from "../controllers/clientes.controller.js";

const router = Router();

router.get(
    "/",
    crearCliente
);

router.post(
    "/",
    crearCliente
);

router.put(
    "/:id",
    actualizarClienteMysql
);

export default router;
