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

export const getAllBancos = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_BANCOS");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener bancos");
  }
};

export const getBancoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("SELECT * FROM GCB_BANCOS WHERE BAN_banco = @id");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener banco");
  }
};

export const createBanco = async (req, res) => {
  try {
    const { BAN_banco, BAN_Nombre, BAN_Pais } = req.body;

    // Validación de datos
    if (!BAN_banco || !BAN_Nombre) {
      return res.status(400).send("Faltan datos requeridos: BAN_banco o BAN_Nombre");
    }

    const pool = await sql.connect(sqlConfig);

    // Verificar si el ID ya existe
    const checkId = await pool
      .request()
      .input("banco", sql.Char(10), BAN_banco)
      .query("SELECT COUNT(*) AS count FROM GCB_BANCOS WHERE BAN_banco = @banco");

    if (checkId.recordset[0].count > 0) {
      return res.status(400).send("El banco ya existe. No se pueden agregar registros duplicados.");
    }

    // Insertar el nuevo registro
    await pool
      .request()
      .input("banco", sql.Char(10), BAN_banco)
      .input("nombre", sql.VarChar, BAN_Nombre)
      .input("pais", sql.VarChar, BAN_Pais)
      .query(
        "INSERT INTO GCB_BANCOS (BAN_banco, BAN_Nombre, BAN_Pais) VALUES (@banco, @nombre, @pais)"
      );
    res.status(201).send("Banco creado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear banco");
  }
};

export const updateBanco = async (req, res) => {
  try {
    const { id } = req.params;
    const { BAN_banco, BAN_Nombre, BAN_Pais } = req.body;

    // Validación de datos
    if (!BAN_banco) {
      return res.status(400).send("Faltan datos requeridos: BAN_banco");
    }

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .input("banco", sql.Char(10), BAN_banco)
      .input("nombre", sql.VarChar, BAN_Nombre)
      .input("pais", sql.VarChar, BAN_Pais)
      .query(
        "UPDATE GCB_BANCOS SET BAN_banco = @banco, BAN_Nombre = @nombre, BAN_Pais = @pais WHERE BAN_banco = @id"
      );
    res.send("Banco actualizado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar banco");
  }
};

export const deleteBanco = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("DELETE FROM GCB_BANCOS WHERE BAN_banco = @id");
    res.send("Banco eliminado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar banco");
  }
};
