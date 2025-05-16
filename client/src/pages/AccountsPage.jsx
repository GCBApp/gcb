import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const AccountsPage = () => {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Obtener el usuario desde localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.TU_descripcion === "Administrador"; // Verificar si el usuario es Administrador

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
    if (isNaN(value)) return "GTQ 0.00"; // Manejar valores no numéricos
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
    }).format(value);
  };

  const handleAddAccount = () => {
    navigate("/AddAcount"); // Redirigir a la página para agregar una nueva cuenta
  };

  return (
    <section className="accounts-page" style={pageStyle}>
      <div className="content-container" style={containerStyle}>
        <h1 style={{ color: "#E0E1DD" }}>Cuentas bancarias</h1>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        {isAdmin && (
          <div
          onClick={handleAddAccount}
          style={{... addAccountButtonStyle, marginTop: "32px", marginBottom: "32px"}}
          className="add-account-button"
        >
          <span style={plusSymbolStyle}>+</span>
        </div>
        )}
        {loading ? (
          <p>Cargando cuentas...</p>
        ) : (
          <div className="accounts-grid" style={gridStyle}>
            {cuentas.map((cuenta) => (
  <Card
    key={cuenta.CUB_Cuentabancaria}
    style={{ width: "100%", padding: 0, overflow: "hidden", backgroundColor: "#E0E1DD" }}
    className="account-card"
  >
    
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      width: "100%",
      padding: "16px 16px 0 16px"
    }}>
      {/* Logo banco */}
      <div style={{ width: "120px", height: "60px", display: "flex", alignItems: "flex-start" }}>
        <img
          src={`/bancos/${cuenta.Banco_Nombre.toLowerCase().replace(/\s/g, "")}.png`}
          alt={cuenta.Banco_Nombre}
          style={{ maxHeight: "50px", maxWidth: "100%", objectFit: "contain" }}
          onError={e => { e.target.onerror = null; e.target.src = "/bancos/default.png"; }}
        />
      </div>
      {/* Saldo */}
      <div style={{ textAlign: "right", flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "flex-start" }}>
        <p style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: (cuenta.CUB_saldo || 0) >= 0 ? "green" : "red",
          margin: 0
        }}>
          <strong>Saldo:</strong> {formatCurrency(cuenta.CUB_saldo || 0)}
        </p>
      </div>
    </div>
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      padding: "0 16px 16px 16px"
    }}>
      {/* Columna izquierda */}
      <div style={{ textAlign: "left" }}>
        <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>
          {cuenta.CUB_Nombre}
        </p>
        <p style={{ fontSize: "20px", margin: 0 }}>{cuenta.Banco_Nombre}</p>
        <p style={{ fontSize: "20px", margin: 0 }}>Número: {cuenta.CUB_Número}</p>
        <p style={{ fontSize: "15px", margin: 0 }}>{cuenta.Banco_Pais}</p>
        
      </div>
      {/* Columna derecha */}
      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: "25px", margin: 0 }}><strong>Tipo:</strong> {cuenta.CUB_Tipo}</p>
      </div>
    </div>
  </Card>
))}
          </div>
        )}
        {/* Botón para agregar una nueva cuenta (solo visible para Administradores) */}
        
      </div>
    </section>
  );
};

const pageStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  minHeight: "100vh",
  backgroundColor: "#0D1B2A",
  backgroundImage: `linear-gradient(rgba(13,27,42,0.85), rgba(13,27,42,0.85)), url('https://png.pngtree.com/thumb_back/fh260/background/20220616/pngtree-calculator-and-charts-bank-account-savings-perks-photo-image_31662364.jpg')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

const containerStyle = {
  width: "100%",
  maxWidth: "1200px",
  textAlign: "center",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr", // Solo una columna
  gap: "20px",
  alignItems: "start",
};

const addAccountButtonStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#778DA9", // Cambiado de gris a #778DA9
  color: "#000",
  borderRadius: "8px",
  height: "100%", // Igualar la altura de los cuadros de las cuentas
  cursor: "pointer",
  fontSize: "24px",
  fontWeight: "bold",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  transition: "background-color 0.3s",
};

const plusSymbolStyle = {
  fontSize: "48px", // Tamaño del símbolo "+"
  lineHeight: "1",
};

export default AccountsPage;
