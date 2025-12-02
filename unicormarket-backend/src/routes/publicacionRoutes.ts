import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  listarPublicaciones,
  obtenerPublicacion,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
} from "../controllers/publicacionController";

const router = Router();

router.get("/", listarPublicaciones);
router.get("/:id", obtenerPublicacion);

// Crear publicación (requiere login)
router.post("/", authMiddleware, crearPublicacion);

// Editar publicación (solo dueño)
router.put("/:id", authMiddleware, actualizarPublicacion);

// Eliminar publicación (solo dueño)
router.delete("/:id", authMiddleware, eliminarPublicacion);

export default router;
