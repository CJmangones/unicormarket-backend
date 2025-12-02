import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    correo: string;
    rol: string;
  };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.userId,
      correo: payload.correo,
      rol: payload.rol,
    };
    next();
  } catch (error) {
    console.error("Error verificando token", error);
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}