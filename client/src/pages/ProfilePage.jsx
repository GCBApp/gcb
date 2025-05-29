import React, { useEffect, useState } from "react";

function Profile() {
  const [empleado, setEmpleado] = useState(null);

  useEffect(() => {
    // Obtener el empleado autenticado desde localStorage
    const empleadoData = localStorage.getItem("empleado") || localStorage.getItem("user");
    if (empleadoData) {
      setEmpleado(JSON.parse(empleadoData));
    }
  }, []);

  if (!empleado) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2>Perfil</h2>
          <p>No hay información de empleado disponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <img
            src="/src/assets/profile-default.png"
            alt="Avatar"
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              objectFit: "cover",
              marginRight: 24,
              border: "3px solid #415A77",
              background: "#E0E1DD"
            }}
          />
          <div>
            <h2 style={{ margin: 0 }}>{empleado.EMP_Nombre} {empleado.EMP_Apellido}</h2>
            <p style={{ color: "#415A77", margin: 0, fontWeight: 500 }}>
              {empleado.TU_tipousuario}
            </p>
            <p style={{ color: "#778DA9", margin: 0 }}>{empleado.EMP_Usuario}</p>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Correo:</strong>
          <div style={infoBoxStyle}>{empleado.EMP_Correo}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Teléfono:</strong>
          <div style={infoBoxStyle}>{empleado.EMP_Telefono}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Dirección:</strong>
          <div style={infoBoxStyle}>{empleado.EMP_Direccion}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>ID Empleado:</strong>
          <div style={infoBoxStyle}>{empleado.EMP_Empleado}</div>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0D1B2A 0%, #415A77 100%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "40px 0"
};

const cardStyle = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
  padding: "40px 32px",
  minWidth: 350,
  maxWidth: 400,
  width: "100%",
  textAlign: "left"
};

const infoBoxStyle = {
  background: "#E0E1DD",
  borderRadius: "6px",
  padding: "8px 12px",
  marginTop: "4px",
  fontSize: "16px"
};

export default Profile;
