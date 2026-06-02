import { Router } from "express";
import { pool } from '../config/db.js'

//////////////////////////////////
const router = Router();

export const getPing = (req, res) => {
  res.json({message: 'pong'})
}

export default router;