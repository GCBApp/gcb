import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="logo">GCB App</div>
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/accounts">Cuentas</Link></li>
            <li><Link to="/movements">Movimientos</Link></li>
            <li><Link to="/profile">Perfil</Link></li>
            <li><Link to="/cruds">Cruds</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
