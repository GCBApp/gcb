import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AccountsPage from "./pages/AccountsPage";
import MovementsPage from "./pages/MovementsPage";
import ProfilePage from "./pages/ProfilePage";
import CrudPage from "./pages/CrudPage";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/movements" element={<MovementsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cruds" element={<CrudPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;