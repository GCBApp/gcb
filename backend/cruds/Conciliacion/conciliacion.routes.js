import { Router } from "express";
import {
  getAllConciliaciones,
  createConciliacion,
  updateConciliacion,
  deleteConciliacion,
} from "./conciliacion.controller.js";

const router = Router();

router.get("/", getAllConciliaciones);
router.post("/", createConciliacion);
router.put("/:id", updateConciliacion);
router.delete("/:id", deleteConciliacion);

export default router;
