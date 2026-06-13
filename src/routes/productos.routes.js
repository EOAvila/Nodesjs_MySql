import express from "express";

import {

    crearProductoController,
    obtenerProductoController,
    listarProductosController,
    actualizarProductoController,
    eliminarProductoController,
    sincronizarProductosController,
    webhookProductosController

} from "../controllers/productos.controller.js";

const router =
    express.Router();

router.post(
    "/",
    crearProductoController
);

router.get(
    "/",
    listarProductosController
);

router.get(
    "/:bitrix_id",
    obtenerProductoController
);

router.put(
    "/:bitrix_id",
    actualizarProductoController
);

router.delete(
    "/:bitrix_id",
    eliminarProductoController
);

router.post(
    "/sincronizar",
    sincronizarProductosController
);

router.post(
    "/webhook",
    webhookProductosController
);

export default router;