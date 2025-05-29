import { Router } from "express";
import {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getTiposUsuario,
  login,
} from "../cruds/Usuario/usuario.controller.js";

const router = Router();

router.get("/", getAllUsuarios);
router.get("/:id", getUsuarioById);
router.post("/", createUsuario);
router.put("/:id", updateUsuario);
router.delete("/:id", deleteUsuario);
router.get("/tipoUsuario", getTiposUsuario);
router.post("/login", login);

export default router;