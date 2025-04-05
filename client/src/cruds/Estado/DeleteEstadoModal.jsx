import React from "react";

const DeleteEstadoModal = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>¿Estás seguro de que quieres eliminar este estado?</h2>
        <button onClick={onDelete}>Eliminar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

export default DeleteEstadoModal;