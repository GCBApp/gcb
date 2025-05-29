// Revisión y corrección para listar todos los estados correctamente, sin JOINs innecesarios

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

// Listar SOLO los estados (para catálogos y combos)
export const getAllEstados = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    // Trae solo el catálogo de estados, sin GROUP BY ni duplicados
    const result = await pool.request().query(`
      SELECT DISTINCT EST_Estado, EST_Descripcion
      FROM GCB_ESTADO
      WHERE EST_Estado IS NOT NULL AND EST_Descripcion IS NOT NULL
      ORDER BY EST_Descripcion
    `);
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
    const { EST_Estado, MOV_movimiento, COM_Compensacion, EST_Descripcion } = req.body;

    if (!MOV_movimiento || !COM_Compensacion || !EST_Descripcion) {
      return res.status(400).send("Faltan datos requeridos");
    }

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("estado", sql.Char(10), EST_Estado)
      .input("movimiento", sql.Char(10), MOV_movimiento)
      .input("compensacion", sql.Char(10), COM_Compensacion)
      .input("descripcion", sql.Char(50), EST_Descripcion)
      .query(
        "INSERT INTO GCB_ESTADO (EST_Estado, MOV_movimiento, COM_Compensacion, EST_Descripcion) VALUES (@estado, @movimiento, @compensacion, @descripcion)"
      );
    res.status(201).send("Estado creado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear el estado");
  }
};

export const updateEstado = async (req, res) => {
  const { id } = req.params;
  const { EST_Descripcion } = req.body;

  // Solo permitir valores válidos
  const ESTADOS_VALIDOS = ["CONCILIADO", "NO CONCILIADO", "EN REVISIÓN", "PENDIENTE"];
  if (!EST_Descripcion || !ESTADOS_VALIDOS.includes(EST_Descripcion)) {
    return res.status(400).send("El campo EST_Descripcion es requerido y debe ser un estado válido.");
  }

  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("descripcion", sql.VarChar(50), EST_Descripcion)
      .input("id", sql.Char(10), id)
      .query("UPDATE GCB_ESTADO SET EST_Descripcion = @descripcion WHERE EST_Estado = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Estado no encontrado.");
    }

    res.status(200).send({ message: "Estado actualizado correctamente." });
  } catch (err) {
    console.error("Error al actualizar el estado:", err);
    res.status(500).send("Error al actualizar el estado.");
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