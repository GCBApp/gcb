import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const EstadoList = () => {
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    const fetchEstados = async () => {
      const response = await fetch("/api/estado");
      const data = await response.json();
      setEstados(data);
    };
    fetchEstados();
  }, []);

  return (
    <div>
      <h1>Lista de Estados</h1>
      <table>
        <thead>
          <tr>
            <th>Movimiento</th>
            <th>Compensación</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {estados.map((estado) => (
            <tr key={estado.EST_Estado}>
              <td>{estado.MOV_movimiento}</td>
              <td>{estado.COM_Compensacion}</td>
              <td>{estado.EST_descripcion}</td>
              <td>
                <Link to={`/estado/${estado.EST_Estado}`}>Ver</Link>
                <Link to={`/estado/editar/${estado.EST_Estado}`}>Editar</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EstadoList;