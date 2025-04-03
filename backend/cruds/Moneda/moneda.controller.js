import sql from "mssql";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } from "../../config.js";

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
      .input("id", sql.Int, id)
      .query("SELECT * FROM GCB_MONEDA WHERE MON_moneda = @id");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener monedas");
  }
};

export const createMoneda = async (req, res) => {
  try {
    const { MON_moneda, MON_Fecha_Mov, MON_nombre, MON_valor} = req.body;

    // Validación de datos
    if (!MON_moneda || !MON_nombre) {
      return res.status(400).send("Faltan datos requeridos: MON_moneda o MON_nombre");
    }

    const pool = await sql.connect(sqlConfig);

    // Verificar si el ID ya existe
    const checkId = await pool
      .request()
      .input("moneda", sql.Int, MON_moneda)
      .query("SELECT COUNT(*) AS count FROM GCB_MONEDA WHERE MON_moneda = @moneda");

    if (checkId.recordset[0].count > 0) {
      return res.status(400).send("La moneda ya existe. No se pueden agregar registros duplicados.");
    }

    // Insertar el nuevo registro
    await pool
      .request()
      .input("moneda", sql.Int, MON_moneda)
      .input("fecha", sql.Date, MON_Fecha_Mov)
      .input("nombre", sql.VarChar, MON_nombre)
      .input("valor", sql.Int, MON_valor)
      .query(
        "INSERT INTO GCB_MONEDA (MON_moneda, MON_Fecha_Mov, MON_nombre, MON_valor) VALUES (@moneda, @fecha, @nombre, @valor)"
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
    const { MON_moneda, MON_Fecha_Mov, MON_nombre, MON_valor} = req.body;

    // Validación de datos
    if (!MON_moneda || !MON_nombre) {
        return res.status(400).send("Faltan datos requeridos: MON_moneda o MON_nombre");
    }

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("moneda", sql.Int, MON_moneda)
      .input("fecha", sql.Date, MON_Fecha_Mov)
      .input("nombre", sql.VarChar, MON_nombre)
      .input("valor", sql.Int, MON_valor)
      .query(
        "UPDATE GCB_MONEDA SET MON_moneda = @moneda, MON_Fecha_Mov = @fecha, MON_nombre = @nombre, MON_valor = @valor WHERE MON_moneda = @id"
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
      .input("id", sql.Int, id)
      .query("DELETE FROM GCB_MONEDA WHERE MON_moneda = @id");
    res.send("Moneda eliminada");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar moneda");
  }
};
