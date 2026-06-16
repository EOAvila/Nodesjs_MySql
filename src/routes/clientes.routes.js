////////////////////////////////
// clientes.routes.js
////////////////////////////////
import { Router } from "express";

import {
    crearCliente,
    actualizarClienteMysql
} from "../controllers/clientes.controller.js";

//////////////////////////////////////
const router = Router();
//////////////////////////////////////

//router.get("/", listarClientes);

router.post("/", crearCliente);

router.put("/:id", actualizarClienteMysql);

//router.patch("/:id", actualizarClienteMysql);

//router.delete("/:id", eliminarClienteController);

//////////////////////////////////////////////////
//
//////////////////////////////////////////////////
router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Endpoint clientes activo"
    });
});
/////////////////////////
export default router;
