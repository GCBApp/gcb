import { useState, useEffect } from "react";
import AddEstado from "./AddEstado";
import EditEstado from "./EditEstado";
import ConfirmDelete from "./ConfirmDeleteEstado";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Estado() {
  const [estado, setEstado] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Obtener todos los bancos
  const fetchEstado = async () => {
    try {
      const res = await fetch(`${API_URL}/api/estado`);
      const data = await res.json();
      setEstado(data);
    } catch (err) {
      console.error("Error al obtener los Estados:", err);
    }
  };

  // Eliminar un banco
  const deleteEstado = async () => {
    if (!deleteId) {
      console.error("No hay ID para eliminar");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/estado/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log(`Registro con ID ${deleteId} eliminado correctamente`);
        setEstado((prev) => prev.filter((item) => item.EST_Estado !== deleteId));
        setShowConfirmDelete(false);
        setDeleteId(null);
        setErrorMessage(""); // Limpiar cualquier mensaje de error previo
      } else {
        const errorText = await res.text();
        console.error("Error al eliminar estado:", errorText);
        setShowConfirmDelete(false); // Cerrar la ventana de confirmación
        setErrorMessage("No se puede eliminar el registro porque está relacionado con otros datos.");
        setTimeout(() => setErrorMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
      }
    } catch (err) {
      console.error("Error al eliminar el estado:", err);
      setShowConfirmDelete(false); // Cerrar la ventana de confirmación
      setErrorMessage("Ocurrió un error al intentar eliminar el registro.");
      setTimeout(() => setErrorMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
    }
  };
  

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchEstado();
  }, []);

  return (
    <div>
      {showAddForm ? (
        <AddEstado
          onCancel={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchEstado(); // Actualizar la tabla después de agregar
          }}
        />
      ) : showEditForm ? (
        <EditEstado
          initialData={editData}
          onCancel={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            fetchEstado(); // Actualizar la tabla después de editar
          }}
        />
      ) : (
        <>
          <h2>Estados</h2>
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
                <th>ID Movimiento</th>
                <th>ID Compensacion</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {estado.map((item) => (
                <tr key={item.EST_Estado}>
                  <td>{item.EST_Estado}</td>
                  <td>{item.MOV_movimiento}</td>
                  <td>{item.COM_Compensacion}</td>
                  <td>{item.EST_Descripcion}</td>
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
                        setDeleteId(item.EST_Estado);
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
        <ConfirmDelete
          message="¿Desea eliminar el registro?"
          onConfirm={deleteEstado}
          onCancel={() => {
            setShowConfirmDelete(false);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}

export default Estado;
