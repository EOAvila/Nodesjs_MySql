import { Router } from "express";

import {
    crearCliente,
    actualizarClienteMysql
} from "../controllers/clientes.controller.js";

const router = Router();

router.post(
    "/clientes",
    crearCliente
);

router.put(
    "/clientes/:id",
    actualizarClienteMysql
);

export default router;
