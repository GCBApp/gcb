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

export const getAllTipoUsuarios = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_TIPOS_USUARIOS");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener los tipos de usuario");
  }
};

export const getTipoUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("SELECT * FROM GCB_TIPOS_USUARIOS WHERE TU_tipousuario = @id");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener el tipo de usuario");
  }
};

export const createTipoUsuario = async (req, res) => {
  try {
    const { TU_tipousuario, TU_descripcion } = req.body;

    // Validación de datos
    if (!TU_tipousuario || !TU_descripcion) {
      return res.status(400).send("Faltan datos requeridos: TU_tipousuario o TU_descripcion");
    }

    const pool = await sql.connect(sqlConfig);

    // Verificar si el ID ya existe
    const checkId = await pool
      .request()
      .input("tipousuario", sql.Char(10), TU_tipousuario)
      .query("SELECT COUNT(*) AS count FROM GCB_TIPOS_USUARIOS WHERE TU_tipousuario = @tipousuario");

    if (checkId.recordset[0].count > 0) {
      return res.status(400).send("El ID ya existe. No se pueden agregar registros duplicados.");
    }

    // Insertar el nuevo registro
    await pool
      .request()
      .input("tipousuario", sql.Char(10), TU_tipousuario)
      .input("descripcion", sql.VarChar, TU_descripcion)
      .query(
        "INSERT INTO GCB_TIPOS_USUARIOS (TU_tipousuario, TU_descripcion) VALUES (@tipousuario, @descripcion)"
      );
    res.status(201).send("Tipo de usuario creado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear el tipo de usuario");
  }
};

export const updateTipoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { TU_tipousuario, TU_descripcion } = req.body;

    // Validación de datos
    if (!TU_tipousuario || !TU_descripcion) {
      return res.status(400).send("Faltan datos requeridos: TU_tipousuario o TU_descripcion");
    }

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .input("tipousuario", sql.Char(10), TU_tipousuario)
      .input("descripcion", sql.VarChar, TU_descripcion)
      .query(
        "UPDATE GCB_TIPOS_USUARIOS SET TU_tipousuario = @tipousuario, TU_descripcion = @descripcion WHERE TU_tipousuario = @id"
      );
    res.send("Tipo de usuario actualizado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar el tipo de usuario");
  }
};

export const deleteTipoUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("DELETE FROM GCB_TIPOS_USUARIOS WHERE TU_tipousuario = @id");
    res.send("Tipo de usuario eliminado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar el tipo de usuario");
  }
};
