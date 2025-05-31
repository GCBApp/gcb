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

// Obtener todos los empleados
export const getAllEmpleados = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query(`
      SELECT 
        E.EMP_Empleado,
        E.EMP_Usuario,
        E.TU_tipousuario,
        T.TU_descripcion,
        E.EMP_Nombre,
        E.EMP_Apellido,
        E.EMP_Correo,
        E.EMP_Telefono,
        E.EMP_Direccion
      FROM GCB_EMPLEADO E, GCB_TIPOS_USUARIOS T
      WHERE E.TU_tipousuario = T.TU_tipousuario
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener los empleados:", err);
    res.status(500).send("Error al obtener empleados");
  }
};

// Obtener empleado por ID
export const getEmpleadoById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("SELECT E.*, T.TU_descripcion FROM GCB_EMPLEADO E JOIN GCB_TIPOS_USUARIOS T ON E.TU_tipousuario = T.TU_tipousuario WHERE EMP_Empleado = @id");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener empleado");
  }
};

// Crear empleado
export const createEmpleado = async (req, res) => {
  try {
    const { EMP_Empleado, EMP_Usuario, EMP_Contraseña, TU_tipousuario, EMP_Nombre, EMP_Apellido, EMP_Correo, EMP_Telefono, EMP_Direccion } = req.body;

    if (!EMP_Empleado || !EMP_Usuario || !EMP_Contraseña || !TU_tipousuario) {
      return res.status(400).send("Faltan datos requeridos");
    }

    const pool = await sql.connect(sqlConfig);

    // Verificar si el ID ya existe
    const checkId = await pool
      .request()
      .input("empleado", sql.Char(10), EMP_Empleado)
      .query("SELECT COUNT(*) AS count FROM GCB_EMPLEADO WHERE EMP_Empleado = @empleado");

    if (checkId.recordset[0].count > 0) {
      return res.status(400).send("El empleado ya existe. No se pueden agregar registros duplicados.");
    }

    await pool
      .request()
      .input("empleado", sql.Char(10), EMP_Empleado)
      .input("usuario", sql.VarChar(50), EMP_Usuario)
      .input("contraseña", sql.VarChar(255), EMP_Contraseña)
      .input("tipousuario", sql.VarChar(10), TU_tipousuario)
      .input("nombre", sql.VarChar(100), EMP_Nombre)
      .input("apellido", sql.VarChar(100), EMP_Apellido)
      .input("correo", sql.VarChar(100), EMP_Correo)
      .input("telefono", sql.VarChar(20), EMP_Telefono)
      .input("direccion", sql.VarChar(200), EMP_Direccion)
      .query(
        "INSERT INTO GCB_EMPLEADO (EMP_Empleado, EMP_Usuario, EMP_Contraseña, TU_tipousuario, EMP_Nombre, EMP_Apellido, EMP_Correo, EMP_Telefono, EMP_Direccion) VALUES (@empleado, @usuario, @contraseña, @tipousuario, @nombre, @apellido, @correo, @telefono, @direccion)"
      );
    res.status(201).send("Empleado creado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear empleado");
  }
};

// Actualizar empleado
export const updateEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { EMP_Empleado, EMP_Usuario, EMP_Contraseña, TU_tipousuario, EMP_Nombre, EMP_Apellido, EMP_Correo, EMP_Telefono, EMP_Direccion } = req.body;

    if (!EMP_Empleado || !EMP_Usuario || !EMP_Contraseña || !TU_tipousuario) {
      return res.status(400).send("Faltan datos requeridos");
    }

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .input("empleado", sql.Char(10), EMP_Empleado)
      .input("usuario", sql.VarChar(50), EMP_Usuario)
      .input("contraseña", sql.VarChar(255), EMP_Contraseña)
      .input("tipousuario", sql.VarChar(10), TU_tipousuario)
      .input("nombre", sql.VarChar(100), EMP_Nombre)
      .input("apellido", sql.VarChar(100), EMP_Apellido)
      .input("correo", sql.VarChar(100), EMP_Correo)
      .input("telefono", sql.VarChar(20), EMP_Telefono)
      .input("direccion", sql.VarChar(200), EMP_Direccion)
      .query(
        "UPDATE GCB_EMPLEADO SET EMP_Empleado=@empleado, EMP_Usuario=@usuario, EMP_Contraseña=@contraseña, TU_tipousuario=@tipousuario, EMP_Nombre=@nombre, EMP_Apellido=@apellido, EMP_Correo=@correo, EMP_Telefono=@telefono, EMP_Direccion=@direccion WHERE EMP_Empleado=@id"
      );
    res.send("Empleado actualizado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar empleado");
  }
};

// Eliminar empleado
export const deleteEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("DELETE FROM GCB_EMPLEADO WHERE EMP_Empleado = @id");
    res.send("Empleado eliminado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar empleado");
  }
};

// Obtener tipos de usuario (si tu modelo lo requiere)
export const getTiposEmpleado = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_TIPOS_USUARIOS");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener tipos de usuario");
  }
};

// LOGIN usando la tabla empleado
export const login = async (req, res) => {
  const { usuario, contrasena } = req.body;
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request()
      .input("usuario", sql.VarChar(50), usuario)
      .input("contrasena", sql.VarChar(255), contrasena)
      .query("SELECT E.*, T.TU_descripcion FROM GCB_EMPLEADO E JOIN GCB_TIPOS_USUARIOS T ON E.TU_tipousuario = T.TU_tipousuario WHERE EMP_Usuario = @usuario AND EMP_Contraseña = @contrasena");
    if (result.recordset.length > 0) {
      res.json({ success: true, empleado: result.recordset[0] });
    } else {
      res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { actual, nueva } = req.body;

    if (!actual || !nueva) {
      return res.status(400).json({ message: "Debe ingresar la contraseña actual y la nueva." });
    }

    const pool = await sql.connect(sqlConfig);

    // Obtener la contraseña actual de la base de datos
    const result = await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("SELECT EMP_Contraseña FROM GCB_EMPLEADO WHERE EMP_Empleado = @id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Empleado no encontrado." });
    }

    const contrasenaActualDB = result.recordset[0].EMP_Contraseña;

    // Validar la contraseña actual
    if (contrasenaActualDB !== actual) {
      return res.status(401).json({ message: "La contraseña actual es incorrecta." });
    }

    // Actualizar la contraseña
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .input("nueva", sql.VarChar(255), nueva)
      .query("UPDATE GCB_EMPLEADO SET EMP_Contraseña = @nueva WHERE EMP_Empleado = @id");

    res.json({ message: "Contraseña actualizada correctamente." });
  } catch (err) {
    console.error("Error al cambiar la contraseña:", err);
    res.status(500).json({ message: "Error al cambiar la contraseña." });
  }
};