import { Response } from "express";
import { pool } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// Enviar un mensaje sobre una publicación
export const enviarMensaje = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const { publicacion_id, destinatario_id, contenido } = req.body as {
      publicacion_id?: string;
      destinatario_id?: string;
      contenido?: string;
    };

    if (!publicacion_id || !destinatario_id || !contenido) {
      return res.status(400).json({
        message:
          "publicacion_id, destinatario_id y contenido son obligatorios",
      });
    }

    const insert = `
      INSERT INTO mensajes (
        publicacion_id, remitente_id, destinatario_id, contenido
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const { rows } = await pool.query(insert, [
      publicacion_id,
      req.user.id,
      destinatario_id,
      contenido,
    ]);

    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error enviando mensaje:", error);
    return res.status(500).json({ message: "Error al enviar el mensaje" });
  }
};

// Listar mensajes de una publicación (conversación general)
export const listarMensajesPublicacion = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { publicacionId } = req.params;

    const query = `
      SELECT
        m.*,
        urem.nombre AS remitente_nombre,
        udes.nombre AS destinatario_nombre
      FROM mensajes m
      JOIN usuarios urem ON m.remitente_id = urem.id
      JOIN usuarios udes ON m.destinatario_id = udes.id
      WHERE m.publicacion_id = $1
      ORDER BY m.enviado_en ASC;
    `;

    const { rows } = await pool.query(query, [publicacionId]);
    return res.json(rows);
  } catch (error) {
    console.error("Error listando mensajes:", error);
    return res.status(500).json({ message: "Error al obtener los mensajes" });
  }
};