import { Response } from "express";
import { pool } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// Crear calificación para un trueque o una orden
export const crearCalificacion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const { trueque_id, orden_id, receptor_id, puntaje, comentario } =
      req.body as {
        trueque_id?: string | null;
        orden_id?: string | null;
        receptor_id?: string;
        puntaje?: number;
        comentario?: string;
      };

    if (!receptor_id || !puntaje) {
      return res
        .status(400)
        .json({ message: "receptor_id y puntaje son obligatorios" });
    }

    if (!trueque_id && !orden_id) {
      return res.status(400).json({
        message: "Debe asociarse a un trueque_id o a un orden_id",
      });
    }

    const insert = `
      INSERT INTO calificaciones (
        trueque_id, orden_id, autor_id, receptor_id, puntaje, comentario
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const { rows } = await pool.query(insert, [
      trueque_id || null,
      orden_id || null,
      req.user.id,
      receptor_id,
      puntaje,
      comentario || null,
    ]);

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creando calificación:", error);
    return res
      .status(500)
      .json({ message: "Error al crear la calificación" });
  }
};

// Listar calificaciones recibidas por un usuario
export const listarCalificacionesUsuario = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { usuarioId } = req.params;

    const query = `
      SELECT
        c.*,
        uautor.nombre AS autor_nombre
      FROM calificaciones c
      JOIN usuarios uautor ON c.autor_id = uautor.id
      WHERE c.receptor_id = $1
      ORDER BY c.creado_en DESC;
    `;

    const { rows } = await pool.query(query, [usuarioId]);
    return res.json(rows);
  } catch (error) {
    console.error("Error listando calificaciones:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener las calificaciones" });
  }
};