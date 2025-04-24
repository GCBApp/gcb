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
    console.log("Iniciando getAllMovimientos");
    const pool = await sql.connect(sqlConfig);
    
    try {
      // 1. Consulta básica - obtenemos solo los datos de la tabla principal
      const result = await pool.request().query(`
        SELECT TOP 100 * FROM GCB_MOVIMIENTO 
        ORDER BY MOV_Fecha_Registro DESC
      `);
      
      console.log(`Recuperados ${result.recordset.length} movimientos básicos`);
      
      if (result.recordset.length > 0) {
        // 2. Obtener datos de las tablas relacionadas
        const tiposResult = await pool.request().query("SELECT * FROM GCB_TIPO_MOVIMIENTO");
        const monedasResult = await pool.request().query("SELECT * FROM GCB_MONEDA");
        const usuariosResult = await pool.request().query("SELECT * FROM GCB_USUARIOS");
        const cuentasResult = await pool.request().query("SELECT * FROM GCB_CUENTA_BANCARIA");
        
        console.log(`Datos relacionados: ${tiposResult.recordset.length} tipos, ${monedasResult.recordset.length} monedas, ${usuariosResult.recordset.length} usuarios`);
        
        // 3. Crear mapas para búsqueda rápida con mejor manejo de tipos
        const tiposMap = {};
        tiposResult.recordset.forEach(t => {
          // Extraer el número del ID si tiene formato "TM1001"
          let numericKey = t.TM_Tipomovimiento;
          if (typeof t.TM_Tipomovimiento === 'string' && t.TM_Tipomovimiento.includes('TM')) {
            numericKey = parseInt(t.TM_Tipomovimiento.replace(/\D/g, ''));
          }
          // Guardar en el mapa usando el valor numérico como clave
          tiposMap[numericKey] = t.TM_descripcion;
        });

        const monedasMap = {};
        monedasResult.recordset.forEach(m => {
          // Extraer el número del ID si tiene formato "MO1001"
          let numericKey = m.MON_moneda;
          if (typeof m.MON_moneda === 'string' && m.MON_moneda.includes('MO')) {
            numericKey = parseInt(m.MON_moneda.replace(/\D/g, ''));
          }
          // Guardar en el mapa usando el valor numérico como clave
          monedasMap[numericKey] = m.MON_nombre || m.MON_Nombre;
        });

        const usuariosMap = {};
        usuariosResult.recordset.forEach(u => {
          // Extraer el número del ID si tiene formato "US4"
          let numericKey = u.US_Usuario;
          if (typeof u.US_Usuario === 'string' && isNaN(parseInt(u.US_Usuario))) {
            const match = u.US_Usuario.match(/\d+/);
            if (match) {
              numericKey = parseInt(match[0]);
            }
          }
          // Guardar en el mapa usando el valor numérico como clave
          usuariosMap[numericKey] = u.US_nombre || u.US_Nombre;
        });

        const cuentasMap = {};
        cuentasResult.recordset.forEach(c => {
          // Extraer el número del ID si tiene formato "CB1001"
          let numericKey = c.CUB_Cuentabancaria;
          if (typeof c.CUB_Cuentabancaria === 'string' && c.CUB_Cuentabancaria.includes('CB')) {
            numericKey = parseInt(c.CUB_Cuentabancaria.replace(/\D/g, ''));
          }
          // Guardar en el mapa usando el valor numérico como clave
          cuentasMap[numericKey] = c.CUB_Nombre;
        });

        // Añadir depuración para ver qué claves se han creado
        console.log("Claves en tiposMap:", Object.keys(tiposMap));
        console.log("Claves en monedasMap:", Object.keys(monedasMap));
        console.log("Claves en usuariosMap:", Object.keys(usuariosMap));
        
        // 4. Enriquecer los datos
        const enrichedData = result.recordset.map(m => {
          return {
            ...m,
            TM_descripcion: tiposMap[m.TM_Tipomovimiento] || "Sin especificar",
            MON_Nombre: monedasMap[m.MON_Moneda] || "Sin especificar",
            US_Nombre: usuariosMap[m.US_Usuario] || "Sin especificar",
            CUB_NombreCompleto: cuentasMap[m.CUB_Cuentabancaria] || "Sin especificar"
          };
        });
        
        // 5. Mostrar un ejemplo del resultado para diagnóstico
        if (enrichedData.length > 0) {
          console.log("Ejemplo de registro enriquecido:", {
            id: enrichedData[0].MOV_id?.trim(),
            tipo: enrichedData[0].TM_descripcion,
            moneda: enrichedData[0].MON_Nombre,
            usuario: enrichedData[0].US_Nombre
          });
        }
        
        return res.json(enrichedData);
      } else {
        // No hay datos que mostrar
        return res.json([]);
      }
    } catch (basicQueryError) {
      console.error("Error en consulta básica:", basicQueryError);
      res.status(500).send(`Error al obtener los datos: ${basicQueryError.message}`);
    }
  } catch (error) {
    console.error("Error general en getAllMovimientos:", error);
    res.status(500).send(`Error al obtener los movimientos: ${error.message}`);
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