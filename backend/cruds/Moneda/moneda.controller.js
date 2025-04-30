import sql from "mssql";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } from "../../config.js";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export const getAllMonedas = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_MONEDA");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener monedas");
  }
};

export const getMonedasById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("SELECT * FROM GCB_MONEDA WHERE MON_moneda = @id");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener monedas");
  }
};

export const createMoneda = async (req, res) => {
  try {
    const { MON_moneda, MON_Fecha_Mov, MON_nombre, MON_Tipo_Compra, MON_Tipo_Venta, MON_id_Banguat } = req.body;

    if (!MON_moneda || !MON_nombre) {
      return res.status(400).send("Faltan datos requeridos: MON_moneda o MON_nombre");
    }

    const pool = await sql.connect(sqlConfig);

    const checkId = await pool
      .request()
      .input("moneda", sql.Char(10), MON_moneda)
      .query("SELECT COUNT(*) AS count FROM GCB_MONEDA WHERE MON_moneda = @moneda");

    if (checkId.recordset[0].count > 0) {
      return res.status(400).send("La moneda ya existe. No se pueden agregar registros duplicados.");
    }

    await pool
      .request()
      .input("moneda", sql.Char(10), MON_moneda)
      .input("fecha", sql.Date, MON_Fecha_Mov)
      .input("nombre", sql.VarChar, MON_nombre)
      .input("compra", sql.Decimal(18, 5), MON_Tipo_Compra)
      .input("venta", sql.Decimal(18, 5), MON_Tipo_Venta)
      .input("idBanguat", sql.Int, MON_id_Banguat)
      .query(
        "INSERT INTO GCB_MONEDA (MON_moneda, MON_Fecha_Mov, MON_nombre, MON_Tipo_Compra, MON_Tipo_Venta, MON_id_Banguat) VALUES (@moneda, @fecha, @nombre, @compra, @venta, @idBanguat)"
      );
    res.status(201).send("Moneda creada");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear moneda");
  }
};

export const updateMoneda = async (req, res) => {
  try {
    const { id } = req.params;
    const { MON_moneda, MON_Fecha_Mov, MON_nombre, MON_Tipo_Compra, MON_Tipo_Venta, MON_id_Banguat } = req.body;

    if (!MON_moneda || !MON_nombre) {
      return res.status(400).send("Faltan datos requeridos: MON_moneda o MON_nombre");
    }

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .input("moneda", sql.Char(10), MON_moneda)
      .input("fecha", sql.Date, MON_Fecha_Mov)
      .input("nombre", sql.VarChar, MON_nombre)
      .input("compra", sql.Decimal(18, 5), MON_Tipo_Compra)
      .input("venta", sql.Decimal(18, 5), MON_Tipo_Venta)
      .input("idBanguat", sql.Int, MON_id_Banguat)
      .query(
        "UPDATE GCB_MONEDA SET MON_moneda = @moneda, MON_Fecha_Mov = @fecha, MON_nombre = @nombre, MON_Tipo_Compra = @compra, MON_Tipo_Venta = @venta, MON_id_Banguat = @idBanguat WHERE MON_moneda = @id"
      );
    res.send("Moneda actualizada");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar moneda");
  }
};

export const deleteMoneda = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("DELETE FROM GCB_MONEDA WHERE MON_moneda = @id");
    res.send("Moneda eliminada");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar moneda");
  }
};
export const updateExchangeRates = async (req, res) => {
  try {
    // Construir ruta dinámica al script tipo_cambio.js
    const tipoCambioPath = path.resolve(__dirname, "../../tipo_cambio.js");

    // Ejecutar el script tipo_cambio.js para actualizar los tipos de cambio
    exec(`node ${tipoCambioPath}`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al ejecutar tipo_cambio.js: ${error.message}`);
        return res.status(500).send("Error al actualizar los tipos de cambio.");
      }
      if (stderr) {
        console.error(`Error en tipo_cambio.js: ${stderr}`);
        return res.status(500).send("Error al actualizar los tipos de cambio.");
      }
      console.log(`Resultado de tipo_cambio.js: ${stdout}`);

      // Actualizar la lista de monedas después de ejecutar el script
      try {
        const pool = await sql.connect(sqlConfig);
        const result = await pool.request().query("SELECT * FROM GCB_MONEDA");
        res.json({
          message: "Tipos de cambio actualizados correctamente.",
          monedas: result.recordset,
        });
      } catch (err) {
        console.error("Error al obtener monedas después de actualizar tipos de cambio:", err);
        res.status(500).send("Error al obtener monedas actualizadas.");
      }
    });
  } catch (err) {
    console.error("Error al actualizar tipos de cambio:", err);
    res.status(500).send("Error interno del servidor.");
  }
};
