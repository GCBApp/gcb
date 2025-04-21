import { Router } from "express";
import {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getTiposUsuario,
} from "../cruds/Usuario/usuario.controller.js";

const router = Router();

router.get("/", getAllUsuarios);
router.get("/:id", getUsuarioById);
router.post("/", createUsuario);
router.put("/:id", updateUsuario);
router.delete("/:id", deleteUsuario);
router.get("/tipoUsuario", getTiposUsuario);

export default router;