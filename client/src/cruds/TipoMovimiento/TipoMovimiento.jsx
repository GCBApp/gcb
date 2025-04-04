import React from 'react';
import { useState, useEffect } from "react";
import AddTipoMovimiento from "./AddTipoMovimiento";
import EditTipoMovimiento from "./EditTipoMovimiento";
import ConfirmDeleteTipoMovimiento from "./ConfirmDeleteTipoMovimiento";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function TipoMovimiento() {
  const [tipoMovimientos, setTipoMovimientos] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Obtener todos los tipos de movimiento
  const fetchTipoMovimientos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tipoMovimiento`);
      const data = await res.json();
      setTipoMovimientos(data);
    } catch (err) {
      console.error("Error al obtener los tipos de movimiento:", err);
    }
  };

  // Eliminar un tipo de movimiento
  const deleteTipoMovimiento = async () => {
    if (!deleteId) {
      console.error("No hay ID para eliminar");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/tipoMovimiento/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log(`Registro con ID ${deleteId} eliminado correctamente`);
        setTipoMovimientos((prev) => prev.filter((item) => item.TM_Tipomovimiento !== deleteId));
        setShowConfirmDelete(false);
        setDeleteId(null);
        setErrorMessage(""); // Limpiar cualquier mensaje de error previo
      } else {
        const errorText = await res.text();
        console.error("Error al eliminar el tipo de movimiento:", errorText);
        setShowConfirmDelete(false); // Cerrar la ventana de confirmación
        setErrorMessage("No se puede eliminar el registro porque está relacionado con otros datos.");
        setTimeout(() => setErrorMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
      }
    } catch (err) {
      console.error("Error al eliminar el tipo de movimiento:", err);
      setShowConfirmDelete(false); // Cerrar la ventana de confirmación
      setErrorMessage("Ocurrió un error al intentar eliminar el registro.");
      setTimeout(() => setErrorMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchTipoMovimientos();
  }, []);

  return (
    <div>
      {showAddForm ? (
        <AddTipoMovimiento
          onCancel={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchTipoMovimientos(); // Actualizar la tabla después de agregar
          }}
        />
      ) : showEditForm ? (
        <EditTipoMovimiento
          initialData={editData}
          onCancel={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            fetchTipoMovimientos(); // Actualizar la tabla después de editar
          }}
        />
      ) : (
        <>
          <h2>Tipos de Movimiento</h2>
          <button onClick={() => setShowAddForm(true)}>Agregar</button>
          {errorMessage && (
            <div style={{ color: "red", marginTop: "10px" }}>
              <strong>{errorMessage}</strong>
            </div>
          )}
          <table border="1" style={{ width: "100%", marginTop: "20px", textAlign: "left" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tipoMovimientos.map((item) => (
                <tr key={item.TM_Tipomovimiento}>
                  <td>{item.TM_Tipomovimiento}</td>
                  <td>{item.TM_descripcion}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditData(item);
                        setShowEditForm(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(item.TM_Tipomovimiento);
                        setShowConfirmDelete(true);
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {showConfirmDelete && (
        <ConfirmDeleteTipoMovimiento
          message="¿Desea eliminar el registro?"
          onConfirm={deleteTipoMovimiento}
          onCancel={() => {
            setShowConfirmDelete(false);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}

export default TipoMovimiento;