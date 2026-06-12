////////////////////////////////////////
// index.routes.js
////////////////////////////////////////
import { Router } from "express";
import { pool } from '../config/db.js'
import { getPing } from '../controllers/index.controllers.js'

//////////////////////////////////
const router = Router();

router.get('/ping', getPing)

export default router