import { Router } from "express";
import {
  getAllCuentas,
  getCuentaById,
  createCuenta,
  updateCuenta,
  deleteCuenta,
} from "./cuentasbancarias.controller.js";

const router = Router();

router.get("/", getAllCuentas);
router.get("/:id", getCuentaById);
router.post("/", createCuenta);
router.put("/:id", updateCuenta);
router.delete("/:id", deleteCuenta);

export default router;
