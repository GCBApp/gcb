import sql from "mssql";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } from "../../config.js";
import { updateExchangeRates } from "../../index.js"; // Importar la función de tipo_cambio.js
import _ from "lodash";

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

// Utilidad para comparar estados ignorando tildes, mayúsculas y espacios
function esConciliado(desc) {
  if (!desc) return false;
  return _.deburr(desc).toLowerCase().replace(/\s+/g, " ").trim() === "conciliado";
}

// Listar movimientos
export const getAllMovimientos = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query(`
      SELECT DISTINCT
          M.MOV_movimiento AS MOV_Movimiento,
          M.MOV_Referencia AS MOV_id,
          ISNULL(U.EMP_Nombre, 'Desconocido') AS NombreUsuario,
          ISNULL(MO.MON_nombre, 'Desconocido') AS Moneda,
          ISNULL(TM.TM_descripcion, 'Desconocido') AS TipoMovimiento,
          ISNULL(CB.CUB_Nombre, 'Desconocido') AS CuentaBancaria,
          M.MOV_Estado AS EST_Id, -- ID del estado (varchar)
          ISNULL(E.EST_Descripcion, 'Pendiente') AS EST_Descripcion, -- Descripción real del estado
          M.MOV_Descripcion,
          M.MOV_Fecha_Documento AS MOV_Fecha_Mov,
          M.MOV_Fecha_Registro,
          M.MOV_Monto AS MOV_Valor,
          M.MOV_Tipo_Cambio,
          M.MOV_Monto_GTQ AS MOV_Valor_GTQ
      FROM 
          GCB_MOVIMIENTO M
      LEFT JOIN 
          GCB_EMPLEADO U ON M.US_usuario = U.EMP_Usuario
      LEFT JOIN 
          GCB_MONEDA MO ON M.MON_Moneda = MO.MON_moneda
      LEFT JOIN 
          GCB_TIPO_MOVIMIENTO TM ON M.TM_Tipomovimiento = TM.TM_Tipomovimiento
      LEFT JOIN 
          GCB_CUENTA_BANCARIA CB ON M.CUB_Cuentabancaria = CB.CUB_Cuentabancaria
      LEFT JOIN 
          GCB_ESTADO E ON M.MOV_Estado = E.EST_Estado
      ORDER BY 
          M.MOV_movimiento ASC
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
    console.log("Datos recibidos en el backend:", req.body); // Depuración: Verificar datos recibidos
    const { MOV_Referencia, US_usuario, MON_Moneda, TM_Tipomovimiento, CUB_Cuentabancaria, MOV_Descripcion, MOV_Fecha_Documento, MOV_Monto, MOV_Monto_GTQ, MOV_Tipo_Cambio } = req.body;

    if (!US_usuario || !MON_Moneda || !TM_Tipomovimiento || !CUB_Cuentabancaria) {
      return res.status(400).send("Faltan datos requeridos.");
    }

    // Calcular la fecha de registro como la fecha actual menos un día y establecer la hora en 00:00:00
    const fechaRegistro = new Date();
    fechaRegistro.setDate(fechaRegistro.getDate() - 1);
    fechaRegistro.setUTCHours(0, 0, 0, 0); // Establecer la hora en 00:00:00 UTC

    // Buscar el periodo abierto que contenga la fecha de registro
    const pool = await sql.connect(sqlConfig);
    const periodoResult = await pool.request()
      .input("fecha", sql.Date, fechaRegistro)
      .query(`
        SELECT TOP 1 PER_Periodo
        FROM GCB_PERIODO
        WHERE PER_Estado = 'Abierto'
          AND @fecha >= PER_Fecha_inicio
          AND @fecha <= PER_Fecha_final
      `);
    const PER_Periodo = periodoResult.recordset[0]?.PER_Periodo || null;

    if (!PER_Periodo) {
      return res.status(400).send("No existe un periodo abierto para la fecha del movimiento.");
    }

    // Generar el siguiente correlativo para MOV_movimiento
    const result = await pool.request().query(`
      SELECT ISNULL(MAX(CAST(SUBSTRING(MOV_movimiento, 3, LEN(MOV_movimiento)) AS INT)), 0) + 1 AS nextId
      FROM GCB_MOVIMIENTO
    `);
    const nextId = result.recordset[0].nextId;
    const MOV_movimiento = `MV${nextId.toString().padStart(6, "0")}`;

    // Obtener el ID Banguat de la moneda
    const monedaInfo = await pool
      .request()
      .input("moneda", sql.Char(10), MON_Moneda)
      .query("SELECT MON_id_Banguat FROM GCB_MONEDA WHERE MON_moneda = @moneda");

    const idBanguatValue = monedaInfo.recordset[0]?.MON_id_Banguat || 0;

    // Si es la moneda local, asignar tipo de cambio 1 y continuar
    if (idBanguatValue === 1) {
      console.log(`Moneda local detectada (${MON_Moneda}). Asignando tipo de cambio 1.`);
      const tipoCambioCompra = 1;
      const valorEnGTQ = MOV_Monto * tipoCambioCompra;

      // Insertar el movimiento con tipo de cambio 1
      await pool.request()
        .input("movimiento", sql.VarChar(50), MOV_movimiento)
        .input("referencia", sql.VarChar(50), MOV_Referencia)
        .input("usuario", sql.Char(10), US_usuario)
        .input("moneda", sql.Char(10), MON_Moneda)
        .input("tipoMovimiento", sql.Char(10), TM_Tipomovimiento)
        .input("cuentaBancaria", sql.Char(10), CUB_Cuentabancaria)
        .input("descripcion", sql.VarChar(255), MOV_Descripcion)
        .input("fechaDocumento", sql.DateTime, MOV_Fecha_Documento)
        .input("fechaRegistro", sql.DateTime, fechaRegistro)
        .input("monto", sql.Decimal(18, 2), MOV_Monto)
        .input("tipoCambioCompra", sql.Decimal(18, 5), tipoCambioCompra)
        .input("montoGTQ", sql.Decimal(18, 2), valorEnGTQ)
        .input("periodo", sql.VarChar(20), PER_Periodo)
        .input("estado", sql.VarChar(10), 'ES000002')
        .query(`
          INSERT INTO GCB_MOVIMIENTO (
            MOV_movimiento, MOV_Referencia, US_usuario, MON_Moneda, TM_Tipomovimiento, CUB_Cuentabancaria,
            MOV_Descripcion, MOV_Fecha_Documento, MOV_Fecha_Registro, MOV_Monto, MOV_Tipo_Cambio, MOV_Monto_GTQ, MOV_Estado, PER_Periodo
          )
          VALUES (
            @movimiento, @referencia, @usuario, @moneda, @tipoMovimiento, @cuentaBancaria,
            @descripcion, @fechaDocumento, @fechaRegistro, @monto, @tipoCambioCompra, @montoGTQ, @estado, @periodo
          )
        `);

      // Enviar una respuesta con el movimiento creado
      return res.status(201).json({ MOV_movimiento, message: "Movimiento creado exitosamente." });
    }

    // Buscar tipo de cambio en el historial
    const fechaMovimiento = MOV_Fecha_Documento.split("T")[0]; // Usar la fecha proporcionada en el JSON

    // Verificar si existe un registro para la combinación de moneda y fecha
    let registroExistente = await pool
      .request()
      .input("moneda", sql.Char(10), MON_Moneda)
      .input("fecha", sql.Date, fechaMovimiento)
      .query(
        "SELECT COUNT(*) AS count FROM GCB_MONEDA WHERE MON_moneda = @moneda AND MON_Fecha_Mov = @fecha"
      );
    if (registroExistente.recordset[0].count === 0) {
      // Obtener el ID Banguat y el nombre de la moneda
      const monedaInfo = await pool
        .request()
        .input("moneda", sql.Char(10), MON_Moneda)
        .query("SELECT MON_id_Banguat, MON_nombre FROM GCB_MONEDA WHERE MON_moneda = @moneda");

      const idBanguatValue = monedaInfo.recordset[0]?.MON_id_Banguat || 0;
      const nombreMoneda = monedaInfo.recordset[0]?.MON_nombre || "Moneda Desconocida";

      // Solo insertar si NO existe ya un registro con la misma PK (moneda, fecha)
      const pkCheck = await pool
        .request()
        .input("moneda", sql.Char(10), MON_Moneda)
        .input("fecha", sql.Date, fechaMovimiento)
        .query("SELECT 1 FROM GCB_MONEDA WHERE MON_moneda = @moneda AND MON_Fecha_Mov = @fecha");
      if (pkCheck.recordset.length === 0) {
        await pool
          .request()
          .input("moneda", sql.Char(10), MON_Moneda)
          .input("fecha", sql.Date, fechaMovimiento)
          .input("nombre", sql.VarChar(50), nombreMoneda)
          .input("compra", sql.Decimal(18, 5), 0)
          .input("venta", sql.Decimal(18, 5), 0)
          .input("idBanguat", sql.Int, idBanguatValue)
          .query(
            "INSERT INTO GCB_MONEDA (MON_moneda, MON_Fecha_Mov, MON_nombre, MON_Tipo_Compra, MON_Tipo_Venta, MON_id_Banguat) VALUES (@moneda, @fecha, @nombre, @compra, @venta, @idBanguat)"
          );
        console.log(`Registro inicial creado para la moneda ${MON_Moneda} con la fecha ${fechaMovimiento}.`);
        // Ejecutar tipo_cambio.js para actualizar el tipo de cambio
        console.log("Ejecutando tipo_cambio.js para actualizar el tipo de cambio...");
        await updateExchangeRates();
        console.log("Actualización de tipos de cambio completada.");
      } else {
        console.log(`Ya existe un registro para la moneda ${MON_Moneda} y fecha ${fechaMovimiento}, no se inserta duplicado.`);
      }
    }

    // Intentar obtener el tipo de cambio para la moneda y la fecha del movimiento
    let fechaActual = new Date(fechaMovimiento);
    const fechaLimite = new Date("2000-01-01"); // Fecha límite para retroceder
    let tipoCambioCompra = null;

    while (fechaActual >= fechaLimite) {
      const fechaSeleccionada = fechaActual.toISOString().split("T")[0];

      const tipoCambio = await pool
        .request()
        .input("moneda", sql.Char(10), MON_Moneda)
        .input("fecha", sql.Date, fechaSeleccionada)
        .query(
          "SELECT MON_Tipo_Compra FROM GCB_MONEDA WHERE MON_moneda = @moneda AND MON_Fecha_Mov = @fecha"
        );

      if (tipoCambio.recordset.length > 0) {
        tipoCambioCompra = tipoCambio.recordset[0].MON_Tipo_Compra;
        console.log(`Tipo de cambio encontrado para ${MON_Moneda} en la fecha ${fechaSeleccionada}: ${tipoCambioCompra}`);
        break;
      }

      // Retroceder un día
      fechaActual.setDate(fechaActual.getDate() - 1);
    }

    if (!tipoCambioCompra) {
      console.error(`No se pudo obtener el tipo de cambio para la moneda ${MON_Moneda} después de retroceder hasta la fecha límite.`);
      return res.status(500).send(`No se encontró tipo de cambio para la moneda ${MON_Moneda} después de retroceder hasta la fecha límite.`);
    }

    // Convertir el valor a GTQ utilizando el tipo de cambio encontrado
    const valorEnGTQ = MOV_Monto * tipoCambioCompra;

    // Insertar el movimiento con los valores calculados
    await pool.request()
      .input("movimiento", sql.VarChar(50), MOV_movimiento)
      .input("referencia", sql.VarChar(50), MOV_Referencia)
      .input("usuario", sql.Char(10), US_usuario)
      .input("moneda", sql.Char(10), MON_Moneda)
      .input("tipoMovimiento", sql.Char(10), TM_Tipomovimiento)
      .input("cuentaBancaria", sql.Char(10), CUB_Cuentabancaria)
      .input("descripcion", sql.VarChar(255), MOV_Descripcion)
      .input("fechaDocumento", sql.DateTime, MOV_Fecha_Documento)
      .input("fechaRegistro", sql.DateTime, fechaRegistro) // Usar la variable fechaRegistro ajustada
      .input("monto", sql.Decimal(18, 2), MOV_Monto) // Valor original
      .input("tipoCambioCompra", sql.Decimal(18, 5), tipoCambioCompra) // Tipo de cambio utilizado
      .input("montoGTQ", sql.Decimal(18, 2), valorEnGTQ) // Valor convertido a GTQ
      .input("periodo", sql.VarChar(20), PER_Periodo)
      .input("estado", sql.VarChar(10), 'ES000002')
      .query(`
        INSERT INTO GCB_MOVIMIENTO (
          MOV_movimiento, MOV_Referencia, US_usuario, MON_Moneda, TM_Tipomovimiento, CUB_Cuentabancaria,
          MOV_Descripcion, MOV_Fecha_Documento, MOV_Fecha_Registro, MOV_Monto, MOV_Tipo_Cambio, MOV_Monto_GTQ, MOV_Estado, PER_Periodo
        )
        VALUES (
          @movimiento, @referencia, @usuario, @moneda, @tipoMovimiento, @cuentaBancaria,
          @descripcion, @fechaDocumento, @fechaRegistro, @monto, @tipoCambioCompra, @montoGTQ, @estado, @periodo
        )
      `);

    // Obtener descripción de estado
    const estadosRes = await pool.request().query("SELECT EST_Estado, EST_Descripcion FROM GCB_ESTADO");
    const estados = estadosRes.recordset;
    const descEstado = estados.find(e => e.EST_Estado === 'ES000002')?.EST_Descripcion || ""; // ES000002 es el default, pero puede variar
    if (esConciliado(descEstado)) {
      // Actualizar saldo de la cuenta bancaria
      await pool.request()
        .input("CUB_Cuentabancaria", sql.VarChar(50), CUB_Cuentabancaria)
        .input("MOV_Monto_GTQ", sql.Decimal(18, 2), valorEnGTQ)
        .query(`UPDATE GCB_CUENTA_BANCARIA SET CUB_saldo = CUB_saldo + @MOV_Monto_GTQ WHERE CUB_Cuentabancaria = @CUB_Cuentabancaria`);
      // Registrar en historial de saldos
      const fechaHoy = new Date().toISOString().split("T")[0];
      await pool.request()
        .input("HIS_Historial", sql.VarChar(20), `HST${Date.now()}`)
        .input("CUB_Cuentabancaria", sql.VarChar(20), CUB_Cuentabancaria)
        .input("HIS_Fecha", sql.Date, fechaHoy)
        .input("HIS_Saldo", sql.Decimal(18, 2), valorEnGTQ)
        .query("INSERT INTO GCB_HISTORIAL_SALDOS (HIS_Historial, CUB_Cuentabancaria, HIS_Fecha, HIS_Saldo) VALUES (@HIS_Historial, @CUB_Cuentabancaria, @HIS_Fecha, @HIS_Saldo)");
    }

    // Enviar una respuesta con el movimiento creado
    res.status(201).json({ MOV_movimiento, message: "Movimiento creado exitosamente." });
  } catch (err) {
    console.error("Error al crear movimiento:", err);
    res.status(500).send("Error al crear movimiento.");
  }
};

// Actualizar movimiento
export const updateMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { MOV_Referencia, US_usuario, MON_Moneda, TM_Tipomovimiento, CUB_Cuentabancaria, MOV_Descripcion, MOV_Fecha_Documento, MOV_Monto } = req.body;

    if (!US_usuario || !MON_Moneda || !TM_Tipomovimiento || !CUB_Cuentabancaria) {
      return res.status(400).send("Faltan datos requeridos.");
    }

    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("movimiento", sql.VarChar(50), id)
      .input("referencia", sql.VarChar(50), MOV_Referencia)
      .input("usuario", sql.Char(10), US_usuario)
      .input("moneda", sql.Char(10), MON_Moneda)
      .input("tipoMovimiento", sql.Char(10), TM_Tipomovimiento)
      .input("cuentaBancaria", sql.Char(10), CUB_Cuentabancaria)
      .input("descripcion", sql.VarChar(255), MOV_Descripcion)
      .input("fechaDocumento", sql.DateTime, MOV_Fecha_Documento)
      .input("monto", sql.Decimal(18, 2), MOV_Monto)
      .query(`
        UPDATE GCB_MOVIMIENTO
        SET MOV_Referencia = @referencia,
            US_usuario = @usuario,
            MON_Moneda = @moneda,
            TM_Tipomovimiento = @tipoMovimiento,
            CUB_Cuentabancaria = @cuentaBancaria,
            MOV_Descripcion = @descripcion,
            MOV_Fecha_Documento = @fechaDocumento,
            MOV_Monto = @monto
        WHERE MOV_movimiento = @movimiento
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
      .input("movimiento", sql.VarChar(50), id) // MOV_movimiento como llave primaria
      .query("DELETE FROM GCB_MOVIMIENTO WHERE MOV_movimiento = @movimiento");

    res.send("Movimiento eliminado.");
  } catch (err) {
    console.error("Error al eliminar movimiento:", err);
    res.status(500).send("Error al eliminar movimiento.");
  }
};

// Cambiar estado de un movimiento usando el catálogo real de estados
export const updateMovimientoEstado = async (req, res) => {
  const { id } = req.params;
  const { nuevoEstado } = req.body;

  try {
    const pool = await sql.connect(sqlConfig);

    // Obtener el estado anterior y el monto del movimiento
    const movResult = await pool.request()
      .input("movimiento", sql.VarChar(50), id)
      .query("SELECT MOV_Monto_GTQ, MOV_Estado, CUB_Cuentabancaria FROM GCB_MOVIMIENTO WHERE MOV_movimiento = @movimiento");
    if (!movResult.recordset.length) return res.status(404).send("Movimiento no encontrado");
    const { MOV_Monto_GTQ, MOV_Estado, CUB_Cuentabancaria } = movResult.recordset[0];

    // Obtener descripciones de estado anterior y nuevo
    const estadosRes = await pool.request().query("SELECT EST_Estado, EST_Descripcion FROM GCB_ESTADO");
    const estados = estadosRes.recordset;
    const descAnterior = estados.find(e => e.EST_Estado === MOV_Estado)?.EST_Descripcion || "";
    const descNuevo = estados.find(e => e.EST_Estado === nuevoEstado)?.EST_Descripcion || "";

    // Actualiza solo el campo MOV_Estado
    await pool.request()
      .input("estado", sql.VarChar(10), nuevoEstado)
      .input("movimiento", sql.VarChar(50), id)
      .query("UPDATE GCB_MOVIMIENTO SET MOV_Estado = @estado WHERE MOV_movimiento = @movimiento");

    // Lógica de saldo: solo afecta si cambia a/de Conciliado
    let saldoDelta = 0;
    if (!esConciliado(descAnterior) && esConciliado(descNuevo)) {
      saldoDelta = MOV_Monto_GTQ;
    } else if (esConciliado(descAnterior) && !esConciliado(descNuevo)) {
      saldoDelta = -MOV_Monto_GTQ;
    }
    if (saldoDelta !== 0) {
      // Actualizar saldo de la cuenta bancaria
      await pool.request()
        .input("CUB_Cuentabancaria", sql.VarChar(50), CUB_Cuentabancaria)
        .input("delta", sql.Decimal(18, 2), saldoDelta)
        .query(`UPDATE GCB_CUENTA_BANCARIA SET CUB_saldo = CUB_saldo + @delta WHERE CUB_Cuentabancaria = @CUB_Cuentabancaria`);
      // Registrar en historial de saldos
      const fechaHoy = new Date().toISOString().split("T")[0];
      await pool.request()
        .input("HIS_Historial", sql.VarChar(20), `HST${Date.now()}`)
        .input("CUB_Cuentabancaria", sql.VarChar(20), CUB_Cuentabancaria)
        .input("HIS_Fecha", sql.Date, fechaHoy)
        .input("HIS_Saldo", sql.Decimal(18, 2), saldoDelta)
        .query("INSERT INTO GCB_HISTORIAL_SALDOS (HIS_Historial, CUB_Cuentabancaria, HIS_Fecha, HIS_Saldo) VALUES (@HIS_Historial, @CUB_Cuentabancaria, @HIS_Fecha, @HIS_Saldo)");
    }

    res.send("Estado actualizado correctamente.");
  } catch (err) {
    console.error("Error al actualizar el estado:", err);
    res.status(500).send("Error al actualizar el estado.");
  }
};
