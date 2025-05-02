import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const AccountsPage = () => {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Obtener todas las cuentas desde el backend
  useEffect(() => {
    const fetchCuentas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cuentasBancarias`);
        if (!res.ok) throw new Error("Error al obtener las cuentas.");
        const data = await res.json();
        setCuentas(data);
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener las cuentas:", err);
        setErrorMessage("Error al cargar las cuentas. Por favor, intente nuevamente.");
        setLoading(false);
      }
    };

    fetchCuentas();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
    }).format(value);
  };

  return (
    <section className="accounts-page" style={pageStyle}>
      <div className="content-container" style={containerStyle}>
        <h1>Cuentas bancarias</h1>
        <p>Gestiona tus cuentas aquí.</p>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        {loading ? (
          <p>Cargando cuentas...</p>
        ) : (
          <div className="accounts-grid" style={gridStyle}>
            {cuentas.map((cuenta) => (
              <Card
                key={cuenta.CUB_Cuentabancaria}
                title={cuenta.CUB_Nombre}
                subTitle={`${cuenta.Banco_Nombre}`}
                style={{ width: "100%" }}
                className="account-card"
              >
                <p><strong>Número:</strong> {cuenta.CUB_Número}</p>
                <p><strong>Tipo:</strong> {cuenta.CUB_Tipo}</p>
                <p><strong>País:</strong> {cuenta.Banco_Pais}</p>
                <p><strong>Saldo (GTQ):</strong> {formatCurrency(cuenta.CUB_saldo)}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const pageStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
};

const containerStyle = {
  width: "100%",
  maxWidth: "1200px",
  textAlign: "center",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
  gap: "20px",
};

export default AccountsPage;
