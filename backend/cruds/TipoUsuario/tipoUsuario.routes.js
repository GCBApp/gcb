import { Router } from "express";
import {
  getAllTipoUsuarios,
  getTipoUsuarioById,
  createTipoUsuario,
  updateTipoUsuario,
  deleteTipoUsuario,
} from "./tipoUsuario.controller.js";

const router = Router();

router.get("/", getAllTipoUsuarios);
router.get("/:id", getTipoUsuarioById);
router.post("/", createTipoUsuario);
router.put("/:id", updateTipoUsuario);
router.delete("/:id", deleteTipoUsuario);

export default router;
