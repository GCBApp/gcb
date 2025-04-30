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

// Listar movimientos
export const getAllMovimientos = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query(`
      SELECT 
          M.MOV_Movimiento,
          M.MOV_id,
          U.US_nombre AS NombreUsuario,
          MO.MON_nombre AS Moneda,
          TM.TM_descripcion AS TipoMovimiento,
          CB.CUB_Nombre AS CuentaBancaria,
          M.MOV_Descripcion,
          M.MOV_Fecha_Mov,
          M.MOV_Fecha_Registro,
          M.MOV_Valor
      FROM 
          GCB_MOVIMIENTO M
      JOIN 
          GCB_USUARIOS U ON M.US_Usuario = U.US_Usuario
      JOIN 
          GCB_MONEDA MO ON M.MON_Moneda = MO.MON_moneda
      JOIN 
          GCB_TIPO_MOVIMIENTO TM ON M.TM_Tipomovimiento = TM.TM_Tipomovimiento
      JOIN 
          GCB_CUENTA_BANCARIA CB ON M.CUB_Cuentabancaria = CB.CUB_Cuentabancaria
      ORDER BY 
          M.MOV_Fecha_Mov DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al listar movimientos:", err);
    res.status(500).send("Error al listar movimientos.");
  }
};

// Crear movimiento
export const createMovimiento = async (req, res) => {
  try {
    const { MOV_Movimiento, MOV_id, US_Usuario, MON_Moneda, TM_Tipomovimiento, CUB_Cuentabancaria, MOV_Descripcion, MOV_Fecha_Mov, MOV_Valor } = req.body;

    if (!MOV_Movimiento || !US_Usuario || !MON_Moneda || !TM_Tipomovimiento || !CUB_Cuentabancaria) {
      return res.status(400).send("Faltan datos requeridos.");
    }

    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("movimiento", sql.VarChar(50), MOV_Movimiento) // MOV_Movimiento como llave primaria
      .input("id", sql.VarChar(50), MOV_id)
      .input("usuario", sql.Char(10), US_Usuario)
      .input("moneda", sql.Char(10), MON_Moneda)
      .input("tipoMovimiento", sql.Char(10), TM_Tipomovimiento)
      .input("cuentaBancaria", sql.Char(10), CUB_Cuentabancaria)
      .input("descripcion", sql.VarChar(255), MOV_Descripcion)
      .input("fechaMov", sql.DateTime, MOV_Fecha_Mov)
      .input("fechaRegistro", sql.DateTime, new Date()) // Fecha de registro actual
      .input("valor", sql.Decimal(18, 2), MOV_Valor)
      .query(`
        INSERT INTO GCB_MOVIMIENTO (MOV_Movimiento, MOV_id, US_Usuario, MON_Moneda, TM_Tipomovimiento, CUB_Cuentabancaria, MOV_Descripcion, MOV_Fecha_Mov, MOV_Fecha_Registro, MOV_Valor)
        VALUES (@movimiento, @id, @usuario, @moneda, @tipoMovimiento, @cuentaBancaria, @descripcion, @fechaMov, @fechaRegistro, @valor)
      `);

    res.status(201).send("Movimiento creado.");
  } catch (err) {
    console.error("Error al crear movimiento:", err);
    res.status(500).send("Error al crear movimiento.");
  }
};

// Actualizar movimiento
export const updateMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { MOV_id, US_Usuario, MON_Moneda, TM_Tipomovimiento, CUB_Cuentabancaria, MOV_Descripcion, MOV_Fecha_Mov, MOV_Valor } = req.body;

    if (!US_Usuario || !MON_Moneda || !TM_Tipomovimiento || !CUB_Cuentabancaria) {
      return res.status(400).send("Faltan datos requeridos.");
    }

    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("movimiento", sql.VarChar(50), id) // MOV_Movimiento como llave primaria
      .input("id", sql.VarChar(50), MOV_id)
      .input("usuario", sql.Char(10), US_Usuario)
      .input("moneda", sql.Char(10), MON_Moneda)
      .input("tipoMovimiento", sql.Char(10), TM_Tipomovimiento)
      .input("cuentaBancaria", sql.Char(10), CUB_Cuentabancaria)
      .input("descripcion", sql.VarChar(255), MOV_Descripcion)
      .input("fechaMov", sql.DateTime, MOV_Fecha_Mov)
      .input("valor", sql.Decimal(18, 2), MOV_Valor)
      .query(`
        UPDATE GCB_MOVIMIENTO
        SET MOV_id = @id, 
            US_Usuario = @usuario, 
            MON_Moneda = @moneda, 
            TM_Tipomovimiento = @tipoMovimiento, 
            CUB_Cuentabancaria = @cuentaBancaria, 
            MOV_Descripcion = @descripcion, 
            MOV_Fecha_Mov = @fechaMov, 
            MOV_Valor = @valor
        WHERE MOV_Movimiento = @movimiento
      `);

    res.send("Movimiento actualizado");
  } catch (err) {
    console.error("Error al actualizar movimiento:", err);
    res.status(500).send("Error al actualizar movimiento.");
  }
};

// Eliminar movimiento
export const deleteMovimiento = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("movimiento", sql.VarChar(50), id) // MOV_Movimiento como llave primaria
      .query("DELETE FROM GCB_MOVIMIENTO WHERE MOV_Movimiento = @movimiento");

    res.send("Movimiento eliminado.");
  } catch (err) {
    console.error("Error al eliminar movimiento:", err);
    res.status(500).send("Error al eliminar movimiento.");
  }
};