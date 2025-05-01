import React from "react";
import { useLocation } from "react-router-dom";

function UserInfo() {
  const location = useLocation();
  const user = location.state?.user || JSON.parse(localStorage.getItem("user")); // Recupera el usuario de location.state o localStorage

  if (!user) {
    return <div>No se encontró información del usuario.</div>;
  }

  return (
    <div>
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        backgroundColor: "white",
        padding: "30px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
        maxWidth: "300px",
        color: "black",
      }}
    >
      <p style={{ position: "absolute", top: "2px", left: "30px", fontWeight: "bold", fontSize: "20px" }}>
        <strong>Nombre:</strong> {user.US_nombre}
      </p>
      <p style={{ fontWeight: "bold", fontSize: "15px" }}>  <strong>Correo:</strong> {user.US_correo}
      </p>
      <p style={{ fontWeight: "bold", fontSize: "15px" }}>
        <strong>Tipo de Usuario:</strong> {user.TU_descripcion}
      </p>
      </div>
      <div
        style={{
          position: "absolute",
          top: "60%", // Centra verticalmente
          left: "50%", // Centra horizontalmente
          transform: "translate(-50%, -50%)",
        }}
      >
      </div>
    </div>
  );
}

export default UserInfo;