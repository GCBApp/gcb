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
        setIsAuthenticated(true); // Cambiado de True a true
        alert(`Bienvenido ${user.TU_descripcion}, ${user.US_nombre}.`);
        localStorage.setItem("user", JSON.stringify(user)); // Guarda la información del usuario en localStorage
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
    <div
      style={{
        height: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          width: "500px",
          height: "300px",
          backgroundColor: "white",
          padding: "40px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          borderRadius: "8px",
          position: "relative",
          color: "black",
        }}
      >
        <h2
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            margin: 0,
            color: "black",
          }}
        >
          Iniciar Sesión
        </h2>

        <form
          onSubmit={handleLogin}
          style={{
            position: "absolute",
            top: "80px",
            left: "0",
            right: "0",
            padding: "0 40px",
          }}
        >
          <div style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
            <label
              htmlFor="username"
              style={{
                marginRight: "10px",
                width: "100px",
                textAlign: "right",
              }}
            >
              Usuario:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                flex: 1,
                padding: "10px",
                color: "black",
                backgroundColor: "white",
                border: "2px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
            <label
              htmlFor="password"
              style={{
                marginRight: "10px",
                width: "100px",
                textAlign: "right",
              }}
            >
              Contraseña:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                flex: 1,
                padding: "10px",
                color: "black",
                backgroundColor: "white",
                border: "2px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          {errorMessage && (
            <div style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>
              <strong>{errorMessage}</strong>
            </div>
          )}

          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;