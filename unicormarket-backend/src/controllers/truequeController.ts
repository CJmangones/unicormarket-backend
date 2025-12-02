import { Response } from "express";
import { pool } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// Crear un trueque para una publicación
export const crearTrueque = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const { publicacion_id, receptor_id } = req.body as {
      publicacion_id?: string;
      receptor_id?: string;
    };

    if (!publicacion_id || !receptor_id) {
      return res
        .status(400)
        .json({ message: "publicacion_id y receptor_id son obligatorios" });
    }

    const insert = `
      INSERT INTO trueques (publicacion_id, oferente_id, receptor_id, estado)
      VALUES ($1, $2, $3, 'pendiente')
      RETURNING id, publicacion_id, oferente_id, receptor_id, estado, acordado_en;
    `;

    const { rows } = await pool.query(insert, [
      publicacion_id,
      req.user.id,
      receptor_id,
    ]);

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creando trueque:", error);
    return res.status(500).json({ message: "Error al crear el trueque" });
  }
};

// Listar trueques donde participa el usuario autenticado
export const listarMisTrueques = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const query = `
      SELECT
        t.id,
        t.estado,
        t.acordado_en,
        p.id AS publicacion_id,
        p.titulo,
        p.modalidad,
        p.tipo,
        p.precio,
        uo.id AS oferente_id,
        uo.nombre AS oferente_nombre,
        ur.id AS receptor_id,
        ur.nombre AS receptor_nombre
      FROM trueques t
      JOIN publicaciones p ON t.publicacion_id = p.id
      JOIN usuarios uo ON t.oferente_id = uo.id
      JOIN usuarios ur ON t.receptor_id = ur.id
      WHERE t.oferente_id = $1 OR t.receptor_id = $1
      ORDER BY t.acordado_en NULLS LAST, t.id DESC;
    `;

    const { rows } = await pool.query(query, [req.user.id]);
    return res.json(rows);
  } catch (error) {
    console.error("Error listando trueques:", error);
    return res.status(500).json({ message: "Error al obtener los trueques" });
  }
};