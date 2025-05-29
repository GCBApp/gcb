import sql from "mssql";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } from "../../config.js";

const sqlConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  server: DB_HOST,
  options: { encrypt: true, trustServerCertificate: true },
};

export const getAllTiposCuenta = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_TIPO_CUENTA_BANCARIA");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send("Error al obtener tipos de cuenta");
  }
};

export const createTipoCuenta = async (req, res) => {
  try {
    const { TCP_Tipo_cuenta, TCP_Descripcion } = req.body;
    if (!TCP_Tipo_cuenta || !TCP_Descripcion) return res.status(400).send("Faltan datos requeridos");
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("tipo", sql.VarChar(10), TCP_Tipo_cuenta)
      .input("desc", sql.VarChar(100), TCP_Descripcion)
      .query("INSERT INTO GCB_TIPO_CUENTA_BANCARIA (TCP_Tipo_cuenta, TCP_Descripcion) VALUES (@tipo, @desc)");
    res.status(201).send("Tipo de cuenta creado");
  } catch (err) {
    res.status(500).send("Error al crear tipo de cuenta");
  }
};

export const updateTipoCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { TCP_Tipo_cuenta, TCP_Descripcion } = req.body;
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("id", sql.VarChar(10), id)
      .input("tipo", sql.VarChar(10), TCP_Tipo_cuenta)
      .input("desc", sql.VarChar(100), TCP_Descripcion)
      .query("UPDATE GCB_TIPO_CUENTA_BANCARIA SET TCP_Tipo_cuenta=@tipo, TCP_Descripcion=@desc WHERE TCP_Tipo_cuenta=@id");
    res.send("Tipo de cuenta actualizado");
  } catch (err) {
    res.status(500).send("Error al actualizar tipo de cuenta");
  }
};

export const deleteTipoCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("id", sql.VarChar(10), id)
      .query("DELETE FROM GCB_TIPO_CUENTA_BANCARIA WHERE TCP_Tipo_cuenta=@id");
    res.send("Tipo de cuenta eliminado");
  } catch (err) {
    res.status(500).send("Error al eliminar tipo de cuenta");
  }
};
