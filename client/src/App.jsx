import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AccountsPage from "./pages/AccountsPage";
import MovementsPage from "./pages/MovementsPage";
import ProfilePage from "./pages/ProfilePage";
import CrudPage from "./pages/CrudPage";
import Login from "./views/Login";
import UserInfo from "./views/UserInfo";
import MovimientoResumen from "./views/Carga";
import { AuthProvider, useAuth } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/Login" element={<Login />} />
              <Route path="/" element={<Login />} /> {/* Cambiar la ruta raíz para que no cargue HomePage */}
              <Route path="/HomePage" element={<HomePage />} /> {/* Mantener el gráfico en esta ruta */}
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/carga" element={<MovimientoResumen />} />
              <Route path="/profile" element={<UserInfo />} />
              <Route path="/cruds" element={<CrudPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;