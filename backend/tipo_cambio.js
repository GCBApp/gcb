import sql from "mssql";
import soap from "soap";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_USER } from "./config.js";

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

const url = "https://www.banguat.gob.gt/variables/ws/TipoCambio.asmx?wsdl";

async function updateExchangeRates() {
  try {
    const pool = await sql.connect(sqlConfig);
    const monedas = await pool.request().query("SELECT MON_moneda, MON_id_Banguat FROM GCB_MONEDA");

    if (monedas.recordset.length === 0) {
      console.log("No hay monedas registradas en la base de datos.");
      return;
    }

    const client = await new Promise((resolve, reject) => {
      soap.createClient(url, (err, client) => {
        if (err) return reject(err);
        resolve(client);
      });
    });

    const fechaSeleccionada = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD

    const updatePromises = monedas.recordset.map(async (moneda) => {
      const { MON_moneda, MON_id_Banguat } = moneda;
      const args = {
        fechainit: fechaSeleccionada.split("-").reverse().join("/"), // Convertir a formato DD/MM/YYYY
        moneda: MON_id_Banguat,
      };

      const result = await new Promise((resolve, reject) => {
        client.TipoCambioFechaInicialMoneda(args, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      const vars = result.TipoCambioFechaInicialMonedaResult.Vars.Var;
      const tipoCambio = vars.find((item) => item.fecha === args.fechainit);

      if (tipoCambio) {
        const { compra, venta } = tipoCambio;
        await pool
          .request()
          .input("compra", sql.Decimal(18, 5), compra)
          .input("venta", sql.Decimal(18, 5), venta)
          .input("fecha", sql.Date, fechaSeleccionada)
          .input("moneda", sql.Char(10), MON_moneda)
          .query(
            "UPDATE GCB_MONEDA SET MON_Tipo_Compra = @compra, MON_Tipo_Venta = @venta, MON_Fecha_Mov = @fecha WHERE MON_moneda = @moneda"
          );
        console.log(`Tipo de cambio actualizado para ${MON_moneda}: Compra=${compra}, Venta=${venta}`);
      } else {
        console.log(`No se encontró tipo de cambio para ${MON_moneda} en la fecha ${args.fechainit}`);
      }
    });

    await Promise.all(updatePromises);
    console.log("Actualización de tipos de cambio completada.");
  } catch (err) {
    console.error("Error al actualizar tipos de cambio:", err);
  }
}

updateExchangeRates();
