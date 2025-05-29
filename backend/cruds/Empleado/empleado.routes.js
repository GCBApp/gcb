import { Router } from "express";
import {
  getAllEmpleados,
  getEmpleadoById,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  getTiposEmpleado,
  login,
} from "./empleado.controller.js";

const router = Router();

router.get("/", getAllEmpleados);
router.get("/:id", getEmpleadoById);
router.post("/", createEmpleado);
router.put("/:id", updateEmpleado);
router.delete("/:id", deleteEmpleado);
router.get("/tipoEmpleado", getTiposEmpleado);
router.post("/login", login);

export default router;
