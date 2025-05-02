import sql from "mssql";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } from "../../config.js";
import { updateExchangeRates } from "../../index.js"; // Importar la función de tipo_cambio.js

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

// Listar movimientos
export const getAllMovimientos = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query(`
      SELECT DISTINCT -- Asegurarse de que no haya duplicados
          M.MOV_Movimiento,
          M.MOV_id,
          U.US_nombre AS NombreUsuario,
          MO.MON_nombre AS Moneda,
          TM.TM_descripcion AS TipoMovimiento,
          CB.CUB_Nombre AS CuentaBancaria,
          M.MOV_Descripcion,
          M.MOV_Fecha_Mov,
          M.MOV_Fecha_Registro,
          M.MOV_Valor,
          M.MOV_Tipo_Cambio,
          M.MOV_Valor_GTQ
      FROM 
          GCB_MOVIMIENTO M
      JOIN 
          GCB_USUARIOS U ON M.US_Usuario = U.US_Usuario
      JOIN 
          GCB_MONEDA MO ON M.MON_Moneda = MO.MON_moneda
      JOIN 
          GCB_TIPO_MOVIMIENTO TM ON M.TM_Tipomovimiento = TM.TM_Tipomovimiento
      JOIN 
          GCB_CUENTA_BANCARIA CB ON M.CUB_Cuentabancaria = CB.CUB_Cuentabancaria
      ORDER BY 
          M.MOV_Movimiento ASC
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
    const { MOV_Movimiento, MOV_id, US_Usuario, MON_Moneda, TM_Tipomovimiento, CUB_Cuentabancaria, MOV_Descripcion, MOV_Fecha_Mov, MOV_Valor } = req.body;

    if (!MOV_Movimiento || !US_Usuario || !MON_Moneda || !TM_Tipomovimiento || !CUB_Cuentabancaria) {
      return res.status(400).send("Faltan datos requeridos.");
    }

    const pool = await sql.connect(sqlConfig);

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
      const valorEnGTQ = MOV_Valor * tipoCambioCompra;

      // Calcular la fecha de registro como la fecha actual menos un día y establecer la hora en 00:00:00
      const fechaRegistro = new Date();
      fechaRegistro.setDate(fechaRegistro.getDate() - 1);
      fechaRegistro.setUTCHours(0, 0, 0, 0); // Establecer la hora en 00:00:00 UTC

      // Insertar el movimiento con tipo de cambio 1
      await pool.request()
        .input("movimiento", sql.VarChar(50), MOV_Movimiento)
        .input("id", sql.VarChar(50), MOV_id)
        .input("usuario", sql.Char(10), US_Usuario)
        .input("moneda", sql.Char(10), MON_Moneda)
        .input("tipoMovimiento", sql.Char(10), TM_Tipomovimiento)
        .input("cuentaBancaria", sql.Char(10), CUB_Cuentabancaria)
        .input("descripcion", sql.VarChar(255), MOV_Descripcion)
        .input("fechaMov", sql.DateTime, MOV_Fecha_Mov)
        .input("fechaRegistro", sql.DateTime, fechaRegistro) // Fecha de registro ajustada
        .input("valor", sql.Decimal(18, 2), MOV_Valor) // Valor original
        .input("tipoCambioCompra", sql.Decimal(18, 5), tipoCambioCompra) // Tipo de cambio utilizado
        .input("valorGTQ", sql.Decimal(18, 2), valorEnGTQ) // Valor convertido a GTQ
        .query(`
          INSERT INTO GCB_MOVIMIENTO (MOV_Movimiento, MOV_id, US_Usuario, MON_Moneda, TM_Tipomovimiento, CUB_Cuentabancaria, MOV_Descripcion, MOV_Fecha_Mov, MOV_Fecha_Registro, MOV_Valor, MOV_Tipo_Cambio, MOV_Valor_GTQ)
          VALUES (@movimiento, @id, @usuario, @moneda, @tipoMovimiento, @cuentaBancaria, @descripcion, @fechaMov, @fechaRegistro, @valor, @tipoCambioCompra, @valorGTQ)
        `);

      res.status(201).send("Movimiento creado.");
      return;
    }

    // Buscar tipo de cambio en el historial
    const fechaMovimiento = MOV_Fecha_Mov.split("T")[0]; // Usar la fecha proporcionada en el JSON

    // Verificar si existe un registro para la combinación de moneda y fecha
    let registroExistente = await pool
      .request()
      .input("moneda", sql.Char(10), MON_Moneda)
      .input("fecha", sql.Date, fechaMovimiento)
      .query(
        "SELECT COUNT(*) AS count FROM GCB_MONEDA WHERE MON_moneda = @moneda AND MON_Fecha_Mov = @fecha"
      );

    if (registroExistente.recordset[0].count === 0) {
      console.log(`No existe un registro para la moneda ${MON_Moneda} en la fecha ${fechaMovimiento}. Creando registro inicial...`);

      // Obtener el ID Banguat y el nombre de la moneda
      const monedaInfo = await pool
        .request()
        .input("moneda", sql.Char(10), MON_Moneda)
        .query("SELECT MON_id_Banguat, MON_nombre FROM GCB_MONEDA WHERE MON_moneda = @moneda");

      const idBanguatValue = monedaInfo.recordset[0]?.MON_id_Banguat || 0; // Asignar 0 si no se encuentra
      const nombreMoneda = monedaInfo.recordset[0]?.MON_nombre || "Moneda Desconocida"; // Asignar nombre temporal si no se encuentra

      // Crear un registro inicial para la moneda con la fecha proporcionada
      await pool
        .request()
        .input("moneda", sql.Char(10), MON_Moneda)
        .input("fecha", sql.Date, fechaMovimiento)
        .input("nombre", sql.VarChar(50), nombreMoneda) // Usar el nombre recuperado
        .input("compra", sql.Decimal(18, 5), 0) // Valores temporales
        .input("venta", sql.Decimal(18, 5), 0)
        .input("idBanguat", sql.Int, idBanguatValue) // Usar el ID Banguat recuperado
        .query(
          "INSERT INTO GCB_MONEDA (MON_moneda, MON_Fecha_Mov, MON_nombre, MON_Tipo_Compra, MON_Tipo_Venta, MON_id_Banguat) VALUES (@moneda, @fecha, @nombre, @compra, @venta, @idBanguat)"
        );

      console.log(`Registro inicial creado para la moneda ${MON_Moneda} con la fecha ${fechaMovimiento}.`);

      // Ejecutar tipo_cambio.js para actualizar el tipo de cambio
      console.log("Ejecutando tipo_cambio.js para actualizar el tipo de cambio...");
      await updateExchangeRates();
      console.log("Actualización de tipos de cambio completada.");
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
    const valorEnGTQ = MOV_Valor * tipoCambioCompra;

    // Calcular la fecha de registro como la fecha actual menos un día y establecer la hora en 00:00:00
    const fechaRegistro = new Date();
    fechaRegistro.setDate(fechaRegistro.getDate() - 1);
    fechaRegistro.setUTCHours(0, 0, 0, 0); // Establecer la hora en 00:00:00 UTC

    // Insertar el movimiento con los valores calculados
    await pool.request()
      .input("movimiento", sql.VarChar(50), MOV_Movimiento)
      .input("id", sql.VarChar(50), MOV_id)
      .input("usuario", sql.Char(10), US_Usuario)
      .input("moneda", sql.Char(10), MON_Moneda)
      .input("tipoMovimiento", sql.Char(10), TM_Tipomovimiento)
      .input("cuentaBancaria", sql.Char(10), CUB_Cuentabancaria)
      .input("descripcion", sql.VarChar(255), MOV_Descripcion)
      .input("fechaMov", sql.DateTime, MOV_Fecha_Mov)
      .input("fechaRegistro", sql.DateTime, fechaRegistro) // Usar la variable fechaRegistro ajustada
      .input("valor", sql.Decimal(18, 2), MOV_Valor) // Valor original
      .input("tipoCambioCompra", sql.Decimal(18, 5), tipoCambioCompra) // Tipo de cambio utilizado
      .input("valorGTQ", sql.Decimal(18, 2), valorEnGTQ) // Valor convertido a GTQ
      .query(`
        INSERT INTO GCB_MOVIMIENTO (MOV_Movimiento, MOV_id, US_Usuario, MON_Moneda, TM_Tipomovimiento, CUB_Cuentabancaria, MOV_Descripcion, MOV_Fecha_Mov, MOV_Fecha_Registro, MOV_Valor, MOV_Tipo_Cambio, MOV_Valor_GTQ)
        VALUES (@movimiento, @id, @usuario, @moneda, @tipoMovimiento, @cuentaBancaria, @descripcion, @fechaMov, @fechaRegistro, @valor, @tipoCambioCompra, @valorGTQ)
      `);

    // Actualizar el saldo de la cuenta bancaria
    await pool.request()
      .input("CUB_Cuentabancaria", sql.VarChar(50), CUB_Cuentabancaria)
      .input("MOV_Valor", sql.Decimal(18, 2), valorEnGTQ)
      .query(`
        UPDATE GCB_CUENTA_BANCARIA
        SET CUB_saldo = CUB_saldo + @MOV_Valor
        WHERE CUB_Cuentabancaria = @CUB_Cuentabancaria
      `);

    res.status(201).send("Movimiento creado.");
  } catch (err) {
    console.error("Error al crear movimiento:", err);
    res.status(500).send("Error al crear movimiento.");
  }
};

// Actualizar movimiento
export const updateMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { MOV_id, US_Usuario, MON_Moneda, TM_Tipomovimiento, CUB_Cuentabancaria, MOV_Descripcion, MOV_Fecha_Mov, MOV_Valor } = req.body;

    if (!US_Usuario || !MON_Moneda || !TM_Tipomovimiento || !CUB_Cuentabancaria) {
      return res.status(400).send("Faltan datos requeridos.");
    }

    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("movimiento", sql.VarChar(50), id) // MOV_Movimiento como llave primaria
      .input("id", sql.VarChar(50), MOV_id)
      .input("usuario", sql.Char(10), US_Usuario)
      .input("moneda", sql.Char(10), MON_Moneda)
      .input("tipoMovimiento", sql.Char(10), TM_Tipomovimiento)
      .input("cuentaBancaria", sql.Char(10), CUB_Cuentabancaria)
      .input("descripcion", sql.VarChar(255), MOV_Descripcion)
      .input("fechaMov", sql.DateTime, MOV_Fecha_Mov)
      .input("valor", sql.Decimal(18, 2), MOV_Valor)
      .query(`
        UPDATE GCB_MOVIMIENTO
        SET MOV_id = @id, 
            US_Usuario = @usuario, 
            MON_Moneda = @moneda, 
            TM_Tipomovimiento = @tipoMovimiento, 
            CUB_Cuentabancaria = @cuentaBancaria, 
            MOV_Descripcion = @descripcion, 
            MOV_Fecha_Mov = @fechaMov, 
            MOV_Valor = @valor
        WHERE MOV_Movimiento = @movimiento
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
      .input("movimiento", sql.VarChar(50), id) // MOV_Movimiento como llave primaria
      .query("DELETE FROM GCB_MOVIMIENTO WHERE MOV_Movimiento = @movimiento");

    res.send("Movimiento eliminado.");
  } catch (err) {
    console.error("Error al eliminar movimiento:", err);
    res.status(500).send("Error al eliminar movimiento.");
  }
};