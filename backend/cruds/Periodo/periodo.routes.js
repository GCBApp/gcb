import { Router } from "express";
import {
  getAllPeriodos,
  createPeriodo,
  updatePeriodo,
  deletePeriodo,
  cerrarPeriodoYRecalcularSaldos, // NUEVO
} from "./periodo.controller.js";

const router = Router();

router.get("/", getAllPeriodos);
router.post("/", createPeriodo);
router.put("/:id", updatePeriodo);
router.delete("/:id", deletePeriodo);
router.post("/cerrar/:id", cerrarPeriodoYRecalcularSaldos); // NUEVO: Cerrar periodo y recalcular saldos

export default router;
