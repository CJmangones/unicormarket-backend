import { Router } from "express";
import {
  crearPublicacion,
  listarPublicaciones,
  obtenerPublicacion,
} from "../controllers/publicacionController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", listarPublicaciones);
router.get("/:id", obtenerPublicacion);
router.post("/", authMiddleware, crearPublicacion);

export default router;