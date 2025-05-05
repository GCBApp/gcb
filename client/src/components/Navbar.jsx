import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menubar } from "primereact/menubar";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import logo from "../assets/logo.png"; // Asegúrate de que el logo tenga fondo transparente

const Navbar = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null; // No renderizar el Navbar si no está autenticado

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/"); // Redirigir a la página de inicio de sesión
  };

  const items = [
    { label: "Inicio", icon: "pi pi-home", command: () => navigate("/HomePage") },
    { label: "Cuentas", icon: "pi pi-wallet", command: () => navigate("/accounts") },
    { label: "Movimientos", icon: "pi pi-exchange", command: () => navigate("/carga") },
    { label: "Perfil", icon: "pi pi-user", command: () => navigate("/profile") },
    { label: "Conciliacion", icon: "pi pi-upload", command: () => navigate("/conciliacion") },
    { label: "Compensasion", icon: "pi pi-calculator", command: () => navigate("/compensasion") },
    { label: "Cruds", icon: "pi pi-cog", command: () => navigate("/cruds") },
    { label: "Cerrar Sesión", icon: "pi pi-sign-out", command: handleLogout },
  ];

  const start = <img src={logo} alt="Logo" style={{ height: "40px", backgroundColor: "transparent" }} />;
  const end = <i className="pi pi-user" style={{ fontSize: "1.5rem" }}></i>;

  return (
    <header>
      <Menubar
        model={items}
        start={start}
        end={end}
        style={{
          backgroundColor: "#ffffff", // Fondo de la barra
          color: "#ffffff", // Color del texto
        }}
      />
    </header>
  );
};

export default Navbar;
