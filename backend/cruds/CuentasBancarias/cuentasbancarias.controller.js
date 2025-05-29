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
        cb.TCP_Tipo_cuenta,
        tcp.TCP_Descripcion,
        cb.CUB_Numero,
        cb.CUB_saldo,
        cb.BAN_banco,
        b.BAN_Nombre AS Banco_Nombre,
        cb.MON_moneda,
        m.MON_nombre AS Moneda_Nombre
      FROM 
        GCB_CUENTA_BANCARIA cb
      INNER JOIN 
        GCB_BANCOS b ON cb.BAN_banco = b.BAN_banco
      INNER JOIN
        GCB_MONEDA m ON cb.MON_moneda = m.MON_moneda
      INNER JOIN
        GCB_TIPO_CUENTA_BANCARIA tcp ON cb.TCP_Tipo_cuenta = tcp.TCP_Tipo_cuenta
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
    const { CUB_Nombre, TCP_Tipo_cuenta, BAN_banco, MON_moneda, CUB_Numero, CUB_saldo } = req.body;

    if (!CUB_Nombre || !TCP_Tipo_cuenta || !BAN_banco || !MON_moneda || !CUB_Numero) {
      return res.status(400).send("Faltan datos requeridos: CUB_Nombre, TCP_Tipo_cuenta, BAN_banco, MON_moneda o CUB_Numero");
    }

    const pool = await sql.connect(sqlConfig);

    let newCuentaId;
    let exists = true;
    let counter = 1;

    while (exists) {
      newCuentaId = `CB${String(counter).padStart(6, "0")}`;
      const checkId = await pool
        .request()
        .input("cuenta", sql.VarChar(20), newCuentaId)
        .query("SELECT COUNT(*) AS count FROM GCB_CUENTA_BANCARIA WHERE CUB_Cuentabancaria = @cuenta");

      if (checkId.recordset[0].count === 0) {
        exists = false;
      } else {
        counter++;
      }
    }

    await pool
      .request()
      .input("cuenta", sql.VarChar(20), newCuentaId)
      .input("nombre", sql.VarChar(100), CUB_Nombre)
      .input("tipo_cuenta", sql.VarChar(10), TCP_Tipo_cuenta)
      .input("banco", sql.VarChar(10), BAN_banco)
      .input("moneda", sql.VarChar(10), MON_moneda)
      .input("numero", sql.Int, CUB_Numero)
      .input("saldo", sql.Decimal(9, 2), CUB_saldo)
      .query(
        "INSERT INTO GCB_CUENTA_BANCARIA (CUB_Cuentabancaria, CUB_Nombre, TCP_Tipo_cuenta, BAN_banco, MON_moneda, CUB_Numero, CUB_saldo) VALUES (@cuenta, @nombre, @tipo_cuenta, @banco, @moneda, @numero, @saldo)"
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
