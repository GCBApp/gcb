// src/pages/CompensacionApp.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CompensacionList from "../components/CompensacionList";
import CompensacionForm from "../components/CompensacionForm";

const CompensacionApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CompensacionList />} />
        <Route path="/crear" element={<CompensacionForm />} />
        <Route path="/editar/:id" element={<CompensacionForm />} />
      </Routes>
    </Router>
  );
};

export default CompensacionApp;