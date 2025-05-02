import React, { useState, useEffect } from "react";
import AddCarga from "../views/AddCarga";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const MovementsPage = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/movimiento`);
        if (!res.ok) throw new Error("Error al obtener los movimientos.");
        const data = await res.json();
        setMovimientos(data);
      } catch (err) {
        console.error("Error al cargar los movimientos:", err);
      }
    };

    fetchMovimientos();
  }, []);

  const handleView = (movimiento) => {
    setSelectedMovimiento(movimiento);
  };

  const handleCloseView = () => {
    setSelectedMovimiento(null);
  };

  return (
    <section className="movements-page" style={pageStyle}>
      <div className="content-container" style={containerStyle}>
        <h1>Movimientos</h1>
        <p>Gestiona tus movimientos aquí.</p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Descripción</th>
              <th>Debe</th>
              <th>Haber</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((mov) => (
              <tr key={mov.MOV_Movimiento}>
                <td>{mov.MOV_Movimiento}</td>
                <td>{mov.MOV_Descripcion}</td>
                <td>{mov.MOV_Tipo === "DEBE" ? mov.MOV_Valor : "-"}</td>
                <td>{mov.MOV_Tipo === "HABER" ? mov.MOV_Valor : "-"}</td>
                <td>
                  <button onClick={() => handleView(mov)} style={buttonStyle}>
                    Visualizar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedMovimiento && (
        <AddCarga
          onCancel={handleCloseView}
          onSuccess={handleCloseView}
          initialData={selectedMovimiento}
          isReadOnly={true}
        />
      )}
    </section>
  );
};

const pageStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  padding: "20px",
};

const containerStyle = {
  width: "100%",
  maxWidth: "1200px",
  textAlign: "center",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};

const buttonStyle = {
  padding: "5px 10px",
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#007bff",
  color: "#fff",
  cursor: "pointer",
};

export default MovementsPage;
