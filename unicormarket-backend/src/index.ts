import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import publicacionRoutes from "./routes/publicacionRoutes";
import truequeRoutes from "./routes/truequeRoutes";
import ordenRoutes from "./routes/ordenRoutes";
import mensajeRoutes from "./routes/mensajeRoutes";
import calificacionRoutes from "./routes/calificacionRoutes";
import usuarioRoutes from "./routes/usuarioRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "API UnicorMarket funcionando" });
});

app.use("/api/auth", authRoutes);
app.use("/api/publicaciones", publicacionRoutes);
app.use("/api/trueques", truequeRoutes);
app.use("/api/ordenes", ordenRoutes);   // 👈 IMPORTANTE
app.use("/api/mensajes", mensajeRoutes);
app.use("/api/calificaciones", calificacionRoutes);
app.use("/api/usuarios", usuarioRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
