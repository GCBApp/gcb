import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const intervalRef = useRef(null); // Referencia para almacenar el ID del intervalo

  // Array de imágenes con textos descriptivos
  const images = [
    {
      src: "/src/assets/team-discussion.jpg",
      text: "Analiza y gestiona tus finanzas bancarias con facilidad.",
    },
    {
      src: "/src/assets/finance-review.jpg",
      text: "Obtén reportes detallados de tus movimientos financieros.",
    },
    {
      src: "/src/assets/building.jpg",
      text: "Confianza y seguridad en la gestión de tus cuentas bancarias.",
    }
  ];

  // Función para iniciar/reiniciar el temporizador de cambio de imagen
  const startSlideshow = () => {
    // Limpiar el intervalo existente si hay uno
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Crear nuevo intervalo
    intervalRef.current = setInterval(() => {
      // Iniciar desvanecimiento
      setFadeIn(false);
      
      // Cambiar imagen después del desvanecimiento
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        setFadeIn(true);
      }, 500);
    }, 5000); // Cambiado a 5 segundos (5000ms)
  };

  // Iniciar el slideshow al montar el componente
  useEffect(() => {
    startSlideshow();
    
    // Limpiar el intervalo al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images.length]);

  // Función para cambiar manualmente a la siguiente imagen
  const handleNextImage = () => {
    // Iniciar desvanecimiento
    setFadeIn(false);
    
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      setFadeIn(true);
      
      // Reiniciar el temporizador después de cambiar la imagen manualmente
      startSlideshow();
    }, 500);
  };

  // Manejo del login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      // Cambia la ruta a /api/empleado/login
      const response = await fetch(`${API_URL}/api/empleado/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: username, contrasena: password }),
      });
      const data = await response.json();
      if (data.success) {
        setErrorMessage("");
        setIsAuthenticated(true);
        localStorage.setItem("empleado", JSON.stringify(data.empleado));
        navigate("/HomePage", { state: { user: data.empleado } });
      } else {
        setErrorMessage("Usuario o contraseña incorrectos.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setErrorMessage("Ocurrió un error al intentar iniciar sesión.");
    }
    setLoading(false);
  };

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
          <div style={imageContainerStyle}>
            <img 
              src={images[currentImageIndex].src} 
              alt="Financial Services" 
              style={{
                ...imageStyle,
                opacity: fadeIn ? 1 : 0
              }} 
            />
            <p style={imageTextStyle}>
              {images[currentImageIndex].text}
            </p>
            
            {/* Botón de flecha redondeada */}
            <button 
              onClick={handleNextImage} 
              style={arrowButtonStyle}
            >
              <span style={arrowSymbolStyle}>→</span>
            </button>
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
            
            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "Cargando..." : "Iniciar sesion"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Estilos
const containerStyle = {
  display: "flex",
  height: "100vh",
  width: "100vw",
  fontFamily: "'Open Sans', sans-serif",
};

const leftPanelStyle = {
  flex: 1,
  backgroundColor: "#E0E1DD",
  display: "flex",
  flexDirection: "column",
  padding: "20px",
  position: "relative",
};

const logoContainerStyle = {
  position: "absolute",
  top: "20px",
  left: "20px",
  zIndex: "100",
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
};

const imageContainerStyle = {
  position: "relative",
  width: "100%",
  maxWidth: "600px", // 40% más grande
  textAlign: "center",
};

const imageStyle = {
  width: "100%",
  height: "auto",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  transition: "opacity 0.5s ease-in-out", // Transición suave
};

const imageTextStyle = {
  marginTop: "15px",
  fontSize: "16px",
  color: "#415A77",
  fontWeight: "500",
  lineHeight: "1.5",
};

// Estilo del botón de flecha redondeada
const arrowButtonStyle = {
  position: "absolute",
  right: "15px",
  top: "50%",
  transform: "translateY(-50%)",
  width: "50px",
  height: "50px",
  borderRadius: "50%", // Forma circular
  backgroundColor: "#1565C0",
  color: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  border: "none",
  boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
  cursor: "pointer",
  transition: "background-color 0.3s, transform 0.2s",
  zIndex: 10,
};

const arrowSymbolStyle = {
  fontSize: "24px",
  fontWeight: "bold",
};

const rightPanelStyle = {
  flex: 1,
  backgroundColor: "#0D1B2A",
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
  backgroundColor: "#E0E1DD",
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