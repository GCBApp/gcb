import { Router } from "express";
import {
  getAllCompensaciones,
  getCompensacionById,
  createCompensacion,
  updateCompensacion,
  deleteCompensacion,
} from "./compensacion.controller.js";

const router = Router();

router.get("/", getAllCompensaciones);
router.get("/:id", getCompensacionById);
router.post("/", createCompensacion);
router.put("/:id", updateCompensacion);
router.delete("/:id", deleteCompensacion);

export default router;