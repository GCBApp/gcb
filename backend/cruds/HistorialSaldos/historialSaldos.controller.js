import sql from "mssql";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } from "../../config.js";

const sqlConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  server: DB_HOST,
  options: { encrypt: true, trustServerCertificate: true },
};

export const getAllHistorialSaldos = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_HISTORIAL_SALDOS");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send("Error al obtener historial de saldos");
  }
};

export const createHistorialSaldos = async (req, res) => {
  try {
    const { HIS_Historial, CUB_Cuentabancaria, HIS_Fecha, HIS_Saldo } = req.body;
    if (!HIS_Historial || !CUB_Cuentabancaria) return res.status(400).send("Faltan datos requeridos");
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("HIS_Historial", sql.VarChar(20), HIS_Historial)
      .input("CUB_Cuentabancaria", sql.VarChar(20), CUB_Cuentabancaria)
      .input("HIS_Fecha", sql.Date, HIS_Fecha)
      .input("HIS_Saldo", sql.Decimal(18, 2), HIS_Saldo)
      .query("INSERT INTO GCB_HISTORIAL_SALDOS (HIS_Historial, CUB_Cuentabancaria, HIS_Fecha, HIS_Saldo) VALUES (@HIS_Historial, @CUB_Cuentabancaria, @HIS_Fecha, @HIS_Saldo)");
    res.status(201).send("Historial de saldos creado");
  } catch (err) {
    res.status(500).send("Error al crear historial de saldos");
  }
};

export const updateHistorialSaldos = async (req, res) => {
  try {
    const { id } = req.params;
    const { HIS_Historial, CUB_Cuentabancaria, HIS_Fecha, HIS_Saldo } = req.body;
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("id", sql.VarChar(20), id)
      .input("HIS_Historial", sql.VarChar(20), HIS_Historial)
      .input("CUB_Cuentabancaria", sql.VarChar(20), CUB_Cuentabancaria)
      .input("HIS_Fecha", sql.Date, HIS_Fecha)
      .input("HIS_Saldo", sql.Decimal(18, 2), HIS_Saldo)
      .query("UPDATE GCB_HISTORIAL_SALDOS SET HIS_Historial=@HIS_Historial, CUB_Cuentabancaria=@CUB_Cuentabancaria, HIS_Fecha=@HIS_Fecha, HIS_Saldo=@HIS_Saldo WHERE HIS_Historial=@id");
    res.send("Historial de saldos actualizado");
  } catch (err) {
    res.status(500).send("Error al actualizar historial de saldos");
  }
};

export const deleteHistorialSaldos = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("id", sql.VarChar(20), id)
      .query("DELETE FROM GCB_HISTORIAL_SALDOS WHERE HIS_Historial=@id");
    res.send("Historial de saldos eliminado");
  } catch (err) {
    res.status(500).send("Error al eliminar historial de saldos");
  }
};
