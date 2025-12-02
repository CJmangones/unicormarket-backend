import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../config/db";
import { signToken } from "../utils/jwt";
import { AuthRequest } from "../middleware/authMiddleware";

const INSTITUTIONAL_DOMAIN = "@correo.unicordoba.edu.co";

export const register = async (req: Request, res: Response) => {
  try {
    const { correo_institucional, nombre, password, facultad, telefono } = req.body;

    if (!correo_institucional || !nombre || !password) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    if (!correo_institucional.endsWith(INSTITUTIONAL_DOMAIN)) {
      return res.status(400).json({
        message: `Solo se permiten correos institucionales ${INSTITUTIONAL_DOMAIN}`,
      });
    }

    const existing = await pool.query(
      "SELECT id FROM usuarios WHERE correo_institucional = $1",
      [correo_institucional]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const insertQuery = `
      INSERT INTO usuarios (correo_institucional, nombre, facultad, telefono, password_hash, rol)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, correo_institucional, nombre, facultad, telefono, rol, reputacion, created_at;
    `;

    const { rows } = await pool.query(insertQuery, [
      correo_institucional,
      nombre,
      facultad || null,
      telefono || null,
      passwordHash,
      "estudiante",
    ]);

    const user = rows[0];

    const token = signToken({
      userId: user.id,
      correo: user.correo_institucional,
      rol: user.rol,
    });

    return res.status(201).json({ token, user });
  } catch (error) {
    console.error("Error en register:", error);
    return res.status(500).json({ message: "Error al registrar usuario" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { correo_institucional, password } = req.body;

    if (!correo_institucional || !password) {
      return res.status(400).json({ message: "Faltan credenciales" });
    }

    const { rows } = await pool.query(
      "SELECT id, correo_institucional, nombre, facultad, telefono, rol, reputacion, created_at, password_hash FROM usuarios WHERE correo_institucional = $1",
      [correo_institucional]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = signToken({
      userId: user.id,
      correo: user.correo_institucional,
      rol: user.rol,
    });

    delete user.password_hash;

    return res.json({ token, user });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const { rows } = await pool.query(
      "SELECT id, correo_institucional, nombre, facultad, telefono, rol, reputacion, created_at FROM usuarios WHERE id = $1",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Error en me:", error);
    return res.status(500).json({ message: "Error al obtener el perfil" });
  }
};