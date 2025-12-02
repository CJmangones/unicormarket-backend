import { Request, Response } from "express";
import { pool } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const listarPublicaciones = async (req: Request, res: Response) => {
  try {
    const { categoria_id, modalidad, tipo, q } = req.query;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (categoria_id) {
      conditions.push(`p.categoria_id = $${idx++}`);
      values.push(Number(categoria_id));
    }

    if (modalidad) {
      conditions.push(`p.modalidad = $${idx++}`);
      values.push(modalidad);
    }

    if (tipo) {
      conditions.push(`p.tipo = $${idx++}`);
      values.push(tipo);
    }

    if (q) {
      conditions.push(`(p.titulo ILIKE $${idx} OR p.descripcion ILIKE $${idx})`);
      values.push(`%${q}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

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
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT 100;
    `;

    const { rows } = await pool.query(query, values);
    return res.json(rows);
  } catch (error) {
    console.error("Error listando publicaciones:", error);
    return res.status(500).json({ message: "Error al obtener publicaciones" });
  }
};

export const obtenerPublicacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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
      WHERE p.id = $1
      LIMIT 1;
    `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("Error obteniendo publicación:", error);
    return res.status(500).json({ message: "Error al obtener la publicación" });
  }
};

export const crearPublicacion = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const {
      categoria_id,
      modalidad,
      tipo,
      titulo,
      descripcion,
      precio,
      facultad,
      imagenes,
    } = req.body as {
      categoria_id?: number;
      modalidad: string;
      tipo: string;
      titulo: string;
      descripcion: string;
      precio?: number;
      facultad?: string;
      imagenes?: string[];
    };

    if (!modalidad || !tipo || !titulo || !descripcion) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const insertPublicacion = `
      INSERT INTO publicaciones (
        usuario_id, categoria_id, modalidad, tipo, titulo, descripcion,
        precio, facultad, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'activo')
      RETURNING id;
    `;

    const { rows } = await pool.query(insertPublicacion, [
      req.user.id,
      categoria_id || null,
      modalidad,
      tipo,
      titulo,
      descripcion,
      precio || null,
      facultad || null,
    ]);

    const publicacionId = rows[0].id as string;

    if (Array.isArray(imagenes) && imagenes.length > 0) {
      const values: any[] = [];
      const placeholders: string[] = [];

      imagenes.forEach((url, index) => {
        const base = index * 2;
        placeholders.push(`($${base + 1}, $${base + 2})`);
        values.push(publicacionId, url);
      });

      const insertImagenes = `
        INSERT INTO imagenes_publicacion (publicacion_id, url)
        VALUES ${placeholders.join(", ")};
      `;

      await pool.query(insertImagenes, values);
    }

    return res.status(201).json({ id: publicacionId, message: "Publicación creada" });
  } catch (error) {
    console.error("Error creando publicación:", error);
    return res.status(500).json({ message: "Error al crear la publicación" });
  }
};