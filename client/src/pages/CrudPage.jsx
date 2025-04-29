import React, { useState } from "react";
import TipoUsuario from "../cruds/TipoUsuario/TipoUsuario";
import Moneda from "../cruds/Moneda/Moneda";
import Usuario from "../cruds/Usuario/Usuario";
import Bancos from "../cruds/Bancos/Bancos";
import CuentaBancaria from "../cruds/CuentasBancarias/CuentaBancaria";
import TipoMovimiento from "../cruds/TipoMovimiento/TipoMovimiento";
import Movimiento from "../cruds/Movimiento/Movimiento";
import Compensacion from "../cruds/Compensacion/Compensacion";
import Estado from "../cruds/Estado/Estado";

const CrudPage = () => {
  const [selectedCrud, setSelectedCrud] = useState(null);

  const cruds = [
    { name: "Tipo Usuario", component: <TipoUsuario /> },
    { name: "Moneda", component: <Moneda /> },
    { name: "Usuario", component: <Usuario /> },
    { name: "Bancos", component: <Bancos /> },
    { name: "Cuentas Bancarias", component: <CuentaBancaria /> },
    { name: "Tipos de Movimiento", component: <TipoMovimiento /> },
    { name: "Movimientos", component: <Movimiento /> },
    { name: "Compensacion", component: <Compensacion /> },
    { name: "Estado", component: <Estado /> },
  ];

  return (
    <section className="crud-page">
      <div className="content-container">
        <h1>Cruds</h1>
        {selectedCrud ? (
          <div className="crud-detail">
            {selectedCrud.component}
            <button onClick={() => setSelectedCrud(null)} style={{ marginTop: "20px" }}>
              Volver
            </button>
          </div>
        ) : (
          <div className="crud-list">
            {cruds.map((crud) => (
              <div key={crud.name} style={{ marginBottom: "15px" }}>
                <button
                  onClick={() => setSelectedCrud(crud)}
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
                  {crud.name}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CrudPage;
