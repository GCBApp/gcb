import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const EstadoDetail = () => {
  const { id } = useParams();
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    const fetchEstado = async () => {
      const response = await fetch(`/api/estado/${id}`);
      const data = await response.json();
      setEstado(data);
    };
    fetchEstado();
  }, [id]);

  if (!estado) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Detalle del Estado</h1>
      <p><strong>Movimiento:</strong> {estado.MOV_movimiento}</p>
      <p><strong>Compensación:</strong> {estado.COM_Compensacion}</p>
      <p><strong>Descripción:</strong> {estado.EST_descripcion}</p>
    </div>
  );
};

export default EstadoDetail;