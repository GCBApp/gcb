import express from "express";
import sql from "mssql";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } from "../config.js";
import soap from "soap";

const router = express.Router();

const sqlConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  server: DB_HOST,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

const url = "https://www.banguat.gob.gt/variables/ws/TipoCambio.asmx?wsdl";

// Endpoint para actualizar y obtener el tipo de cambio para una moneda y fecha específica
router.post("/actualizar", async (req, res) => {
  const { moneda, fecha, idBanguat } = req.body;
  if (!moneda || !fecha || !idBanguat) {
    return res.status(400).json({ error: "Faltan parámetros requeridos (moneda, fecha, idBanguat)" });
  }
  try {
    const pool = await sql.connect(sqlConfig);
    // Si es moneda local, tipo de cambio 1
    if (idBanguat === 1) {
      await pool
        .request()
        .input("compra", sql.Decimal(18, 5), 1)
        .input("venta", sql.Decimal(18, 5), 1)
        .input("fecha", sql.Date, fecha)
        .input("moneda", sql.Char(10), moneda)
        .query(
          "UPDATE GCB_MONEDA SET MON_Tipo_Compra = @compra, MON_Tipo_Venta = @venta WHERE MON_moneda = @moneda AND MON_Fecha_Mov = @fecha"
        );
      return res.json({ compra: 1, venta: 1 });
    }
    // Buscar en la base de datos primero
    const result = await pool
      .request()
      .input("moneda", sql.Char(10), moneda)
      .input("fecha", sql.Date, fecha)
      .query(
        "SELECT MON_Tipo_Compra, MON_Tipo_Venta FROM GCB_MONEDA WHERE MON_moneda = @moneda AND MON_Fecha_Mov = @fecha"
      );
    if (result.recordset.length > 0 && result.recordset[0].MON_Tipo_Compra) {
      return res.json({
        compra: result.recordset[0].MON_Tipo_Compra,
        venta: result.recordset[0].MON_Tipo_Venta,
      });
    }
    // Si no existe, buscar en Banguat
    const client = await new Promise((resolve, reject) => {
      soap.createClient(url, (err, client) => {
        if (err) return reject(err);
        resolve(client);
      });
    });
    let fechaActual = new Date(fecha);
    const fechaLimite = new Date("2000-01-01");
    let tipoCambio = null;
    while (fechaActual >= fechaLimite) {
      const fechaSeleccionada = fechaActual.toISOString().split("T")[0];
      const args = {
        fechainit: fechaSeleccionada.split("-").reverse().join("/"),
        moneda: idBanguat,
      };
      const result = await new Promise((resolve, reject) => {
        client.TipoCambioFechaInicialMoneda(args, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
      const vars = result?.TipoCambioFechaInicialMonedaResult?.Vars?.Var;
      if (vars && Array.isArray(vars)) {
        const found = vars.find((item) => item.fecha === args.fechainit);
        if (found) {
          tipoCambio = { compra: found.compra, venta: found.venta };
          // Guardar en la base de datos: si existe, actualiza; si no, inserta
          const check = await pool
            .request()
            .input("moneda", sql.Char(10), moneda)
            .input("fecha", sql.Date, fecha)
            .query("SELECT COUNT(*) AS count FROM GCB_MONEDA WHERE MON_moneda = @moneda AND MON_Fecha_Mov = @fecha");
          if (check.recordset[0].count > 0) {
            // Actualizar
            await pool
              .request()
              .input("compra", sql.Decimal(18, 5), found.compra)
              .input("venta", sql.Decimal(18, 5), found.venta)
              .input("fecha", sql.Date, fecha)
              .input("moneda", sql.Char(10), moneda)
              .query(
                "UPDATE GCB_MONEDA SET MON_Tipo_Compra = @compra, MON_Tipo_Venta = @venta WHERE MON_moneda = @moneda AND MON_Fecha_Mov = @fecha"
              );
          } else {
            // Insertar (requiere nombre y idBanguat)
            // Buscar nombre e idBanguat de la moneda
            const monedaInfo = await pool
              .request()
              .input("moneda", sql.Char(10), moneda)
              .query("SELECT TOP 1 MON_nombre, MON_id_Banguat FROM GCB_MONEDA WHERE MON_moneda = @moneda");
            const nombre = monedaInfo.recordset[0]?.MON_nombre || moneda;
            const idBanguatInsert = monedaInfo.recordset[0]?.MON_id_Banguat || idBanguat;
            await pool
              .request()
              .input("moneda", sql.Char(10), moneda)
              .input("fecha", sql.Date, fecha)
              .input("nombre", sql.VarChar(50), nombre)
              .input("compra", sql.Decimal(18, 5), found.compra)
              .input("venta", sql.Decimal(18, 5), found.venta)
              .input("idBanguat", sql.Int, idBanguatInsert)
              .query(
                "INSERT INTO GCB_MONEDA (MON_moneda, MON_Fecha_Mov, MON_nombre, MON_Tipo_Compra, MON_Tipo_Venta, MON_id_Banguat) VALUES (@moneda, @fecha, @nombre, @compra, @venta, @idBanguat)"
              );
          }
          break;
        }
      }
      fechaActual.setDate(fechaActual.getDate() - 1);
    }
    if (tipoCambio) {
      return res.json(tipoCambio);
    } else {
      return res.status(404).json({ error: "No se encontró tipo de cambio para la fecha y moneda dadas." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al actualizar/obtener tipo de cambio" });
  }
});

export default router;
