import { Response } from "express";
import { pool } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// Crear una orden de compra/venta para una publicación
export const crearOrden = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const { publicacion_id, vendedor_id, cantidad, monto_total } = req.body as {
      publicacion_id?: string;
      vendedor_id?: string;
      cantidad?: number;
      monto_total?: number;
    };

    if (!publicacion_id || !vendedor_id || !cantidad || !monto_total) {
      return res.status(400).json({
        message:
          "publicacion_id, vendedor_id, cantidad y monto_total son obligatorios",
      });
    }

    const insert = `
      INSERT INTO ordenes (
        publicacion_id, comprador_id, vendedor_id, cantidad, monto_total, estado
      )
      VALUES ($1, $2, $3, $4, $5, 'pendiente')
      RETURNING *;
    `;

    const { rows } = await pool.query(insert, [
      publicacion_id,
      req.user.id,
      vendedor_id,
      cantidad,
      monto_total,
    ]);

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creando orden:", error);
    return res.status(500).json({ message: "Error al crear la orden" });
  }
};

// Listar órdenes del usuario (como comprador o vendedor)
export const listarMisOrdenes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const query = `
      SELECT
        o.*,
        p.titulo,
        ucomp.nombre AS comprador_nombre,
        uven.nombre AS vendedor_nombre
      FROM ordenes o
      JOIN publicaciones p ON o.publicacion_id = p.id
      JOIN usuarios ucomp ON o.comprador_id = ucomp.id
      JOIN usuarios uven ON o.vendedor_id = uven.id
      WHERE o.comprador_id = $1 OR o.vendedor_id = $1
      ORDER BY o.creada_en DESC;
    `;

    const { rows } = await pool.query(query, [req.user.id]);
    return res.json(rows);
  } catch (error) {
    console.error("Error listando ordenes:", error);
    return res.status(500).json({ message: "Error al obtener las órdenes" });
  }
};