import { useState } from "react";
import TipoUsuario from "../cruds/TipoUsuario/TipoUsuario";
import Moneda from "../cruds/Moneda/Moneda";
import Usuario from "../cruds/Usuario/Usuario"; // Importar Usuario

function TableList() {
  const [selectedTable, setSelectedTable] = useState(null);

  const tables = [
    { name: "Tipo Usuario", component: <TipoUsuario /> },
    { name: "Moneda", component: <Moneda /> },
    { name: "Usuario", component: <Usuario /> }, // Agregar Usuario
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
