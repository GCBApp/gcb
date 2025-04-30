import { Router } from "express";
import { getAllMovimientos, createMovimiento, updateMovimiento, deleteMovimiento } from "./movimiento.controller.js";

const router = Router();

// Ruta para listar movimientos
router.get("/", getAllMovimientos);

// Ruta para crear movimiento
router.post("/", createMovimiento);

// Ruta para editar movimiento
router.put("/:id", updateMovimiento);

// Ruta para eliminar movimiento
router.delete("/:id", deleteMovimiento);

export default router;