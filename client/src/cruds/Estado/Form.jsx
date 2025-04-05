import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";

const EstadoForm = () => {
  const { id } = useParams();
  const [estado, setEstado] = useState({
    MOV_movimiento: "",
    COM_Compensacion: "",
    EST_descripcion: "",
  });
  const history = useHistory();

  useEffect(() => {
    if (id) {
      const fetchEstado = async () => {
        const response = await fetch(`/api/estado/${id}`);
        const data = await response.json();
        setEstado({
          MOV_movimiento: data.MOV_movimiento,
          COM_Compensacion: data.COM_Compensacion,
          EST_descripcion: data.EST_descripcion,
        });
      };
      fetchEstado();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEstado({ ...estado, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/estado/${id}` : "/api/estado";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(estado),
    });

    if (response.ok) {
      history.push("/estado");
    } else {
      console.error("Error al guardar el estado");
    }
  };

  return (
    <div>
      <h1>{id ? "Editar Estado" : "Crear Estado"}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Movimiento</label>
          <input
            type="number"
            name="MOV_movimiento"
            value={estado.MOV_movimiento}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Compensación</label>
          <input
            type="number"
            name="COM_Compensacion"
            value={estado.COM_Compensacion}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Descripción</label>
          <input
            type="text"
            name="EST_descripcion"
            value={estado.EST_descripcion}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
};

export default EstadoForm;