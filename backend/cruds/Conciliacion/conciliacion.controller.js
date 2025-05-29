import sql from "mssql";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } from "../../config.js";

const sqlConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  server: DB_HOST,
  options: { encrypt: true, trustServerCertificate: true },
};

export const getAllConciliaciones = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_CONCILIACION");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send("Error al obtener conciliaciones");
  }
};

export const createConciliacion = async (req, res) => {
  try {
    const { CON_Conciliacion, CON_Fecha, CON_Descripcion, CON_Estado } = req.body;
    if (!CON_Conciliacion) return res.status(400).send("Faltan datos requeridos");
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("CON_Conciliacion", sql.VarChar(20), CON_Conciliacion)
      .input("CON_Fecha", sql.Date, CON_Fecha)
      .input("CON_Descripcion", sql.VarChar(255), CON_Descripcion)
      .input("CON_Estado", sql.VarChar(20), CON_Estado)
      .query("INSERT INTO GCB_CONCILIACION (CON_Conciliacion, CON_Fecha, CON_Descripcion, CON_Estado) VALUES (@CON_Conciliacion, @CON_Fecha, @CON_Descripcion, @CON_Estado)");
    res.status(201).send("Conciliación creada");
  } catch (err) {
    res.status(500).send("Error al crear conciliación");
  }
};

export const updateConciliacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { CON_Conciliacion, CON_Fecha, CON_Descripcion, CON_Estado } = req.body;
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("id", sql.VarChar(20), id)
      .input("CON_Conciliacion", sql.VarChar(20), CON_Conciliacion)
      .input("CON_Fecha", sql.Date, CON_Fecha)
      .input("CON_Descripcion", sql.VarChar(255), CON_Descripcion)
      .input("CON_Estado", sql.VarChar(20), CON_Estado)
      .query("UPDATE GCB_CONCILIACION SET CON_Conciliacion=@CON_Conciliacion, CON_Fecha=@CON_Fecha, CON_Descripcion=@CON_Descripcion, CON_Estado=@CON_Estado WHERE CON_Conciliacion=@id");
    res.send("Conciliación actualizada");
  } catch (err) {
    res.status(500).send("Error al actualizar conciliación");
  }
};

export const deleteConciliacion = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("id", sql.VarChar(20), id)
      .query("DELETE FROM GCB_CONCILIACION WHERE CON_Conciliacion=@id");
    res.send("Conciliación eliminada");
  } catch (err) {
    res.status(500).send("Error al eliminar conciliación");
  }
};
