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

export const getAllTipoMovimientos = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_TIPO_MOVIMIENTO");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los tipos de movimiento");
  }
};

export const getTipoMovimientoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM GCB_TIPO_MOVIMIENTO WHERE TM_Tipomovimiento = @id");
    
    if (result.recordset.length === 0) {
      return res.status(404).send("Tipo de movimiento no encontrado");
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener el tipo de movimiento");
  }
};

export const createTipoMovimiento = async (req, res) => {
  try {
    const { TM_Tipomovimiento, TM_descripcion } = req.body;

    // Validación de datos
    if (TM_Tipomovimiento === undefined) {
      return res.status(400).send("Falta dato requerido: TM_Tipomovimiento");
    }

    const pool = await sql.connect(sqlConfig);

    // Verificar si el ID ya existe
    const checkId = await pool
      .request()
      .input("tipomovimiento", sql.Int, TM_Tipomovimiento)
      .query("SELECT COUNT(*) AS count FROM GCB_TIPO_MOVIMIENTO WHERE TM_Tipomovimiento = @tipomovimiento");

    if (checkId.recordset[0].count > 0) {
      return res.status(400).send("El ID ya existe. No se pueden agregar registros duplicados.");
    }

    // Insertar el nuevo registro
    await pool
      .request()
      .input("tipomovimiento", sql.Int, TM_Tipomovimiento)
      .input("descripcion", sql.VarChar, TM_descripcion)
      .query(
        "INSERT INTO GCB_TIPO_MOVIMIENTO (TM_Tipomovimiento, TM_descripcion) VALUES (@tipomovimiento, @descripcion)"
      );
    res.status(201).send("Tipo de movimiento creado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear el tipo de movimiento");
  }
};

export const updateTipoMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { TM_Tipomovimiento, TM_descripcion } = req.body;

    // Validación de datos
    if (TM_Tipomovimiento === undefined) {
      return res.status(400).send("Falta dato requerido: TM_Tipomovimiento");
    }

    const pool = await sql.connect(sqlConfig);
    
    // Verificar si el registro existe
    const checkExists = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT COUNT(*) AS count FROM GCB_TIPO_MOVIMIENTO WHERE TM_Tipomovimiento = @id");

    if (checkExists.recordset[0].count === 0) {
      return res.status(404).send("Tipo de movimiento no encontrado");
    }
    
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("tipomovimiento", sql.Int, TM_Tipomovimiento)
      .input("descripcion", sql.VarChar, TM_descripcion)
      .query(
        "UPDATE GCB_TIPO_MOVIMIENTO SET TM_Tipomovimiento = @tipomovimiento, TM_descripcion = @descripcion WHERE TM_Tipomovimiento = @id"
      );
    res.send("Tipo de movimiento actualizado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar el tipo de movimiento");
  }
};

export const deleteTipoMovimiento = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await sql.connect(sqlConfig);
    
    // Verificar si el registro existe
    const checkExists = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT COUNT(*) AS count FROM GCB_TIPO_MOVIMIENTO WHERE TM_Tipomovimiento = @id");

    if (checkExists.recordset[0].count === 0) {
      return res.status(404).send("Tipo de movimiento no encontrado");
    }
    
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM GCB_TIPO_MOVIMIENTO WHERE TM_Tipomovimiento = @id");
    res.send("Tipo de movimiento eliminado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar el tipo de movimiento");
  }
};