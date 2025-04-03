import express from "express";
import cors from "cors";
import sql from "mssql"; // Cambiado a mssql
import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
  FRONTEND_URL,
  PORT,
} from "./config.js";
import tipoUsuarioRoutes from "./cruds/TipoUsuario/tipoUsuario.routes.js";
import monedaRoutes from "./cruds/Moneda/moneda.routes.js";
import usuarioRoutes from "./cruds/Usuario/usuario.routes.js";

import bancosRoutes from "./cruds/Bancos/bancos.routes.js";
import cuentasbancariasRoutes from "./cruds/CuentasBancarias/cuentasbancarias.routes.js";

import tipoMovimientoRoutes from "./cruds/TipoMovimiento/tipoMovimiento.routes.js";

const app = express();

const sqlConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  server: DB_HOST,
  //port: parseInt(DB_PORT), // Asegúrate de que sea un número
  options: {
    encrypt: true, // Usar en conexiones seguras
    trustServerCertificate: true, // Usar si no tienes un certificado SSL
  },
};

app.use(express.json()); // Middleware para procesar JSON

app.use(
  cors({
    origin: FRONTEND_URL,
  })
);

app.use("/api/tipoUsuario", tipoUsuarioRoutes);
app.use("/api/moneda", monedaRoutes);
app.use("/api/usuario", usuarioRoutes);
app.use("/api/bancos", bancosRoutes);
app.use("/api/cuentasBancarias", cuentasbancariasRoutes);
app.use("/api/tipoMovimiento", tipoMovimientoRoutes);

app.get("/ping", async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT GETDATE() AS now");

    res.send({
      pong: result.recordset[0].now,
    });
  } catch (err) {
    console.error("Error al conectar a SQL Server:", err);
    res.status(500).send("Error al conectar a la base de datos");
  }
});

app.listen(PORT, () => {
  console.log("server started on port 3000");
});
