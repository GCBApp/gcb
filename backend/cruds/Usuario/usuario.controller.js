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

export const getAllUsuarios = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query(`
      SELECT 
        US_usuario, 
        TU_tipousuario, 
        US_nombre, 
        US_correo, 
        US_contraseña
      FROM GCB_USUARIOS
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener usuarios");
  }
};

export const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM GCB_USUARIOS WHERE US_usuario = @id");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener usuario");
  }
};

export const createUsuario = async (req, res) => {
  try {
    const { US_usuario, TU_tipousuario, US_nombre, US_correo, US_contraseña } = req.body;

    // Validación de datos
    if (!US_usuario || !TU_tipousuario) {
      return res.status(400).send("Faltan datos requeridos: US_usuario o TU_tipousuario");
    }

    const pool = await sql.connect(sqlConfig);

    // Verificar si el ID ya existe
    const checkId = await pool
      .request()
      .input("usuario", sql.Int, US_usuario)
      .query("SELECT COUNT(*) AS count FROM GCB_USUARIOS WHERE US_usuario = @usuario");

    if (checkId.recordset[0].count > 0) {
      return res.status(400).send("El usuario ya existe. No se pueden agregar registros duplicados.");
    }

    // Insertar el nuevo registro
    await pool
      .request()
      .input("usuario", sql.Int, US_usuario)
      .input("tipousuario", sql.Int, TU_tipousuario)
      .input("nombre", sql.VarChar(40), US_nombre)
      .input("correo", sql.VarChar(40), US_correo)
      .input("contraseña", sql.VarChar(20), US_contraseña)
      .query(
        "INSERT INTO GCB_USUARIOS (US_usuario, TU_tipousuario, US_nombre, US_correo, US_contraseña) VALUES (@usuario, @tipousuario, @nombre, @correo, @contraseña)"
      );
    res.status(201).send("Usuario creado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear usuario");
  }
};

export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { US_usuario, TU_tipousuario, US_nombre, US_correo, US_contraseña } = req.body;

    // Validación de datos
    if (!US_usuario || !TU_tipousuario) {
      return res.status(400).send("Faltan datos requeridos: US_usuario o TU_tipousuario");
    }

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("usuario", sql.Int, US_usuario)
      .input("tipousuario", sql.Int, TU_tipousuario)
      .input("nombre", sql.VarChar(40), US_nombre)
      .input("correo", sql.VarChar(40), US_correo)
      .input("contraseña", sql.VarChar(20), US_contraseña)
      .query(
        "UPDATE GCB_USUARIOS SET US_usuario = @usuario, TU_tipousuario = @tipousuario, US_nombre = @nombre, US_correo = @correo, US_contraseña = @contraseña WHERE US_usuario = @id"
      );
    res.send("Usuario actualizado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar usuario");
  }
};

export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM GCB_USUARIOS WHERE US_usuario = @id");
    res.send("Usuario eliminado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar usuario");
  }
};
