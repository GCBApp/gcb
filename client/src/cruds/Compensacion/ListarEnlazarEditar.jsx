// src/components/CompensacionList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const CompensacionList = () => {
  const [compensaciones, setCompensaciones] = useState([]);

  const fetchData = async () => {
    const res = await axios.get("http://localhost:3000/api/compensacion");
    setCompensaciones(res.data);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta compensación?")) {
      await axios.delete(`http://localhost:3000/api/compensacion/${id}`);
      fetchData();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h2>Listado de Compensaciones</h2>
      <Link to="/crear">➕ Crear nueva compensación</Link>
      <table border="1" cellPadding={8} style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Descripción</th>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {compensaciones.map((comp) => (
            <tr key={comp.COM_Compensacion}>
              <td>{comp.COM_Compensacion}</td>
              <td>{comp.COM_Descripcion}</td>
              <td>{new Date(comp.COM_Fecha).toLocaleDateString()}</td>
              <td>{comp.COM_Tipo}</td>
              <td>{comp.COM_Valor}</td>
              <td>
                <Link to={`/editar/${comp.COM_Compensacion}`}>✏️</Link>{" "}
                <button onClick={() => handleDelete(comp.COM_Compensacion)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompensacionList;