import express from "express";
import cors from "cors";
import sql from "mssql"; // Cambiado a mssql
import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  //DB_PORT,
  DB_USER,
  FRONTEND_URL,
  PORT,
} from "./config.js";
import tipoUsuarioRoutes from "./cruds/TipoUsuario/tipoUsuario.routes.js";
import monedaRoutes from "./cruds/Moneda/moneda.routes.js";
import empleadoRoutes from "./cruds/Empleado/empleado.routes.js";
import bancosRoutes from "./cruds/Bancos/bancos.routes.js";
import cuentasbancariasRoutes from "./cruds/CuentasBancarias/cuentasbancarias.routes.js";

import tipoMovimientoRoutes from "./cruds/TipoMovimiento/tipoMovimiento.routes.js";
import movimientoRoutes from "./cruds/Movimiento/movimiento.routes.js";

import Compensacion from "./cruds/Compensacion/compensacion.routes.js";
import Estado from "./cruds/Estado/estado.routes.js";
import { updateExchangeRates } from "./tipo_cambio.js"; // Importar la función de tipo_cambio.js
import tipoCuentaBancariaRoutes from "./cruds/TipoCuentaBancaria/tipoCuentaBancaria.routes.js";
import periodoRoutes from "./cruds/Periodo/periodo.routes.js";
import conciliacionRoutes from "./cruds/Conciliacion/conciliacion.routes.js";
import detalleConciliacionRoutes from "./cruds/DetalleConciliacion/detalleConciliacion.routes.js";
import historialSaldosRoutes from "./cruds/HistorialSaldos/historialSaldos.routes.js";
import tipoCambioRoutes from "./routes/tipoCambio.js";

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
  requestTimeout: 60000, // Aumenta el tiempo de espera a 60 segundos
  pool: {
    max: 10, // Número máximo de conexiones en el pool
    min: 0, // Número mínimo de conexiones en el pool
    idleTimeoutMillis: 30000, // Tiempo de espera para cerrar conexiones inactivas
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
app.use("/api/empleado", empleadoRoutes);
app.use("/api/bancos", bancosRoutes);
app.use("/api/cuentasBancarias", cuentasbancariasRoutes);
app.use("/api/tipoMovimiento", tipoMovimientoRoutes);
app.use("/api/movimiento", movimientoRoutes);
app.use("/api/compensacion", Compensacion);
app.use("/api/estado", Estado);
app.use("/api/tipoCuentaBancaria", tipoCuentaBancariaRoutes);
app.use("/api/periodo", periodoRoutes);
app.use("/api/conciliacion", conciliacionRoutes);
app.use("/api/detalleConciliacion", detalleConciliacionRoutes);
app.use("/api/historialSaldos", historialSaldosRoutes);
app.use("/api/tipoCambio", tipoCambioRoutes);

app.get("/ping", async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT GETDATE() AS now");

    res.send({
      pong: result.recordset[0].now,
    });
  } catch (err) {
    console.error("Error al conectar a SQL Server:", err);
    res.status(500).send({
      error: "Error al conectar a la base de datos",
      details: err.message,
    });
  }
});

// Exportar la función updateExchangeRates para uso global
export { updateExchangeRates };

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

