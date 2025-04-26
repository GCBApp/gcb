import { Router } from "express";
import {
  getAllEstados,
  getEstadoById,
  createEstado,
  updateEstado,
  deleteEstado,
  getEstadosByCompensacion,
} from "./estado.controller.js";

const router = Router();

router.get("/", getAllEstados);
router.get("/:id", getEstadoById);
router.post("/", createEstado);
router.put("/:id", updateEstado);
router.delete("/:id", deleteEstado);

// Añadir esta ruta al router de Estado
router.get("/compensacion/:compensacionId", getEstadosByCompensacion);

export default router;