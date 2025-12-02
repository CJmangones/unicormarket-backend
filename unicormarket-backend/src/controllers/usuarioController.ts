import { Response } from "express";
import { pool } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// Publicaciones del usuario autenticado (para página de perfil)
export const misPublicaciones = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const query = `
      SELECT
        p.id,
        p.titulo,
        p.descripcion,
        p.precio,
        p.modalidad,
        p.tipo,
        p.estado,
        p.created_at,
        p.facultad,
        c.id AS categoria_id,
        c.nombre AS categoria_nombre,
        u.id AS usuario_id,
        u.nombre AS usuario_nombre,
        u.correo_institucional,
        COALESCE(
          (
            SELECT json_agg(i.url) FROM imagenes_publicacion i
            WHERE i.publicacion_id = p.id
          ),
          '[]'
        ) AS imagenes
      FROM publicaciones p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.usuario_id = $1
      ORDER BY p.created_at DESC;
    `;

    const { rows } = await pool.query(query, [req.user.id]);
    return res.json(rows);
  } catch (error) {
    console.error("Error listando mis publicaciones:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener mis publicaciones" });
  }
};