import { Router } from "express";
import {
  getAllMovimientos,
  getMovimientoById,
  createMovimiento,
  updateMovimiento,
  deleteMovimiento,
  getTiposMovimiento,
  getCuentasBancarias,
  getUsuarios,
  getMonedas
} from "./movimiento.controller.js";

const router = Router();

// Rutas principales CRUD
router.get("/", getAllMovimientos);
router.get("/:id", getMovimientoById);
router.post("/", createMovimiento);
router.put("/:id", updateMovimiento);
router.delete("/:id", deleteMovimiento);

// Rutas para obtener información relacionada
router.get("/datos/tiposMovimiento", getTiposMovimiento);
router.get("/datos/cuentasBancarias", getCuentasBancarias);
router.get("/datos/usuarios", getUsuarios);
router.get("/datos/monedas", getMonedas);

export default router;