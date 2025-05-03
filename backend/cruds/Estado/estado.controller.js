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

export const getAllEstados = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query(`
      SELECT 
        e.EST_Estado,
        e.MOV_movimiento,
        m.MOV_id,
        m.MOV_Descripcion,
        e.COM_Compensacion,
        c.COM_Descripción AS COM_Descripcion,
        e.EST_Descripcion,
        m.MOV_Valor,
        c.COM_Valor,
        m.MOV_Valor_GTQ,
        m.MOV_Fecha_Registro,
        m.MOV_Fecha_Mov,
        u.US_nombre AS NombreUsuario,
        tm.TM_descripcion AS TipoMovimiento,
        cb.CUB_Nombre AS CuentaBancaria
      FROM GCB_ESTADO e
      INNER JOIN GCB_MOVIMIENTO m ON e.MOV_movimiento = m.MOV_Movimiento
      INNER JOIN GCB_COMPENSACION c ON e.COM_Compensacion = c.COM_Compensacion
      INNER JOIN GCB_USUARIOS u ON m.US_Usuario = u.US_Usuario
      INNER JOIN GCB_TIPO_MOVIMIENTO tm ON m.TM_Tipomovimiento = tm.TM_Tipomovimiento
      INNER JOIN GCB_CUENTA_BANCARIA cb ON m.CUB_Cuentabancaria = cb.CUB_Cuentabancaria
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener estados");
  }
};

export const getEstadoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM GCB_ESTADO WHERE EST_Estado = @id");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener el estado");
  }
};

export const createEstado = async (req, res) => {
  try {
    const { EST_Estado, MOV_movimiento, COM_Compensacion, EST_Descripcion } = req.body;

    if (!MOV_movimiento || !COM_Compensacion || !EST_Descripcion) {
      return res.status(400).send("Faltan datos requeridos");
    }

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("estado", sql.Char(10), EST_Estado)
      .input("movimiento", sql.Char(10), MOV_movimiento)
      .input("compensacion", sql.Char(10), COM_Compensacion)
      .input("descripcion", sql.Char(50), EST_Descripcion)
      .query(
        "INSERT INTO GCB_ESTADO (EST_Estado, MOV_movimiento, COM_Compensacion, EST_Descripcion) VALUES (@estado, @movimiento, @compensacion, @descripcion)"
      );
    res.status(201).send("Estado creado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear el estado");
  }
};

export const updateEstado = async (req, res) => {
  const { id } = req.params;
  const { EST_Descripcion } = req.body;

  if (!EST_Descripcion) {
    return res.status(400).send("El campo EST_Descripcion es requerido.");
  }

  try {
    const pool = await sql.connect(sqlConfig); // Conexión a la base de datos
    const result = await pool
      .request()
      .input("descripcion", sql.VarChar(50), EST_Descripcion)
      .input("id", sql.Char(10), id)
      .query("UPDATE GCB_ESTADO SET EST_Descripcion = @descripcion WHERE EST_Estado = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Estado no encontrado.");
    }

    res.status(200).send({ message: "Estado actualizado correctamente." });
  } catch (err) {
    console.error("Error al actualizar el estado:", err);
    res.status(500).send("Error al actualizar el estado.");
  }
};

export const deleteEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM GCB_ESTADO WHERE EST_Estado = @id");
    res.send("Estado eliminado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar el estado");
  }
};

export const getEstadosByCompensacion = async (req, res) => {
  try {
    const { compensacionId } = req.params;
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("compensacionId", sql.Char(10), compensacionId)
      .query("SELECT * FROM GCB_ESTADO WHERE COM_Compensacion = @compensacionId");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los estados por compensación");
  }
};