import { Router } from "express";
import {
  getAllMonedas,
  getMonedasById,
  createMoneda,
  updateMoneda,
  deleteMoneda,
} from "./moneda.controller.js";

const router = Router();

router.get("/", getAllMonedas);
router.get("/:id", getMonedasById);
router.post("/", createMoneda);
router.put("/:id", updateMoneda);
router.delete("/:id", deleteMoneda);

export default router;
