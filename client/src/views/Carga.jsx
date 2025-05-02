import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddCarga from "./AddCarga";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function MovimientoResumen() {
  const [showAddForm, setShowAddForm] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Obtener todos los movimientos
  const fetchMovimientos = async () => {
    try {
      console.log("Obteniendo movimientos...");
      setLoading(true);
      const res = await fetch(`${API_URL}/api/movimiento`);
      if (!res.ok) throw new Error("Error al obtener los movimientos.");
      const data = await res.json();

      // Asegurarse de que no haya duplicados en los datos
      const movimientosUnicos = Array.from(new Set(data.map((item) => item.MOV_Movimiento))).map(
        (id) => data.find((item) => item.MOV_Movimiento === id)
      );

      console.log("Movimientos obtenidos:", movimientosUnicos);
      setMovimientos(movimientosUnicos);
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener los movimientos:", err);
      setLoading(false);
      setErrorMessage("Error al cargar los datos. Por favor, intente nuevamente.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchMovimientos();
  }, []);

  // Calcular totales de las columnas "DEBE" y "HABER" a partir de MOV_Valor_GTQ
  const totalDebe = movimientos.reduce((sum, item) => (item.MOV_Valor_GTQ > 0 ? sum + item.MOV_Valor_GTQ : sum), 0);
  const totalHaber = movimientos.reduce((sum, item) => (item.MOV_Valor_GTQ < 0 ? sum + Math.abs(item.MOV_Valor_GTQ) : sum), 0);

  return (
    <div>
      <h2>Resumen de Movimientos</h2>
      <button onClick={() => setShowAddForm(true)}>Agregar Nueva Carga</button>
      {showAddForm && (
        <AddCarga
          onCancel={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchMovimientos(); // Recargar movimientos
          }}
          user={user}
        />
      )}
      {errorMessage && (
        <div style={{ color: "red", marginTop: "10px" }}>
          <strong>{errorMessage}</strong>
        </div>
      )}
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table border="1" style={{ width: "100%", marginTop: "20px", textAlign: "left" }}>
            <thead>
              <tr>
                <th>Numero de Movimiento</th>
                <th>Referencia</th>
                <th>Descripción</th>
                <th>Cuenta Bancaria</th>
                <th>Moneda</th>
                <th>Tipo Movimiento</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>DEBE</th>
                <th>HABER</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((item) => (
                <tr key={item.MOV_Movimiento}>
                  <td>{item.MOV_Movimiento}</td>
                  <td>{item.MOV_id}</td>
                  <td>{item.MOV_Descripcion}</td>
                  <td>{item.CuentaBancaria}</td>
                  <td>{item.Moneda}</td>
                  <td>{item.TipoMovimiento}</td>
                  <td>{item.NombreUsuario}</td>
                  <td>{formatDate(item.MOV_Fecha_Mov)}</td>
                  <td style={{ color: item.MOV_Valor_GTQ > 0 ? "green" : "black" }}>
                    {item.MOV_Valor_GTQ > 0 ? item.MOV_Valor_GTQ.toFixed(2) : ""}
                  </td>
                  <td style={{ color: item.MOV_Valor_GTQ < 0 ? "red" : "black" }}>
                    {item.MOV_Valor_GTQ < 0 ? Math.abs(item.MOV_Valor_GTQ).toFixed(2) : ""}
                  </td>
                </tr>
              ))}
              {/* Fila de totales */}
              <tr>
                <td colSpan="8" style={{ textAlign: "right", fontWeight: "bold" }}>Subtotal: </td>
                <td style={{ fontWeight: "bold", color: "green" }}>{totalDebe.toFixed(2)}</td>
                <td style={{ fontWeight: "bold", color: "red" }}>{totalHaber.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MovimientoResumen;