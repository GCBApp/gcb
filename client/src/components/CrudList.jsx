import { useState } from "react";
import TipoUsuario from "../cruds/TipoUsuario/TipoUsuario";
import Moneda from "../cruds/Moneda/Moneda";
import Usuario from "../cruds/Usuario/Usuario";
import Bancos from "../cruds/Bancos/Bancos";
import CuentaBancaria from "../cruds/CuentasBancarias/CuentaBancaria";
import TipoMovimiento from "../cruds/TipoMovimiento/TipoMovimiento";
import Movimiento from "../cruds/Movimiento/Movimiento";
import Compensacion from "../cruds/Compensacion/Compensacion"; 
import Estado from "../cruds/Estado/Estado"; 

// Agregar la importación

function TableList() {
  const [selectedTable, setSelectedTable] = useState(null);

  const tables = [
    { name: "Tipo Usuario", component: <TipoUsuario /> },
    { name: "Moneda", component: <Moneda /> },
    { name: "Usuario", component: <Usuario /> },
    { name: "Bancos", component: <Bancos /> },
    { name: "Cuentas Bancarias", component: <CuentaBancaria /> },
    { name: "Tipos de Movimiento", component: <TipoMovimiento /> },
    { name: "Movimientos", component: <Movimiento /> }, // Agregar a la lista
    { name: "Compensaciones", component: <Compensacion /> },
    { name: "Estado", component: <Estado /> }, // Agregar a la lista
  ];

  return (
    <div>
      <h1>Mantenimiento</h1>
      {selectedTable ? (
        <div>
          {selectedTable.component}
          <button onClick={() => setSelectedTable(null)} style={{ marginTop: "20px" }}>
            Volver
          </button>
        </div>
      ) : (
        <div>
          {tables.map((table) => (
            <div key={table.name} style={{ marginBottom: "15px" }}>
              <button
                onClick={() => setSelectedTable(table)}
                style={{
                  borderRadius: "8px",
                  border: "1px solid transparent",
                  padding: "0.6em 1.2em",
                  fontSize: "1em",
                  fontWeight: "500",
                  fontFamily: "inherit",
                  backgroundColor: "#1a1a1a",
                  color: "#fff",
                  cursor: "pointer",
                  transition: "border-color 0.25s",
                }}
              >
                {table.name}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TableList;
