import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  crearOrden,
  listarMisOrdenes,
} from "../controllers/ordenController";

const router = Router();

router.post("/", authMiddleware, crearOrden);
router.get("/mias", authMiddleware, listarMisOrdenes);

export default router;