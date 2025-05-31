import { Router } from "express";
import {
  getAllEmpleados,
  getEmpleadoById,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  getTiposEmpleado,
  login,
  changePassword,
} from "./empleado.controller.js";

const router = Router();

router.get("/", getAllEmpleados);
router.get("/:id", getEmpleadoById);
router.post("/", createEmpleado);
router.put("/:id", updateEmpleado);
router.delete("/:id", deleteEmpleado);
router.get("/tipoEmpleado", getTiposEmpleado);
router.post("/login", login);
router.put('/:id/cambiar-contrasena', changePassword);

export default router;
