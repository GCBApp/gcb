import { Router } from "express";
import {
  getAllTiposCuenta,
  createTipoCuenta,
  updateTipoCuenta,
  deleteTipoCuenta,
} from "./tipoCuentaBancaria.controller.js";

const router = Router();

router.get("/", getAllTiposCuenta);
router.post("/", createTipoCuenta);
router.put("/:id", updateTipoCuenta);
router.delete("/:id", deleteTipoCuenta);

export default router;
