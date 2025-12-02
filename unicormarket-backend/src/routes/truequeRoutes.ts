import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  crearTrueque,
  listarMisTrueques,
} from "../controllers/truequeController";

const router = Router();

router.post("/", authMiddleware, crearTrueque);
router.get("/mios", authMiddleware, listarMisTrueques);

export default router;