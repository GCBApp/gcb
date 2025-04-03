import { Router } from "express";
import {
  getAllTipoMovimientos,
  getTipoMovimientoById,
  createTipoMovimiento,
  updateTipoMovimiento,
  deleteTipoMovimiento,
} from "./tipoMovimiento.controller.js";

const router = Router();

router.get("/", getAllTipoMovimientos);
router.get("/:id", getTipoMovimientoById);
router.post("/", createTipoMovimiento);
router.put("/:id", updateTipoMovimiento);
router.delete("/:id", deleteTipoMovimiento);

export default router;