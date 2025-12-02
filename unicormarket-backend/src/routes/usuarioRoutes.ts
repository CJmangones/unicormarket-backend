import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { misPublicaciones } from "../controllers/usuarioController";

const router = Router();

router.get("/me/publicaciones", authMiddleware, misPublicaciones);

export default router;