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

export const getAllCuentas = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query(`
      SELECT 
        cb.CUB_Cuentabancaria,
        cb.CUB_Nombre,
        cb.CUB_Tipo,
        cb.CUB_Número,
        cb.CUB_saldo,
        cb.MON_Moneda,
        b.BAN_Nombre AS Banco_Nombre,
        b.BAN_Pais AS Banco_Pais
      FROM GCB_CUENTA_BANCARIA cb
      INNER JOIN GCB_BANCOS b ON cb.BAN_Banco = b.BAN_bancos
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener cuentas:", err);
    res.status(500).send("Error al obtener cuentas");
  }
};

export const getCuentaById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("SELECT * FROM GCB_CUENTA_BANCARIA WHERE CUB_Cuentabancaria = @id");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener cuenta bancaria");
  }
};

export const createCuenta = async (req, res) => {
  try {
    const { CUB_Cuentabancaria, CUB_Nombre, CUB_Tipo, BAN_banco, MON_moneda, CUB_Número, CUB_saldo} = req.body;

    // Validación de datos
    if (!CUB_Cuentabancaria || !CUB_Nombre || !CUB_Tipo || !BAN_banco || !MON_moneda || !CUB_Número) {
      return res.status(400).send("Faltan datos requeridos: CUB_Cuentabancaria, CUB_Nombre, CUB_Tipo, BAN_banco, MON_moneda o CUB_Número");
    }

    const pool = await sql.connect(sqlConfig);

    // Verificar si el ID ya existe
    const checkId = await pool
      .request()
      .input("cuenta", sql.Char(10), CUB_Cuentabancaria)
      .query("SELECT COUNT(*) AS count FROM GCB_CUENTA_BANCARIA WHERE CUB_Cuentabancaria = @cuenta");

    if (checkId.recordset[0].count > 0) {
      return res.status(400).send("La cuenta ya existe. No se pueden agregar registros duplicados.");
    }

    // Insertar el nuevo registro
    await pool
      .request()
      .input("cuenta", sql.Char(10), CUB_Cuentabancaria)
      .input("nombre", sql.VarChar, CUB_Nombre)
      .input("tipo", sql.VarChar, CUB_Tipo)
      .input("banco", sql.Char(10), BAN_banco)
      .input("moneda", sql.VarChar, MON_moneda)
      .input("Número", sql.Int, CUB_Número)
      .input("saldo", sql.Int, CUB_saldo)
      .query(
        "INSERT INTO GCB_CUENTA_BANCARIA (CUB_Cuentabancaria, CUB_Nombre, CUB_Tipo, BAN_banco, MON_moneda, CUB_Número, CUB_saldo) VALUES (@cuenta, @nombre, @tipo, @banco, @moneda, @Número, @saldo)"
      );
    res.status(201).send("Cuenta creada");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear Cuenta bancaria");
  }
};

export const updateCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const { CUB_Cuentabancaria, CUB_Nombre, CUB_Tipo, BAN_banco, MON_moneda, CUB_Número, CUB_saldo} = req.body;

    // Validación de datos
    if (!CUB_Cuentabancaria || !CUB_Nombre || !CUB_Tipo || !BAN_banco || !MON_moneda || !CUB_Número) {
        return res.status(400).send("Faltan datos requeridos: CUB_Cuentabancaria o CUB_nombre o CUB_Tipo o BAN_banco o MON_moneda o CUB_Número");
    }

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .input("cuenta", sql.Char(10), CUB_Cuentabancaria)
      .input("nombre", sql.VarChar, CUB_Nombre)
      .input("tipo", sql.VarChar, CUB_Tipo)
      .input("banco", sql.Char(10), BAN_banco)
      .input("moneda", sql.VarChar, MON_moneda)
      .input("Número", sql.Int, CUB_Número)
      .input("saldo", sql.Int, CUB_saldo)
      .query(
        "UPDATE GCB_CUENTA_BANCARIA SET CUB_Cuentabancaria = @cuenta, CUB_nombre = @nombre, CUB_Tipo = @tipo, BAN_banco = @banco, MON_moneda = @moneda, CUB_Número = @Número, CUB_saldo = @saldo WHERE CUB_Cuentabancaria = @id"
      );
    res.send("Cuenta actualizada");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar Cuenta bancaria");
  }
};

export const deleteCuenta = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("DELETE FROM GCB_CUENTA_BANCARIA WHERE CUB_Cuentabancaria = @id");
    res.send("Cuenta eliminada");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar cuenta bancaria");
  }
};
