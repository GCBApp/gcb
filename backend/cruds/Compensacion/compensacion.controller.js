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

export const getAllCompensaciones = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_COMPENSACION");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener compensaciones");
  }
};

export const getCompensacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    
    // Obtener la compensación
    const compResult = await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("SELECT * FROM GCB_COMPENSACION WHERE COM_Compensacion = @id");
    
    const compensacion = compResult.recordset[0];
    
    if (!compensacion) {
      return res.status(404).send("Compensación no encontrada");
    }
    
    // Obtener los movimientos asociados a través de GCB_ESTADO
    const movResult = await pool
      .request()
      .query(`
        SELECT m.*, e.EST_descripcion, e.EST_Estado 
        FROM GCB_MOVIMIENTO m
        JOIN GCB_ESTADO e ON m.MOV_Movimiento = e.MOV_movimiento
        WHERE e.COM_Compensacion = 1
      `);
    
    // Devolver todo junto
    res.json({
      compensacion,
      movimientos: movResult.recordset
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener detalles de la compensación");
  }
};

export const createCompensacion = async (req, res) => {
  try {
    const { COM_Compensacion, COM_Descripción, COM_Fecha, COM_Tipo, COM_Valor } = req.body;

    if (!COM_Compensacion ||!COM_Descripción || !COM_Fecha || !COM_Tipo || !COM_Valor) {
      return res.status(400).send("Faltan datos requeridos");
    }

    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("compensacion", sql.Char(10), COM_Compensacion)
      .input("descripcion", sql.VarChar, COM_Descripción)
      .input("fecha", sql.Date, COM_Fecha)
      .input("tipo", sql.VarChar, COM_Tipo)
      .input("valor", sql.Int, COM_Valor)
      .query(
        "INSERT INTO GCB_COMPENSACION (COM_Compensacion, COM_Descripción, COM_Fecha, COM_Tipo, COM_Valor) VALUES (@compensacion, @descripcion, @fecha, @tipo, @valor)"
      );
    res.status(201).send("Compensación creada");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear la compensación");
  }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar la compensación");
  }ry {
};  const { id } = req.params;
    const { COM_Compensacion, COM_Descripción, COM_Fecha, COM_Tipo, COM_Valor } = req.body;
export const deleteCompensacion = async (req, res) => {
  try {(!COM_Descripción || !COM_Fecha || !COM_Tipo || !COM_Valor) {
    const { id } = req.params;end("Faltan datos requeridos");
    const pool = await sql.connect(sqlConfig);
    await pool
      .request() await sql.connect(sqlConfig);
      .input("id", sql.Char(10), id)
      .query("DELETE FROM GCB_COMPENSACION WHERE COM_Compensacion = @id");
    res.send("Compensación eliminada");
  } catch (err) {pensacion", sql.Char(10), COM_Compensacion)
    console.error(err);on", sql.VarChar, COM_Descripción)
    res.status(500).send("Error al eliminar la compensación");
  }   .input("tipo", sql.VarChar, COM_Tipo)
};    .input("valor", sql.Int, COM_Valor)
      .query(
export const processCompensation = async (req, res) => {@compensacion, COM_Descripción = @descripcion, COM_Fecha = @fecha, COM_Tipo = @tipo, COM_Valor = @valor WHERE COM_Compensacion = @id"
  console.log("Iniciando processCompensation");
  let pool = null;ensación actualizada");
  } catch (err) {
  try {sole.error(err);
    const { compensacionData, movimientosIds } = req.body;ión");
    console.log("Datos recibidos:", { compensacionData, movimientosIds });
    
    if (!compensacionData || !movimientosIds || !Array.isArray(movimientosIds) || movimientosIds.length === 0) {
      return res.status(400).send("Datos incompletos para la compensación");
    } {
    const { id } = req.params;
    // Crear una sola conexión a la base de datos
    pool = await sql.connect(sqlConfig);
      .request()
    // 1. Insertar en la tabla GCB_COMPENSACION usando SQL directo sin parametrización
    // Escapar las comillas simples para prevenir inyección SQLon = @id");
    const compensacionId = compensacionData.COM_Compensacion.trim().replace(/'/g, "''");
    const descripcion = compensacionData.COM_Descripción.replace(/'/g, "''");
    const fecha = new Date(compensacionData.COM_Fecha).toISOString().split('T')[0];
    const tipo = compensacionData.COM_Tipo.trim().replace(/'/g, "''");
    const valor = compensacionData.COM_Valor;
    
    const sqlInsertComp = `
      INSERT INTO GCB_COMPENSACION (COM_Compensacion, COM_Descripción, COM_Fecha, COM_Tipo, COM_Valor)
      VALUES ('${compensacionId}', '${descripcion}', '${fecha}', '${tipo}', ${valor})
    `;pool = null;
    
    console.log("SQL a ejecutar:", sqlInsertComp);
    const { compensacionData, movimientosIds } = req.body;
    await pool.request().query(sqlInsertComp);cionData, movimientosIds });
    console.log("Compensación registrada correctamente");
    if (!compensacionData || !movimientosIds || !Array.isArray(movimientosIds) || movimientosIds.length === 0) {
    // 2. Procesar cada movimiento y crear los estados usando SQL directo");
    let procesados = 0;
    
    for (const movId of movimientosIds) {de datos
      const cleanMovId = movId.trim(););
      console.log(`Procesando movimiento ID: ${cleanMovId}`);
       1. Insertar en la tabla GCB_COMPENSACION usando SQL directo sin parametrización
      // Verificar si el movimiento existe usando SQL directoQL
      const checkResult = await pool.request().query(nsacion.trim().replace(/'/g, "''");
        `SELECT COUNT(*) AS count FROM GCB_MOVIMIENTO WHERE MOV_Movimiento = ${parseInt(cleanMovId)}`
      );t fecha = new Date(compensacionData.COM_Fecha).toISOString().split('T')[0];
      nst tipo = compensacionData.COM_Tipo.trim().replace(/'/g, "''");
      if (checkResult.recordset[0].count === 0) {
        console.log(`Advertencia: Movimiento ${cleanMovId} no encontrado`);
        continue;rtComp = `
      }NSERT INTO GCB_COMPENSACION (COM_Compensacion, COM_Descripción, COM_Fecha, COM_Tipo, COM_Valor)
      VALUES ('${compensacionId}', '${descripcion}', '${fecha}', '${tipo}', ${valor})
      // Obtener el siguiente ID para estado
      const maxEstadoResult = await pool.request().query(
        `SELECT ISNULL(MAX(EST_Estado), 0) + 1 AS nextId FROM GCB_ESTADO`
      );
      ait pool.request().query(sqlInsertComp);
      const estadoId = maxEstadoResult.recordset[0].nextId;
      console.log(`Creando nuevo estado con ID: ${estadoId}`);
       2. Procesar cada movimiento y crear los estados usando SQL directo
      // Usar SQL directo para la inserción en GCB_ESTADO
      const estadoDescripcion = `Movimiento ${cleanMovId} compensado por ${compensacionId}`.replace(/'/g, "''");
      r (const movId of movimientosIds) {
      const sqlInsertEstado = `trim();
        INSERT INTO GCB_ESTADO (EST_Estado, MOV_movimiento, COM_Compensacion, EST_descripcion) 
        VALUES (${estadoId}, ${parseInt(cleanMovId)}, 1, '${estadoDescripcion}')
      `; Verificar si el movimiento existe usando SQL directo
      const checkResult = await pool.request().query(
      console.log("SQL para estado:", sqlInsertEstado);HERE MOV_Movimiento = ${parseInt(cleanMovId)}`
      );
      try {
        await pool.request().query(sqlInsertEstado);
        console.log(`Estado creado para movimiento ${cleanMovId}`);trado`);
        procesados++;
      } catch (insertErr) {
        console.error(`Error al insertar estado para movimiento ${cleanMovId}:`, insertErr);
      }/ Obtener el siguiente ID para estado
    } const maxEstadoResult = await pool.request().query(
        `SELECT ISNULL(MAX(EST_Estado), 0) + 1 AS nextId FROM GCB_ESTADO`
    console.log(`Procesamiento completado: ${procesados} movimientos compensados`);
      
    res.status(200).json({EstadoResult.recordset[0].nextId;
      message: "Compensación procesada correctamente", oId}`);
      compensacionId: compensacionId,
      movimientosCompensados: procesadosión en GCB_ESTADO
    });onst estadoDescripcion = `Movimiento ${cleanMovId} compensado por ${compensacionId}`.replace(/'/g, "''");
      
  } catch (err) {sertEstado = `
    console.error("Error en processCompensation:", err);to, COM_Compensacion, EST_descripcion) 
        VALUES (${estadoId}, ${parseInt(cleanMovId)}, 1, '${estadoDescripcion}')
    res.status(500).json({
      message: "Error al procesar la compensación",
      error: err.messageara estado:", sqlInsertEstado);
    });
  } finally {
    try {wait pool.request().query(sqlInsertEstado);
      // Cerrar la conexión en cualquier casoiento ${cleanMovId}`);
      if (pool) {s++;
        await pool.close();
        console.log("Conexión cerrada"); estado para movimiento ${cleanMovId}:`, insertErr);
      }
    } catch (closeErr) {
      console.error("Error al cerrar la conexión:", closeErr);
    }onsole.log(`Procesamiento completado: ${procesados} movimientos compensados`);
  } 
};  res.status(200).json({
      message: "Compensación procesada correctamente", 
// Añadir esta función para verificar esquemas de tablas
export const checkTableSchemas = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    catch (err) {
    // Verificar esquema de compensaciónnsation:", err);
    const compensacionSchema = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNScompensación",
      WHERE TABLE_NAME = 'GCB_COMPENSACION'
    `);
    finally {
    // Verificar esquema de estado
    const estadoSchema = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'GCB_ESTADO'");
    `);
    } catch (closeErr) {
    // Verificar esquema de movimientoa conexión:", closeErr);
    const movimientoSchema = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'GCB_MOVIMIENTO'
    `);ir esta función para verificar esquemas de tablas
    rt const checkTableSchemas = async (req, res) => {
    res.json({
      compensacion: compensacionSchema.recordset,
      estado: estadoSchema.recordset,
      movimiento: movimientoSchema.recordset
    });st compensacionSchema = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
  } catch (err) {ATION_SCHEMA.COLUMNS
    console.error("Error al verificar esquemas:", err);
    res.status(500).send("Error al verificar esquemas de tablas");
  } 
};  // Verificar esquema de estado
    const estadoSchema = await pool.request().query(`
// Vista ejemplo para DetalleCompensacionACTER_MAXIMUM_LENGTH 
function DetalleCompensacion({ compensacionId }) {
  // Obtener detalles de la compensación
  const [compensacion, setCompensacion] = useState(null);
  // Obtener movimientos asociados
  const [movimientos, setMovimientos] = useState([]);
    const movimientoSchema = await pool.request().query(`
  useEffect(() => {_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
    // Cargar datos..._SCHEMA.COLUMNS
    // También cargar los movimientos relacionados con esta compensación
  }, [compensacionId]);
    
  return (on({
    <div>pensacion: compensacionSchema.recordset,
      {/* Mostrar detalles de la compensación */}
      {/* Mostrar lista de movimientos compensados */}
    </div>
  );
} } catch (err) {
    console.error("Error al verificar esquemas:", err);
    res.status(500).send("Error al verificar esquemas de tablas");
  }
};

// Vista ejemplo para DetalleCompensacion
function DetalleCompensacion({ compensacionId }) {
  // Obtener detalles de la compensación
  const [compensacion, setCompensacion] = useState(null);
  // Obtener movimientos asociados
  const [movimientos, setMovimientos] = useState([]);
  
  useEffect(() => {
    // Cargar datos...
    // También cargar los movimientos relacionados con esta compensación
  }, [compensacionId]);
  
  return (
    <div>
      {/* Mostrar detalles de la compensación */}
      {/* Mostrar lista de movimientos compensados */}
    </div>
  );
}
