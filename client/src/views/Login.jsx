import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/usuario`);
      const users = await response.json();

      const user = users.find(
        (u) => (u.US_nombre === username || u.US_correo === username) && u.US_contraseña === password
      );

      if (user) {
        setErrorMessage("");
        setIsAuthenticated(true);
        alert(`Bienvenido ${user.TU_descripcion}, ${user.US_nombre}.`);
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

  return (
    <div style={outerContainerStyle}>
      <div style={innerContainerStyle}>
        <div style={formContainerStyle}>
          <h2 style={headerStyle}>Iniciar Sesión</h2>
          <form onSubmit={handleLogin} style={formStyle}>
            <div style={inputGroupStyle}>
              <label htmlFor="username" style={labelStyle}>
                Usuario:
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label htmlFor="password" style={labelStyle}>
                Contraseña:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            {errorMessage && (
              <div style={errorStyle}>
                <strong>{errorMessage}</strong>
              </div>
            )}
            <button type="submit" style={buttonStyle}>
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const outerContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const innerContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  maxWidth: "500px",
  padding: "20px",
};

const formContainerStyle = {
  width: "100%",
  backgroundColor: "white",
  padding: "40px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  borderRadius: "8px",
  color: "black",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "20px",
  color: "black",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const labelStyle = {
  fontSize: "14px",
  color: "#555",
};

const inputStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "14px",
};

const errorStyle = {
  color: "red",
  textAlign: "center",
  marginBottom: "15px",
};

const buttonStyle = {
  padding: "10px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default Login;