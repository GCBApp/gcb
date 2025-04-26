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

export const getAllEstados = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_ESTADO");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener estados");
  }
};

export const getEstadoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM GCB_ESTADO WHERE EST_Estado = @id");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener el estado");
  }
};

export const createEstado = async (req, res) => {
  try {
    const { EST_Estado, MOV_movimiento, COM_Compensacion, EST_descripcion } = req.body;

    if (!MOV_movimiento || !COM_Compensacion || !EST_descripcion) {
      return res.status(400).send("Faltan datos requeridos");
    }

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("estado", sql.Int, EST_Estado)
      .input("movimiento", sql.Int, MOV_movimiento)
      .input("compensacion", sql.Int, COM_Compensacion)
      .input("descripcion", sql.VarChar, EST_descripcion)
      .query(
        "INSERT INTO GCB_ESTADO (EST_Estado, MOV_movimiento, COM_Compensacion, EST_descripcion) VALUES (@estado, @movimiento, @compensacion, @descripcion)"
      );
    res.status(201).send("Estado creado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear el estado");
  }
};

export const updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { MOV_movimiento, COM_Compensacion, EST_descripcion } = req.body;

    if (!MOV_movimiento || !COM_Compensacion || !EST_descripcion) {
      return res.status(400).send("Faltan datos requeridos");
    }

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("movimiento", sql.Int, MOV_movimiento)
      .input("compensacion", sql.Int, COM_Compensacion)
      .input("descripcion", sql.VarChar, EST_descripcion)
      .query(
        "UPDATE GCB_ESTADO SET MOV_movimiento = @movimiento, COM_Compensacion = @compensacion, EST_descripcion = @descripcion WHERE EST_Estado = @id"
      );
    res.send("Estado actualizado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar el estado");
  }
};

export const deleteEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM GCB_ESTADO WHERE EST_Estado = @id");
    res.send("Estado eliminado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar el estado");
  }
};

export const getEstadosByCompensacion = async (req, res) => {
  try {
    const { compensacionId } = req.params;
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("compensacionId", sql.Char(10), compensacionId)
      .query("SELECT * FROM GCB_ESTADO WHERE COM_Compensacion = @compensacionId");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los estados por compensación");
  }
};