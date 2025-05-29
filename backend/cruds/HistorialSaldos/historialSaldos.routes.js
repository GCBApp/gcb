import { Router } from "express";
import {
  getAllHistorialSaldos,
  createHistorialSaldos,
  updateHistorialSaldos,
  deleteHistorialSaldos,
} from "./historialSaldos.controller.js";
import sql from "mssql";

const router = Router();

router.get("/", getAllHistorialSaldos);
router.post("/", createHistorialSaldos);
router.put("/:id", updateHistorialSaldos);
router.delete("/:id", deleteHistorialSaldos);

export default router;
