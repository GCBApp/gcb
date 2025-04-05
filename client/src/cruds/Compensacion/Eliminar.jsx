import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useHistory } from "react-router-dom";

const CompensacionDelete = () => {
  const { id } = useParams();
  const history = useHistory();
  const [compensacion, setCompensacion] = useState(null);

  const fetchCompensacion = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/compensacion/${id}`);
      setCompensacion(res.data);
    } catch (error) {
      console.error("Error al obtener la compensación:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("¿Estás seguro de eliminar esta compensación?")) {
      try {
        await axios.delete(`http://localhost:3000/api/compensacion/${id}`);
        alert("Compensación eliminada con éxito.");
        history.push("/"); // Redirige a la lista de compensaciones después de eliminar
      } catch (error) {
        console.error("Error al eliminar la compensación:", error);
        alert("Hubo un problema al eliminar la compensación.");
      }
    }
  };

  useEffect(() => {
    fetchCompensacion();
  }, [id]);

  return (
    <div>
      {compensacion ? (
        <div>
          <h2>Eliminar Compensación</h2>
          <p><strong>ID:</strong> {compensacion.COM_Compensacion}</p>
          <p><strong>Descripción:</strong> {compensacion.COM_Descripcion}</p>
          <p><strong>Fecha:</strong> {new Date(compensacion.COM_Fecha).toLocaleDateString()}</p>
          <p><strong>Tipo:</strong> {compensacion.COM_Tipo}</p>
          <p><strong>Valor:</strong> {compensacion.COM_Valor}</p>
          <button onClick={handleDelete}>Eliminar</button>
          <button onClick={() => history.push("/")}>Cancelar</button>
        </div>
      ) : (
        <p>Cargando compensación...</p>
      )}
    </div>
  );
};

export default CompensacionDelete;