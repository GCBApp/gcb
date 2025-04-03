import { useState, useEffect } from "react";
import AddMoneda from "./AddMoneda";
import EditMoneda from "./EditMoneda";
import ConfirmDelete from "./ConfirmDeleteMoneda";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Moneda() {
  const [monedas, setMonedas] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Obtener todas las monedas
  const fetchMonedas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/moneda`);
      const data = await res.json();
      setMonedas(data);
    } catch (err) {
      console.error("Error al obtener las monedas:", err);
    }
  };

  // Eliminar una moneda
  const deleteMoneda = async () => {
    if (!deleteId) {
      console.error("No hay ID para eliminar");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/moneda/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log(`Registro con ID ${deleteId} eliminado correctamente`);
        setMonedas((prev) => prev.filter((item) => item.MON_moneda !== deleteId));
        setShowConfirmDelete(false);
        setDeleteId(null);
        setErrorMessage(""); // Limpiar cualquier mensaje de error previo
      } else {
        const errorText = await res.text();
        console.error("Error al eliminar moneda:", errorText);
        setShowConfirmDelete(false); // Cerrar la ventana de confirmación
        setErrorMessage("No se puede eliminar el registro porque está relacionado con otros datos.");
        setTimeout(() => setErrorMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
      }
    } catch (err) {
      console.error("Error al eliminar la moneda:", err);
      setShowConfirmDelete(false); // Cerrar la ventana de confirmación
      setErrorMessage("Ocurrió un error al intentar eliminar el registro.");
      setTimeout(() => setErrorMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchMonedas();
  }, []);

  return (
    <div>
      {showAddForm ? (
        <AddMoneda
          onCancel={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchMonedas(); // Actualizar la tabla después de agregar
          }}
        />
      ) : showEditForm ? (
        <EditMoneda
          initialData={editData}
          onCancel={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            fetchMonedas(); // Actualizar la tabla después de editar
          }}
        />
      ) : (
        <>
          <h2>Moneda</h2>
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
                <th>Nombre</th>
                <th>Valor</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {monedas.map((item) => (
                <tr key={item.MON_moneda}>
                  <td>{item.MON_moneda}</td>
                  <td>{item.MON_nombre}</td>
                  <td>{parseFloat(item.MON_valor).toFixed(5)}</td> {/* Mostrar con 5 decimales */}
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
                        setDeleteId(item.MON_moneda);
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
          onConfirm={deleteMoneda}
          onCancel={() => {
            setShowConfirmDelete(false);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}

export default Moneda;
