import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menubar } from "primereact/menubar";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import logo from "../assets/logo.png"; // Asegúrate de que el logo tenga fondo transparente

const Navbar = ({ showLoginOnly = false }) => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Si no está autenticado y no es la pantalla de login, no mostrar nada
  if (!isAuthenticated && !showLoginOnly) return null;

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/");
  };

  // No mostrar ítems del menú si estamos en la pantalla de login
  const items = showLoginOnly ? [] : [
    { label: "Inicio", icon: "pi pi-home", command: () => navigate("/HomePage") },
    { label: "Cuentas", icon: "pi pi-wallet", command: () => navigate("/accounts") },
    { label: "Movimientos", icon: "pi pi-exchange", command: () => navigate("/carga") },
    { label: "Perfil", icon: "pi pi-user", command: () => navigate("/profile") },
    { label: "Conciliacion", icon: "pi pi-upload", command: () => navigate("/conciliacion") },
    { label: "Compensasion", icon: "pi pi-calculator", command: () => navigate("/compensasion") },
    { label: "Cruds", icon: "pi pi-cog", command: () => navigate("/cruds") },
    { label: "Cerrar Sesión", icon: "pi pi-sign-out", command: handleLogout },
  ];

  // Logo siempre visible
  const start = <img src={logo} alt="Logo" style={{ height: "40px", backgroundColor: "transparent" }} />;
  
  // No mostrar icono de usuario en la pantalla de login
  const end = showLoginOnly ? null : <i className="pi pi-user" style={{ fontSize: "1.5rem" }}></i>;

  return (
    <header>
      <Menubar
        model={items}
        start={start}
        end={end}
        style={{
          backgroundColor: "#ffffff", // Fondo blanco siempre
          color: "#0D1B2A", // Color de texto oscuro para contraste
          borderBottom: "1px solid #eaeaea"
        }}
      />
    </header>
  );
};

export default Navbar;
