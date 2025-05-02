import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menubar } from "primereact/menubar";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import logo from "../assets/logo.png"; // Asegúrate de que el logo tenga fondo transparente

const Navbar = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  if (isAuthenticated) return null; // No renderizar el Navbar si no está autenticado

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const items = [
    { label: "Inicio", icon: "pi pi-home", command: () => (window.location.href = "/HomePage") },
    { label: "Cuentas", icon: "pi pi-wallet", command: () => (window.location.href = "/accounts") },
    { label: "Movimientos", icon: "pi pi-exchange", command: () => (window.location.href = "/carga") },
    { label: "Perfil", icon: "pi pi-user", command: () => (window.location.href = "/profile") },
    { label: "Cruds", icon: "pi pi-cog", command: () => (window.location.href = "/cruds") },
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
