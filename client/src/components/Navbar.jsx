import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  if (isAuthenticated) return null; // No renderizar el Navbar si no está autenticado
  
  const handleLogout = () => {
    setIsAuthenticated(false); // Cambiar el estado de autenticación a falso
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    window.location.reload();

  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo">GCB App</div>
        <nav>
          <ul className="nav-links">
            <li><Link to="/HomePage">Inicio</Link></li>
            <li><Link to="/accounts">Cuentas</Link></li>
            <li><Link to="/carga">Movimientos</Link></li>
            <li><Link to="/profile">Perfil</Link></li>
            <li><Link to="/cruds">Cruds</Link></li>
            <li onClick={handleLogout}>
              <Link to="/">Cerrar Sesión</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
