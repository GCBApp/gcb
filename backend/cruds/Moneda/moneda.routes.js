import { Router } from "express";
import {
  getAllMonedas,
  getMonedasById,
  createMoneda,
  updateMoneda,
  deleteMoneda,
  updateExchangeRates,
} from "./moneda.controller.js";

const router = Router();

router.get("/", getAllMonedas);
router.get("/:id", getMonedasById);
router.post("/", createMoneda);
router.put("/:id", updateMoneda);
router.delete("/:id", deleteMoneda);
router.post("/update-exchange-rates", updateExchangeRates);

export default router;
