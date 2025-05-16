import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// El Navbar ya no será necesario en este diseño
// import Navbar from "../components/Navbar";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  // Mantener la misma funcionalidad de login
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/usuario`);
      const users = await response.json();

      const user = users.find(
        (u) =>
          (u.US_nombre === username || u.US_correo === username) &&
          u.US_contraseña === password
      );

      if (user) {
        setErrorMessage("");
        setIsAuthenticated(true);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/HomePage", { state: { user } });
      } else {
        setErrorMessage("Usuario o contraseña incorrectos.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setErrorMessage("Ocurrió un error al intentar iniciar sesión.");
    }
  };

  // Cargar la fuente Open Sans
  useEffect(() => {
    const linkElement = document.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = "https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(linkElement);

    return () => {
      if (document.head.contains(linkElement)) {
        document.head.removeChild(linkElement);
      }
    };
  }, []);

  return (
    <div style={containerStyle}>
      {/* Panel izquierdo */}
      <div style={leftPanelStyle}>
        <div style={logoContainerStyle}>
          <img 
            src="/src/assets/logo1.2.png" 
            alt="GCB Logo" 
            style={logoStyle} 
          />
        </div>
        
        <div style={leftContentStyle}>
          <img 
            src="/src/assets/team-discussion.jpg" 
            alt="Financial Analysis" 
            style={imageStyle} 
          />
          
          <div style={textContainerStyle}>
            <p style={descriptionStyle}>
              GCB te ayuda a gestionar y analizar tus finanzas bancarias fácilmente.
            </p>
          </div>
        </div>
      </div>
      
      {/* Panel derecho */}
      <div style={rightPanelStyle}>
        <div style={rightContentStyle}>
          <h1 style={titleStyle}>Sistema de Gestión Cuentas Bancarias</h1>
          
          <form onSubmit={handleLogin} style={formStyle}>
            <div style={inputContainerStyle}>
              <label style={labelStyle}>Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresar usuario"
                required
                style={inputStyle}
              />
            </div>
            
            <div style={inputContainerStyle}>
              <label style={labelStyle}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresar su contraseña"
                required
                style={inputStyle}
              />
            </div>
            
            {errorMessage && (
              <div style={errorStyle}>
                {errorMessage}
              </div>
            )}
            
            <button type="submit" style={buttonStyle}>
              Iniciar sesion
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Estilos basados en el diseño de Figma
const containerStyle = {
  display: "flex",
  height: "100vh",
  width: "100vw",
  fontFamily: "'Open Sans', sans-serif",
};

const leftPanelStyle = {
  flex: 1,
  backgroundColor: "#E0E1DD", // Cambiado de #ffffff a #E0E1DD
  display: "flex",
  flexDirection: "column",
  padding: "20px",
};

// Versión alternativa con posicionamiento absoluto para mayor énfasis
const logoContainerStyle = {
  position: "absolute",
  top: "20px",
  left: "20px",
  zIndex: "100", // Asegura que esté por encima de otros elementos
};

const logoStyle = {
  width: "60px",
  height: "60px",
};

const leftContentStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  flex: 1,
  padding: "20px",
};

const imageStyle = {
  width: "100%",
  maxWidth: "400px",
  marginBottom: "30px",
};

const textContainerStyle = {
  width: "100%",
  maxWidth: "400px",
};

const descriptionStyle = {
  fontSize: "18px",
  color: "#415A77",
  lineHeight: "1.5",
};

const rightPanelStyle = {
  flex: 1,
  backgroundColor: "#0D1B2A", // Color azul oscuro del panel derecho
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const rightContentStyle = {
  width: "80%",
  maxWidth: "400px",
};

const titleStyle = {
  color: "white",
  fontSize: "28px",
  fontWeight: "600",
  marginBottom: "30px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
};

const inputContainerStyle = {
  marginBottom: "20px",
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  color: "white",
  fontSize: "16px",
  marginBottom: "8px",
};

const inputStyle = {
  padding: "12px 15px",
  fontSize: "16px",
  borderRadius: "5px",
  border: "none",
  backgroundColor: "#E0E1DD", // Cambiado de #ffffff a #E0E1DD
};

const errorStyle = {
  backgroundColor: "rgba(211, 47, 47, 0.1)",
  color: "#d32f2f",
  padding: "12px",
  borderRadius: "5px",
  marginBottom: "20px",
  fontSize: "14px",
};

const buttonStyle = {
  backgroundColor: "#778DA9",
  color: "white",
  border: "none",
  padding: "12px",
  borderRadius: "5px",
  fontSize: "16px",
  fontWeight: "500",
  cursor: "pointer",
  marginTop: "10px",
};

export default Login;