import sql from "mssql";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } from "../../config.js";

const sqlConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  server: DB_HOST,
  options: { encrypt: true, trustServerCertificate: true },
};

export const getAllDetalleConciliacion = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_DETALLE_CONCILIACION");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send("Error al obtener detalles de conciliación");
  }
};

export const createDetalleConciliacion = async (req, res) => {
  try {
    const { DCO_Detalle, CON_Conciliacion, DCO_Descripcion, DCO_Valor } = req.body;
    if (!DCO_Detalle || !CON_Conciliacion) return res.status(400).send("Faltan datos requeridos");
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("DCO_Detalle", sql.VarChar(20), DCO_Detalle)
      .input("CON_Conciliacion", sql.VarChar(20), CON_Conciliacion)
      .input("DCO_Descripcion", sql.VarChar(255), DCO_Descripcion)
      .input("DCO_Valor", sql.Decimal(18, 2), DCO_Valor)
      .query("INSERT INTO GCB_DETALLE_CONCILIACION (DCO_Detalle, CON_Conciliacion, DCO_Descripcion, DCO_Valor) VALUES (@DCO_Detalle, @CON_Conciliacion, @DCO_Descripcion, @DCO_Valor)");
    res.status(201).send("Detalle de conciliación creado");
  } catch (err) {
    res.status(500).send("Error al crear detalle de conciliación");
  }
};

export const updateDetalleConciliacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { DCO_Detalle, CON_Conciliacion, DCO_Descripcion, DCO_Valor } = req.body;
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("id", sql.VarChar(20), id)
      .input("DCO_Detalle", sql.VarChar(20), DCO_Detalle)
      .input("CON_Conciliacion", sql.VarChar(20), CON_Conciliacion)
      .input("DCO_Descripcion", sql.VarChar(255), DCO_Descripcion)
      .input("DCO_Valor", sql.Decimal(18, 2), DCO_Valor)
      .query("UPDATE GCB_DETALLE_CONCILIACION SET DCO_Detalle=@DCO_Detalle, CON_Conciliacion=@CON_Conciliacion, DCO_Descripcion=@DCO_Descripcion, DCO_Valor=@DCO_Valor WHERE DCO_Detalle=@id");
    res.send("Detalle de conciliación actualizado");
  } catch (err) {
    res.status(500).send("Error al actualizar detalle de conciliación");
  }
};

export const deleteDetalleConciliacion = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("id", sql.VarChar(20), id)
      .query("DELETE FROM GCB_DETALLE_CONCILIACION WHERE DCO_Detalle=@id");
    res.send("Detalle de conciliación eliminado");
  } catch (err) {
    res.status(500).send("Error al eliminar detalle de conciliación");
  }
};
