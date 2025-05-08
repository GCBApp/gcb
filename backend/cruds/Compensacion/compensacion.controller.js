import sql from "mssql";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } from "../../config.js";

const sqlConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  server: DB_HOST,
  options: {
    encrypt: true, // Use true for Azure SQL Database, false for local SQL Server
    trustServerCertificate: true, // Change to true for local dev / self-signed certs
  },
};

// Obtener todas las compensaciones
export const getAllCompensaciones = async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_COMPENSACION");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener compensaciones:", err);
    res.status(500).send("Error al obtener compensaciones");
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar la conexión:", closeErr);
      }
    }
  }
};

// Obtener una compensación por ID y sus movimientos asociados
export const getCompensacionById = async (req, res) => {
  let pool = null;
  try {
    const { id } = req.params;
    pool = await sql.connect(sqlConfig);

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
    // Corregido: Filtrar por el ID de compensación correcto (@id)
    const movResult = await pool
      .request()
      .input("id", sql.Char(10), id) // Pasar el ID también a esta consulta
      .query(`
        SELECT m.*, e.EST_descripcion, e.EST_Estado
        FROM GCB_MOVIMIENTO m
        JOIN GCB_ESTADO e ON m.MOV_Movimiento = e.MOV_movimiento
        WHERE e.COM_Compensacion = @id
      `);

    // Devolver todo junto
    res.json({
      compensacion,
      movimientos: movResult.recordset,
    });

  } catch (err) {
    console.error("Error al obtener detalles de la compensación:", err);
    res.status(500).send("Error al obtener detalles de la compensación");
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar la conexión:", closeErr);
      }
    }
  }
};

// Crear una nueva compensación
export const createCompensacion = async (req, res) => {
  let pool = null;
  try {
    const { COM_Descripción, COM_Fecha, COM_Tipo, COM_Valor } = req.body;

    // Validación de datos de entrada
    if (!COM_Descripción || !COM_Fecha || !COM_Tipo || COM_Valor === undefined || COM_Valor === null) {
      console.error("Datos faltantes o inválidos:", { COM_Descripción, COM_Fecha, COM_Tipo, COM_Valor });
      return res.status(400).send("Faltan datos requeridos o el valor es inválido");
    }

    pool = await sql.connect(sqlConfig);

    // Generar el siguiente ID correlativo para la compensación
    const result = await pool.request().query(`
      SELECT ISNULL(MAX(CAST(SUBSTRING(COM_Compensacion, 3, LEN(COM_Compensacion)) AS INT)), 0) + 1 AS nextId
      FROM GCB_COMPENSACION
      WHERE PATINDEX('CM%', COM_Compensacion) = 1
    `);
    const nextId = result.recordset[0].nextId;
    const compensacionId = `CM${nextId.toString().padStart(6, "0")}`;

    // Insertar la nueva compensación
    const insertResult = await pool
      .request()
      .input("compensacion", sql.Char(10), compensacionId)
      .input("descripcion", sql.VarChar(255), COM_Descripción)
      .input("fecha", sql.Date, COM_Fecha)
      .input("tipo", sql.VarChar(50), COM_Tipo)
      .input("valor", sql.Decimal(18, 2), COM_Valor)
      .query(
        "INSERT INTO GCB_COMPENSACION (COM_Compensacion, COM_Descripción, COM_Fecha, COM_Tipo, COM_Valor) VALUES (@compensacion, @descripcion, @fecha, @tipo, @valor)"
      );

    console.log("Resultado de la inserción:", insertResult);

    // Recuperar el registro recién insertado para confirmar
    const insertedCompensacion = await pool
      .request()
      .input("compensacion", sql.Char(10), compensacionId)
      .query("SELECT * FROM GCB_COMPENSACION WHERE COM_Compensacion = @compensacion");

    console.log("Registro insertado recuperado:", insertedCompensacion.recordset[0]);

    res.status(201).json({
      message: "Compensación creada exitosamente.",
      compensacion: insertedCompensacion.recordset[0],
    });
  } catch (err) {
    console.error("Error al crear la compensación:", err);
    res.status(500).send("Error al crear la compensación");
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar la conexión:", closeErr);
      }
    }
  }
};

// Actualizar una compensación existente
export const updateCompensacion = async (req, res) => {
  let pool = null;
  try {
    const { id } = req.params;
    const { COM_Descripción, COM_Fecha, COM_Tipo, COM_Valor } = req.body; // COM_Compensacion (ID) no se debe actualizar

    // Validación de datos de entrada
    if (!COM_Descripción || !COM_Fecha || !COM_Tipo || COM_Valor === undefined || COM_Valor === null) {
      return res.status(400).send("Faltan datos requeridos o el valor es inválido");
    }

    pool = await sql.connect(sqlConfig);

    // Verificar si la compensación existe antes de actualizar
    const checkExists = await pool.request()
      .input("id", sql.Char(10), id)
      .query("SELECT COUNT(*) AS count FROM GCB_COMPENSACION WHERE COM_Compensacion = @id");

    if (checkExists.recordset[0].count === 0) {
        return res.status(404).send("Compensación no encontrada para actualizar.");
    }

    // Actualizar la compensación
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .input("descripcion", sql.VarChar, COM_Descripción)
      .input("fecha", sql.Date, COM_Fecha)
      .input("tipo", sql.VarChar, COM_Tipo)
      .input("valor", sql.Decimal(18, 2), COM_Valor) // Usar Decimal
      .query(
        "UPDATE GCB_COMPENSACION SET COM_Descripción = @descripcion, COM_Fecha = @fecha, COM_Tipo = @tipo, COM_Valor = @valor WHERE COM_Compensacion = @id"
      );
    res.send("Compensación actualizada");
  } catch (err) {
    console.error("Error al actualizar la compensación:", err);
    res.status(500).send("Error al actualizar la compensación");
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar la conexión:", closeErr);
      }
    }
  }
};


// Eliminar una compensación
export const deleteCompensacion = async (req, res) => {
  let pool = null;
  try {
    const { id } = req.params;
    pool = await sql.connect(sqlConfig);

    // Opcional: Verificar si la compensación existe antes de eliminar
    const checkExists = await pool.request()
      .input("id", sql.Char(10), id)
      .query("SELECT COUNT(*) AS count FROM GCB_COMPENSACION WHERE COM_Compensacion = @id");

    if (checkExists.recordset[0].count === 0) {
        return res.status(404).send("Compensación no encontrada para eliminar.");
    }

    // Eliminar la compensación
    // Nota: Considerar si hay dependencias en GCB_ESTADO que deban manejarse
    // Podría necesitar eliminar primero los estados relacionados o impedir la eliminación si existen.
    await pool
      .request()
      .input("id", sql.Char(10), id)
      .query("DELETE FROM GCB_COMPENSACION WHERE COM_Compensacion = @id");
    res.send("Compensación eliminada");
  } catch (err) {
    console.error("Error al eliminar la compensación:", err);
    // Si el error es por restricción de clave foránea (FK)
    if (err.number === 547) { // Código de error típico para FK en SQL Server
        return res.status(409).send("No se puede eliminar la compensación porque está referenciada en otros registros (estados).");
    }
    res.status(500).send("Error al eliminar la compensación");
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar la conexión:", closeErr);
      }
    }
  }
};

// Procesar una compensación: Crear la compensación y los estados asociados a movimientos
export const processCompensation = async (req, res) => {
  console.log("Iniciando processCompensation");
  let pool = null;
  let transaction = null; // Usar transacciones para asegurar atomicidad

  try {
    const { compensacionData, movimientosIds } = req.body;
    console.log("Datos recibidos:", { compensacionData, movimientosIds });

    // Validación de datos de entrada
    if (!compensacionData || !movimientosIds || !Array.isArray(movimientosIds) || movimientosIds.length === 0 ||
        !compensacionData.COM_Compensacion || !compensacionData.COM_Descripción || !compensacionData.COM_Fecha ||
        !compensacionData.COM_Tipo || compensacionData.COM_Valor === undefined || compensacionData.COM_Valor === null) {
      return res.status(400).send("Datos incompletos para procesar la compensación");
    }

    pool = await sql.connect(sqlConfig);
    transaction = new sql.Transaction(pool); // Iniciar transacción
    await transaction.begin();

    const request = new sql.Request(transaction); // Usar la transacción para todas las consultas

    const compensacionId = compensacionData.COM_Compensacion.trim();
    const descripcionComp = compensacionData.COM_Descripción;
    const fechaComp = compensacionData.COM_Fecha;
    const tipoComp = compensacionData.COM_Tipo.trim();
    const valorComp = compensacionData.COM_Valor;

    // 1. Verificar si la compensación ya existe (dentro de la transacción)
     const checkCompExists = await request
       .input("compensacionId", sql.Char(10), compensacionId)
       .query("SELECT COUNT(*) AS count FROM GCB_COMPENSACION WHERE COM_Compensacion = @compensacionId");

     if (checkCompExists.recordset[0].count > 0) {
         await transaction.rollback(); // Revertir transacción
         return res.status(409).send("Ya existe una compensación con esa referencia.");
     }

    // 2. Insertar en la tabla GCB_COMPENSACION usando parámetros
    console.log("Insertando compensación:", compensacionId);
    const insertRequest = new sql.Request(transaction);
    await insertRequest
      .input("compId", sql.Char(10), compensacionId) // Changed parameter name
      .input("descripcion", sql.VarChar, descripcionComp)
      .input("fecha", sql.Date, fechaComp)
      .input("tipo", sql.VarChar, tipoComp)
      .input("valor", sql.Decimal(18, 2), valorComp)
      .query(
        "INSERT INTO GCB_COMPENSACION (COM_Compensacion, COM_Descripción, COM_Fecha, COM_Tipo, COM_Valor) VALUES (@compId, @descripcion, @fecha, @tipo, @valor)"
      );
    console.log("Compensación registrada correctamente");

    // 3. Procesar cada movimiento y crear los estados asociados
    let procesados = 0;
    const estadoDescripcionBase = `Movimiento compensado por ${compensacionId}`;

    for (const movId of movimientosIds) {
      const cleanMovIdStr = movId.trim();
      console.log(`Procesando movimiento ID: ${cleanMovIdStr}`);

      // Validar que movId sea numérico antes de convertir
      const movIdInt = parseInt(cleanMovIdStr, 10);
      if (isNaN(movIdInt)) {
          console.warn(`Advertencia: ID de movimiento inválido '${cleanMovIdStr}', saltando.`);
          continue; // Saltar este ID inválido
      }

      // Crear una nueva instancia de Request para cada iteración dentro de la transacción
      const estadoRequest = new sql.Request(transaction);

      // Verificar si el movimiento existe
      const checkMovResult = await estadoRequest // Usar estadoRequest
        .input("movId", sql.Int, movIdInt) // Usar el ID numérico
        .query("SELECT COUNT(*) AS count FROM GCB_MOVIMIENTO WHERE MOV_Movimiento = @movId");

      if (checkMovResult.recordset[0].count === 0) {
        console.warn(`Advertencia: Movimiento ${cleanMovIdStr} no encontrado, saltando.`);
        continue; // Saltar si el movimiento no existe
      }

      // Obtener el siguiente ID para estado (Asumiendo que EST_Estado es IDENTITY o se maneja de otra forma)
      // Si EST_Estado NO es IDENTITY, necesitas obtener el MAX + 1 aquí DENTRO del bucle y DENTRO de la transacción
      // Ejemplo (si no es IDENTITY):
      // const maxEstadoResult = await estadoRequest.query("SELECT ISNULL(MAX(EST_Estado), 0) + 1 AS nextId FROM GCB_ESTADO");
      // const estadoId = maxEstadoResult.recordset[0].nextId;
      // console.log(`Creando nuevo estado con ID: ${estadoId}`);

      const estadoDescripcion = `${estadoDescripcionBase} (ID: ${cleanMovIdStr})`;

      // Insertar en GCB_ESTADO usando parámetros
      // Asumiendo que EST_Estado es IDENTITY. Si no, añade .input("estadoId", sql.Int, estadoId) y el campo en VALUES
      await estadoRequest // Usar estadoRequest
        .input("movId", sql.Int, movIdInt) // Usar el ID numérico
        .input("compIdForEstado", sql.Char(10), compensacionId) // Changed parameter name to avoid conflict
        .input("descripcionEstado", sql.VarChar, estadoDescripcion)
        .query(`
          INSERT INTO GCB_ESTADO (MOV_movimiento, COM_Compensacion, EST_descripcion)
          VALUES (@movId, @compIdForEstado, @descripcionEstado)
        `); // Updated parameter reference in the query

      console.log(`Estado creado para movimiento ${cleanMovIdStr}`);
      procesados++;
    }

    await transaction.commit(); // Confirmar la transacción si todo fue bien
    console.log(`Procesamiento completado: ${procesados} movimientos compensados`);

    res.status(200).json({
      message: "Compensación procesada correctamente",
      compensacionId: compensacionId,
      movimientosCompensados: procesados,
    });

  } catch (err) {
    console.error("Error en processCompensation:", err);
    if (transaction) {
      try {
        await transaction.rollback(); // Revertir en caso de error
        console.log("Transacción revertida debido a error.");
      } catch (rollbackErr) {
        console.error("Error al revertir la transacción:", rollbackErr);
      }
    }
    res.status(500).json({
      message: "Error al procesar la compensación",
      error: err.message,
    });
  } finally {
    if (pool) {
      try {
        await pool.close(); // Cerrar la conexión principal
        console.log("Conexión cerrada");
      } catch (closeErr) {
        console.error("Error al cerrar la conexión:", closeErr);
      }
    }
  }
};


// Función para verificar esquemas de tablas (opcional, para depuración)
export const checkTableSchemas = async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(sqlConfig);

    const getSchema = async (tableName) => {
      return await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '${tableName}'
        ORDER BY ORDINAL_POSITION
      `);
    };

    const compensacionSchema = await getSchema('GCB_COMPENSACION');
    const estadoSchema = await getSchema('GCB_ESTADO');
    const movimientoSchema = await getSchema('GCB_MOVIMIENTO');

    res.json({
      compensacion: compensacionSchema.recordset,
      estado: estadoSchema.recordset,
      movimiento: movimientoSchema.recordset
    });

  } catch (err) {
    console.error("Error al verificar esquemas:", err);
    res.status(500).send("Error al verificar esquemas de tablas");
  } finally {
     if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar la conexión:", closeErr);
      }
    }
  }
};

// Obtener el siguiente ID de compensación
export const getNextCompensacionId = async (req, res) => {
  let pool = null;
  try {
    pool = await sql.connect(sqlConfig);

    // Obtener el siguiente ID correlativo
    const result = await pool.request().query(`
      SELECT ISNULL(MAX(CAST(SUBSTRING(COM_Compensacion, 3, LEN(COM_Compensacion)) AS INT)), 0) + 1 AS nextId
      FROM GCB_COMPENSACION
    `);
    const nextId = result.recordset[0].nextId;
    const compensacionId = `CM${nextId.toString().padStart(6, "0")}`;

    res.json({ nextId: compensacionId });
  } catch (err) {
    console.error("Error al obtener el siguiente ID de compensación:", err);
    res.status(500).send("Error al obtener el siguiente ID de compensación");
  } finally {
    if (pool) {
      try {
        await pool.close();
      } catch (closeErr) {
        console.error("Error al cerrar la conexión:", closeErr);
      }
    }
  }
};