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

export const getAllCompensaciones = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_COMPENSACION");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener compensaciones");
  }
};

export const getCompensacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM GCB_COMPENSACION WHERE COM_Compensacion = @id");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener la compensación");
  }
};

export const createCompensacion = async (req, res) => {
  try {
    const { COM_Descripcion, COM_Fecha, COM_Tipo, COM_Valor } = req.body;

    if (!COM_Descripcion || !COM_Fecha || !COM_Tipo || !COM_Valor) {
      return res.status(400).send("Faltan datos requeridos");
    }

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("descripcion", sql.VarChar, COM_Descripcion)
      .input("fecha", sql.Date, COM_Fecha)
      .input("tipo", sql.VarChar, COM_Tipo)
      .input("valor", sql.Decimal(10, 2), COM_Valor)
      .query(
        "INSERT INTO GCB_COMPENSACION (COM_Descripcion, COM_Fecha, COM_Tipo, COM_Valor) VALUES (@descripcion, @fecha, @tipo, @valor)"
      );
    res.status(201).send("Compensación creada");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear la compensación");
  }
};

export const updateCompensacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { COM_Descripcion, COM_Fecha, COM_Tipo, COM_Valor } = req.body;

    if (!COM_Descripcion || !COM_Fecha || !COM_Tipo || !COM_Valor) {
      return res.status(400).send("Faltan datos requeridos");
    }

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("descripcion", sql.VarChar, COM_Descripcion)
      .input("fecha", sql.Date, COM_Fecha)
      .input("tipo", sql.VarChar, COM_Tipo)
      .input("valor", sql.Decimal(10, 2), COM_Valor)
      .query(
        "UPDATE GCB_COMPENSACION SET COM_Descripcion = @descripcion, COM_Fecha = @fecha, COM_Tipo = @tipo, COM_Valor = @valor WHERE COM_Compensacion = @id"
      );
    res.send("Compensación actualizada");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar la compensación");
  }
};

export const deleteCompensacion = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM GCB_COMPENSACION WHERE COM_Compensacion = @id");
    res.send("Compensación eliminada");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar la compensación");
  }
};
