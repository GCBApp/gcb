import { useState, useEffect } from "react";
import AddMovimiento from "./AddMovimiento";
import EditMovimiento from "./EditMovimiento";
import ConfirmDeleteMovimiento from "./ConfirmDeleteMovimiento";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Movimiento() {
  const [movimientos, setMovimientos] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Obtener todos los movimientos
  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/movimiento`);
      const data = await res.json();
      setMovimientos(data);
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener los movimientos:", err);
      setLoading(false);
      setErrorMessage("Error al cargar los datos. Por favor, intente nuevamente.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Eliminar un movimiento
  const deleteMovimiento = async () => {
    if (!deleteId) {
      console.error("No hay ID para eliminar");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/movimiento/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log(`Registro con ID ${deleteId} eliminado correctamente`);
        setMovimientos((prev) => prev.filter((item) => item.MOV_Movimiento !== deleteId));
        setShowConfirmDelete(false);
        setDeleteId(null);
        setErrorMessage("");
      } else {
        const errorText = await res.text();
        console.error("Error al eliminar el movimiento:", errorText);
        setShowConfirmDelete(false);
        setErrorMessage("No se puede eliminar el registro porque está relacionado con otros datos.");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error al eliminar el movimiento:", err);
      setShowConfirmDelete(false);
      setErrorMessage("Ocurrió un error al intentar eliminar el registro.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchMovimientos();
  }, []);

  return (
    <div>
      {showAddForm ? (
        <AddMovimiento
          onCancel={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchMovimientos();
          }}
        />
      ) : showEditForm ? (
        <EditMovimiento
          initialData={editData}
          onCancel={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            fetchMovimientos();
          }}
        />
      ) : (
        <>
          <h2>Movimientos</h2>
          <button onClick={() => setShowAddForm(true)}>Agregar</button>
          {errorMessage && (
            <div style={{ color: "red", marginTop: "10px" }}>
              <strong>{errorMessage}</strong>
            </div>
          )}
          {loading ? (
            <p>Cargando datos...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table border="1" style={{ width: "100%", marginTop: "20px", textAlign: "left" }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Referencia</th>
                    <th>Descripción</th>
                    <th>Valor</th>
                    <th>Fecha</th>
                    <th>Tipo Movimiento</th>
                    <th>Cuenta</th>
                    <th>Moneda</th>
                    <th>Usuario</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((item) => (
                    <tr key={item.MOV_Movimiento}>
                      <td>{item.MOV_Movimiento}</td>
                      <td>{item.MOV_id}</td>
                      <td>{item.MOV_Descripcion}</td>
                      <td>{item.MOV_Valor}</td>
                      <td>{formatDate(item.MOV_Fecha_Mov)}</td>
                      <td>{item.TM_descripcion}</td>
                      <td>{item.CUB_Cuentabancaria}</td>
                      <td>{item.MON_Nombre}</td>
                      <td>{item.US_Nombre}</td>
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
                            setDeleteId(item.MOV_Movimiento);
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
            </div>
          )}
        </>
      )}

      {showConfirmDelete && (
        <ConfirmDeleteMovimiento
          message="¿Desea eliminar el registro?"
          onConfirm={deleteMovimiento}
          onCancel={() => {
            setShowConfirmDelete(false);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}

export default Movimiento;