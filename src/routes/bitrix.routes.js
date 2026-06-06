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

export default router;