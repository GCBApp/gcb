import { Router } from "express";
import {
  getAllDetalleConciliacion,
  createDetalleConciliacion,
  updateDetalleConciliacion,
  deleteDetalleConciliacion,
} from "./detalleConciliacion.controller.js";

const router = Router();

router.get("/", getAllDetalleConciliacion);
router.post("/", createDetalleConciliacion);
router.put("/:id", updateDetalleConciliacion);
router.delete("/:id", deleteDetalleConciliacion);

export default router;
