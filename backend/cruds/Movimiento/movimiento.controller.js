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

export const getAllMovimientos = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query(`
      SELECT 
        m.*,
        tm.TM_descripcion,
        mon.MON_Nombre,
        u.US_Nombre
      FROM GCB_MOVIMIENTO m
      LEFT JOIN GCB_TIPO_MOVIMIENTO tm ON m.TM_Tipomovimiento = tm.TM_Tipomovimiento
      LEFT JOIN GCB_CUENTA_BANCARIA cb ON m.CUB_Cuentabancaria = cb.CUB_Cuentabancaria
      LEFT JOIN GCB_MONEDA mon ON m.MON_Moneda = mon.MON_Moneda
      LEFT JOIN GCB_USUARIOS u ON m.US_Usuario = u.US_Usuario
      ORDER BY m.MOV_Fecha_Registro DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los movimientos");
  }
};

export const getMovimientoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("SELECT * FROM GCB_MOVIMIENTO WHERE MOV_Movimiento = @id");
    
    if (result.recordset.length === 0) {
      return res.status(404).send("Movimiento no encontrado");
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener el movimiento");
  }
};

export const createMovimiento = async (req, res) => {
  try {
    console.log("Cuerpo recibido:", req.body);
    
    const { 
      MOV_id, 
      MOV_Descripcion,
      MOV_Valor, 
      MOV_Fecha_Mov, 
      MOV_Fecha_Registro, 
      US_Usuario, 
      MON_Moneda, 
      TM_Tipomovimiento, 
      CUB_Cuentabancaria 
    } = req.body;

    // Validaciones básicas
    if (!MOV_id) {
      return res.status(400).send("Falta dato requerido: MOV_id");
    }

    if (!TM_Tipomovimiento) {
      return res.status(400).send("Falta dato requerido: TM_Tipomovimiento");
    }

    if (!CUB_Cuentabancaria) {
      return res.status(400).send("Falta dato requerido: CUB_Cuentabancaria");
    }

    const pool = await sql.connect(sqlConfig);

    // Verificar si ya existe este ID
    const checkId = await pool
      .request()
      .input("movId", sql.Char(10), MOV_id)
      .query("SELECT COUNT(*) AS count FROM GCB_MOVIMIENTO WHERE MOV_id = @movId");

    if (checkId.recordset[0].count > 0) {
      return res.status(400).send("El ID de movimiento ya existe");
    }
    
    // Obtener el máximo MOV_Movimiento actual y sumar 1
    const maxIdResult = await pool
      .request()
      .query("SELECT ISNULL(MAX(MOV_Movimiento), 0) + 1 AS nextId FROM GCB_MOVIMIENTO");
    
    const nextId = maxIdResult.recordset[0].nextId;
    console.log("Siguiente ID a usar:", nextId);
    
    // Insertar el nuevo movimiento con el ID generado
    const result = await pool
      .request()
      .input("movMovimiento", sql.Int, nextId) // Nuevo parámetro para MOV_Movimiento
      .input("movId", sql.Char(10), MOV_id)
      .input("descripcion", sql.NVarChar(100), MOV_Descripcion || '')
      .input("valor", sql.Decimal(18, 2), MOV_Valor || 0)
      .input("fechaMov", sql.Date, MOV_Fecha_Mov || new Date())
      .input("fechaRegistro", sql.Date, MOV_Fecha_Registro || new Date())
      .input("usuario", sql.Int, US_Usuario || null)
      .input("moneda", sql.Int, MON_Moneda || null)
      .input("tipoMovimiento", sql.Int, TM_Tipomovimiento)
      .input("cuentaBancaria", sql.Int, CUB_Cuentabancaria)
      .query(`
        INSERT INTO GCB_MOVIMIENTO (
          MOV_Movimiento, -- Agregado este campo
          MOV_id, MOV_Descripcion, MOV_Valor, MOV_Fecha_Mov, 
          MOV_Fecha_Registro, US_Usuario, MON_Moneda, 
          TM_Tipomovimiento, CUB_Cuentabancaria
        )
        VALUES (
          @movMovimiento, -- Agregado este valor
          @movId, @descripcion, @valor, @fechaMov, 
          @fechaRegistro, @usuario, @moneda, 
          @tipoMovimiento, @cuentaBancaria
        )
      `);
    
    res.status(201).json({ 
      message: "Movimiento creado exitosamente",
      id: nextId
    });
  } catch (err) {
    console.error("Error al crear movimiento:", err);
    res.status(500).send("Error al crear el movimiento: " + err.message);
  }
};

export const updateMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Actualizando movimiento ID:", id);
    console.log("Datos recibidos:", req.body);
    
    const { 
      MOV_id, 
      MOV_Descripcion, // Corregido de MOV_Description a MOV_Descripcion
      MOV_Valor, 
      MOV_Fecha_Mov, 
      MOV_Fecha_Registro, 
      US_Usuario, 
      MON_Moneda, 
      TM_Tipomovimiento, 
      CUB_Cuentabancaria 
    } = req.body;

    // Validaciones
    if (!MOV_id) {
      return res.status(400).send("Falta dato requerido: MOV_id");
    }

    const pool = await sql.connect(sqlConfig);
    
    // Verificar si el movimiento existe
    const checkExists = await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("SELECT COUNT(*) AS count FROM GCB_MOVIMIENTO WHERE MOV_Movimiento = @id");

    if (checkExists.recordset[0].count === 0) {
      return res.status(404).send("Movimiento no encontrado");
    }
    
    // Actualizar movimiento
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .input("movId", sql.Char(10), MOV_id)
      .input("descripcion", sql.NVarChar(100), MOV_Descripcion || '')
      .input("valor", sql.Decimal(18, 2), MOV_Valor || 0)
      .input("fechaMov", sql.Date, MOV_Fecha_Mov || null)
      .input("fechaRegistro", sql.Date, MOV_Fecha_Registro || null)
      .input("usuario", sql.Int, US_Usuario || null)
      .input("moneda", sql.Int, MON_Moneda || null)
      .input("tipoMovimiento", sql.Int, TM_Tipomovimiento || null)
      .input("cuentaBancaria", sql.Int, CUB_Cuentabancaria || null)
      .query(`
        UPDATE GCB_MOVIMIENTO SET 
          MOV_id = @movId,
          MOV_Descripcion = @descripcion,
          MOV_Valor = @valor,
          MOV_Fecha_Mov = @fechaMov,
          MOV_Fecha_Registro = @fechaRegistro,
          US_Usuario = @usuario,
          MON_Moneda = @moneda,
          TM_Tipomovimiento = @tipoMovimiento,
          CUB_Cuentabancaria = @cuentaBancaria
        WHERE MOV_Movimiento = @id
      `);
    
    res.json({ message: "Movimiento actualizado exitosamente" });
  } catch (err) {
    console.error("Error al actualizar:", err);
    res.status(500).send("Error al actualizar el movimiento: " + err.message);
  }
};

export const deleteMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Intentando eliminar movimiento con ID:", id);
    
    const pool = await sql.connect(sqlConfig);
    
    // Verificar si el movimiento existe
    const checkExists = await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("SELECT COUNT(*) AS count FROM GCB_MOVIMIENTO WHERE MOV_Movimiento = @id");

    if (checkExists.recordset[0].count === 0) {
      console.log("Movimiento no encontrado");
      return res.status(404).send("Movimiento no encontrado");
    }
    
    // Eliminar movimiento
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("DELETE FROM GCB_MOVIMIENTO WHERE MOV_Movimiento = @id");
    
    console.log("Movimiento eliminado correctamente");
    res.json({ message: "Movimiento eliminado exitosamente" });
  } catch (err) {
    console.error("Error al eliminar:", err);
    res.status(500).send("Error al eliminar el movimiento: " + err.message);
  }
};

// Métodos adicionales para datos relacionados
export const getTiposMovimiento = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_TIPO_MOVIMIENTO");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los tipos de movimiento");
  }
};

export const getCuentasBancarias = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_CUENTA_BANCARIA");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener las cuentas bancarias");
  }
};

export const getUsuarios = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_USUARIOS");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los usuarios");
  }
};

export const getMonedas = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_MONEDA");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener las monedas");
  }
};