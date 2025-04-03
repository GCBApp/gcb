import { Router } from "express";
import {
  getAllBancos,
  getBancoById,
  createBanco,
  updateBanco,
  deleteBanco,
} from "./bancos.controller.js";

const router = Router();

router.get("/", getAllBancos);
router.get("/:id", getBancoById);
router.post("/", createBanco);
router.put("/:id", updateBanco);
router.delete("/:id", deleteBanco);

export default router;