import sql from "mssql";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } from "../../config.js";

const sqlConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  server: DB_HOST,
  options: { encrypt: true, trustServerCertificate: true },
};

export const getAllPeriodos = async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM GCB_PERIODO");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send("Error al obtener periodos");
  }
};

export const createPeriodo = async (req, res) => {
  try {
    const { PER_Periodo, PER_Fecha_inicio, PER_Fecha_final, PER_Estado } = req.body;
    if (!PER_Periodo) return res.status(400).send("Faltan datos requeridos");
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("PER_Periodo", sql.VarChar(10), PER_Periodo)
      .input("PER_Fecha_inicio", sql.Date, PER_Fecha_inicio)
      .input("PER_Fecha_final", sql.Date, PER_Fecha_final)
      .input("PER_Estado", sql.VarChar(20), PER_Estado)
      .query("INSERT INTO GCB_PERIODO (PER_Periodo, PER_Fecha_inicio, PER_Fecha_final, PER_Estado) VALUES (@PER_Periodo, @PER_Fecha_inicio, @PER_Fecha_final, @PER_Estado)");
    res.status(201).send("Periodo creado");
  } catch (err) {
    res.status(500).send("Error al crear periodo");
  }
};

export const updatePeriodo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "undefined" || id === "") {
      console.error("updatePeriodo: id no proporcionado o vacío en req.params. Debe ser el valor de PER_Periodo, por ejemplo: 'PE202512'");
      return res.status(400).send("Falta el parámetro id (PER_Periodo) en la URL");
    }
    const { PER_Periodo, PER_Fecha_inicio, PER_Fecha_final, PER_Estado } = req.body;

    console.log("updatePeriodo llamado");
    console.log("Params id (PER_Periodo esperado):", id);
    console.log("Body:", req.body);

    const pool = await sql.connect(sqlConfig);

    // Si solo se envía PER_Estado, actualiza solo ese campo
    if (PER_Estado && !PER_Periodo && !PER_Fecha_inicio && !PER_Fecha_final) {
      console.log("Solo actualizando estado:", PER_Estado);
      const result = await pool.request()
        .input("id", sql.VarChar(20), id)
        .input("estado", sql.VarChar(20), PER_Estado)
        .query("UPDATE GCB_PERIODO SET PER_Estado = @estado WHERE PER_Periodo = @id");
      console.log("Resultado update estado:", result.rowsAffected, "para PER_Periodo:", id);
      return res.send("Estado del periodo actualizado");
    }

    // Si se envían más campos, actualiza todos los campos relevantes
    console.log("Actualizando todos los campos del periodo");
    const result = await pool.request()
      .input("id", sql.VarChar(20), id)
      .input("periodo", sql.VarChar(50), PER_Periodo)
      .input("fecha_inicio", sql.Date, PER_Fecha_inicio)
      .input("fecha_final", sql.Date, PER_Fecha_final)
      .input("estado", sql.VarChar(20), PER_Estado)
      .query(`
        UPDATE GCB_PERIODO
        SET PER_Periodo = @periodo,
            PER_Fecha_inicio = @fecha_inicio,
            PER_Fecha_final = @fecha_final,
            PER_Estado = @estado
        WHERE PER_Periodo = @id
      `);
    console.log("Resultado update completo:", result.rowsAffected);
    res.send("Periodo actualizado");
  } catch (err) {
    console.error("Error al actualizar periodo:", err);
    res.status(500).send("Error al actualizar periodo");
  }
};

export const deletePeriodo = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(sqlConfig);
    await pool.request()
      .input("id", sql.VarChar(20), id)
      .query("DELETE FROM GCB_PERIODO WHERE PER_Periodo=@id");
    res.send("Periodo eliminado");
  } catch (err) {
    res.status(500).send("Error al eliminar periodo");
  }
};

export const cerrarPeriodoYRecalcularSaldos = async (req, res) => {
  const { id } = req.params; // id = PER_Periodo
  try {
    const pool = await sql.connect(sqlConfig);
    // 1. Marcar el periodo como cerrado
    await pool.request()
      .input("id", sql.VarChar(20), id)
      .query("UPDATE GCB_PERIODO SET PER_Estado='Cerrado' WHERE PER_Periodo=@id");

    // 2. Obtener el periodo cerrado
    const periodoRes = await pool.request()
      .input("id", sql.VarChar(20), id)
      .query("SELECT * FROM GCB_PERIODO WHERE PER_Periodo=@id");
    const periodo = periodoRes.recordset[0];
    if (!periodo) return res.status(404).send("Periodo no encontrado");

    // 3. Para cada cuenta bancaria, calcular el saldo al cierre del periodo (solo movimientos conciliados hasta la fecha de cierre)
    const cuentasRes = await pool.request().query("SELECT CUB_Cuentabancaria FROM GCB_CUENTA_BANCARIA");
    const cuentas = cuentasRes.recordset;
    for (const cuenta of cuentas) {
      // Sumar todos los movimientos conciliados hasta la fecha de cierre del periodo
      const saldoRes = await pool.request()
        .input("cuenta", sql.VarChar(20), cuenta.CUB_Cuentabancaria)
        .input("fechaCierre", sql.Date, periodo.PER_Fecha_final)
        .query(`SELECT SUM(MOV_Monto_GTQ) as saldo FROM GCB_MOVIMIENTO M
          LEFT JOIN GCB_ESTADO E ON M.MOV_Estado = E.EST_Estado
          WHERE M.CUB_Cuentabancaria = @cuenta
            AND M.MOV_Fecha_Documento <= @fechaCierre
            AND LOWER(REPLACE(REPLACE(REPLACE(E.EST_Descripcion, 'í', 'i'), 'á', 'a'), 'é', 'e')) = 'conciliado'`);
      const saldo = saldoRes.recordset[0].saldo || 0;
      // Insertar o actualizar el historial de saldos
      await pool.request()
        .input("cuenta", sql.VarChar(20), cuenta.CUB_Cuentabancaria)
        .input("fecha", sql.Date, periodo.PER_Fecha_final)
        .input("saldo", sql.Decimal(18, 2), saldo)
        .query(`IF EXISTS (SELECT 1 FROM GCB_HISTORIAL_SALDOS WHERE CUB_Cuentabancaria=@cuenta AND HIS_Fecha=@fecha)
          UPDATE GCB_HISTORIAL_SALDOS SET HIS_Saldo=@saldo WHERE CUB_Cuentabancaria=@cuenta AND HIS_Fecha=@fecha
          ELSE
          INSERT INTO GCB_HISTORIAL_SALDOS (CUB_Cuentabancaria, HIS_Fecha, HIS_Saldo) VALUES (@cuenta, @fecha, @saldo)`);
    }
    res.send("Periodo cerrado y saldos históricos recalculados");
  } catch (err) {
    res.status(500).send("Error al cerrar periodo y recalcular saldos");
  }
};
