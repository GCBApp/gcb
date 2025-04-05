import { useState, useEffect } from "react";
import AddCompensacion from "./AddCompensacion";
import EditCompensacion from "./EditCompensacion";
import ConfirmDelete from "./ConfirmDeleteCompensacion";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Compensacion() {
  const [compensacion, setCompensacion] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Obtener todos los bancos
  const fetchcompensacion = async () => {
    try {
      const res = await fetch(`${API_URL}/api/compensacion`);
      const data = await res.json();
      setCompensacion(data);
    } catch (err) {
      console.error("Error al obtener las compensaciones:", err);
    }
  };

  // Eliminar un banco
  const deleteCompensacion = async () => {
    if (!deleteId) {
      console.error("No hay ID para eliminar");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/compensacion/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log(`Registro con ID ${deleteId} eliminado correctamente`);
        setCompensacion((prev) => prev.filter((item) => item.COM_Compensacion !== deleteId));
        setShowConfirmDelete(false);
        setDeleteId(null);
        setErrorMessage(""); // Limpiar cualquier mensaje de error previo
      } else {
        const errorText = await res.text();
        console.error("Error al eliminar compensacion:", errorText);
        setShowConfirmDelete(false); // Cerrar la ventana de confirmación
        setErrorMessage("No se puede eliminar el registro porque está relacionado con otros datos.");
        setTimeout(() => setErrorMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
      }
    } catch (err) {
      console.error("Error al eliminar el banco:", err);
      setShowConfirmDelete(false); // Cerrar la ventana de confirmación
      setErrorMessage("Ocurrió un error al intentar eliminar el registro.");
      setTimeout(() => setErrorMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchcompensacion();
  }, []);

  return (
    <div>
      {showAddForm ? (
        <AddCompensacion
          onCancel={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchcompensacion(); // Actualizar la tabla después de agregar
          }}
        />
      ) : showEditForm ? (
        <EditCompensacion
          initialData={editData}
          onCancel={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            fetchcompensacion(); // Actualizar la tabla después de editar
          }}
        />
      ) : (
        <>
          <h2>Compensaciones</h2>
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
                <th>Descripcion</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {compensacion.map((item) => (
                <tr key={item.COM_Compensacion}>
                  <td>{item.COM_Compensacion}</td>
                  <td>{item.COM_Descripción}</td>
                  <td>{formatDate(item.COM_Fecha)}</td>
                  <td>{item.COM_Tipo}</td>
                  <td>{item.COM_Valor}</td>
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
                        setDeleteId(item.COM_Compensacion);
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
          onConfirm={deleteCompensacion}
          onCancel={() => {
            setShowConfirmDelete(false);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}

export default Compensacion;
