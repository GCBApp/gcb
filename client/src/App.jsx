import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AccountsPage from "./pages/AccountsPage";
import MovementsPage from "./pages/MovementsPage";
import ProfilePage from "./pages/ProfilePage";
import CrudPage from "./pages/CrudPage";
import Login from "./views/Login";
import UserInfo from "./views/UserInfo";
import ConciliacionPage from "./pages/ConciliacionPage";
import CompensasionPage from "./pages/CompensasionPage";
// import AddAccount from "./pages/AddAcount";
import EditAccount from "./pages/EditAccount";
import PeriodosPage from "./pages/PeriodosPage";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation(); 
  const hideNavbar = location.pathname === "/Login" || location.pathname === "/"; 

  return (
    <div className="app-container">
      {/* Renderizar el Navbar solo si el usuario está autenticado */}
      {isAuthenticated && !hideNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/HomePage" element={<HomePage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/edit-account/:id" element={<EditAccount />} />
          <Route path="/movements" element={<MovementsPage />} />
          <Route path="/profile" element={<UserInfo />} />
          <Route path="/cruds" element={<CrudPage />} />
          <Route path="/conciliacion" element={<ConciliacionPage />} />
          {/* <Route path="/compensasion" element={<CompensasionPage />} /> */}
          <Route path="/periodos" element={<PeriodosPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;