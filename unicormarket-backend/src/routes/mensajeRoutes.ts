import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  enviarMensaje,
  listarMensajesPublicacion,
} from "../controllers/mensajeController";

const router = Router();

router.post("/", authMiddleware, enviarMensaje);
router.get("/publicacion/:publicacionId", authMiddleware, listarMensajesPublicacion);

export default router;