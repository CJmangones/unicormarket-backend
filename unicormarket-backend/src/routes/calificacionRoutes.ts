import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  crearCalificacion,
  listarCalificacionesUsuario,
} from "../controllers/calificacionController";

const router = Router();

router.post("/", authMiddleware, crearCalificacion);
router.get("/usuario/:usuarioId", listarCalificacionesUsuario);

export default router;