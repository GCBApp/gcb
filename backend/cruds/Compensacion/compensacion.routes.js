import { Router } from "express";
import {
  getAllCompensaciones,
  getCompensacionById,
  createCompensacion,
  updateCompensacion,
  deleteCompensacion,
  processCompensation,
  checkTableSchemas, // Añade esta importación
  getNextCompensacionId // Importa la función para obtener el siguiente ID
} from "./compensacion.controller.js";

const router = Router();

router.get("/", getAllCompensaciones);
router.get("/:id", getCompensacionById);
router.post("/", createCompensacion);
router.put("/:id", updateCompensacion);
router.delete("/:id", deleteCompensacion);
router.post("/process", processCompensation);
router.get("/schemas", checkTableSchemas); // Añade esta línea
router.get("/next-id", getNextCompensacionId); // Endpoint para obtener el siguiente ID de compensación

export default router;