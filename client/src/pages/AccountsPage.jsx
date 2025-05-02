import React, { useState, useEffect } from "react";

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
    <section className="accounts-page">
      <div className="content-container">
        <h1>Cuentas</h1>
        <p>Gestiona tus cuentas aquí.</p>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        {loading ? (
          <p>Cargando cuentas...</p>
        ) : (
          <div className="accounts-grid" style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
            {cuentas.map((cuenta) => (
              <div
                key={cuenta.CUB_Cuentabancaria}
                className="account-card"
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "20px",
                  width: "250px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h3>{cuenta.CUB_Nombre}</h3>
                <p><strong>Número:</strong> {cuenta.CUB_Número}</p>
                <p><strong>Tipo:</strong> {cuenta.CUB_Tipo}</p>
                <p><strong>Banco:</strong> {cuenta.Banco_Nombre}</p>
                <p><strong>País:</strong> {cuenta.Banco_Pais}</p>
                <p><strong>Saldo (GTQ):</strong> {formatCurrency(cuenta.CUB_saldo)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AccountsPage;
