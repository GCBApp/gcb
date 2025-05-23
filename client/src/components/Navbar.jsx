import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menubar } from "primereact/menubar";
import { ConfirmDialog } from "primereact/confirmdialog";
import { confirmDialog } from "primereact/confirmdialog";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import logo from "../assets/logo.png";

const Navbar = ({ showLoginOnly = false }) => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Estado para mostrar el diálogo
  const [visible, setVisible] = useState(false);

  const handleLogout = () => {
    setVisible(true);
  };

  const confirmLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    navigate("/");
  };

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

  const start = <img src={logo} alt="Logo" style={{ height: "40px", backgroundColor: "transparent" }} />;
  const end = showLoginOnly ? null : <i className="pi pi-user" style={{ fontSize: "1.5rem" }}></i>;

  return (
    <header>
      <Menubar
        model={items}
        start={start}
        end={end}
        style={{
          backgroundColor: "#ffffff",
          color: "#0D1B2A",
          borderBottom: "1px solid #eaeaea"
        }}
      />
      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message="¿Desea cerrar sesión?"
        header="Confirmar cierre de sesión"
        icon="pi pi-exclamation-triangle"
        acceptLabel="Cerrar Sesión"
        rejectLabel="Permanecer Conectado"
        accept={confirmLogout}
        reject={() => setVisible(false)}
      />
    </header>
  );
};

export default Navbar;