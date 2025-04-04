import { useState, useEffect } from "react";
import AddBanco from "./AddBanco";
import EditBanco from "./EditBanco";
import ConfirmDelete from "./ConfirmDeleteBanco";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Bancos() {
  const [bancos, setBancos] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Obtener todos los bancos
  const fetchBancos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/bancos`);
      const data = await res.json();
      setBancos(data);
    } catch (err) {
      console.error("Error al obtener los bancos:", err);
    }
  };

  // Eliminar un banco
  const deleteBancos = async () => {
    if (!deleteId) {
      console.error("No hay ID para eliminar");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/bancos/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log(`Registro con ID ${deleteId} eliminado correctamente`);
        setBancos((prev) => prev.filter((item) => item.BAN_bancos !== deleteId));
        setShowConfirmDelete(false);
        setDeleteId(null);
        setErrorMessage(""); // Limpiar cualquier mensaje de error previo
      } else {
        const errorText = await res.text();
        console.error("Error al eliminar banco:", errorText);
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

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchBancos();
  }, []);

  return (
    <div>
      {showAddForm ? (
        <AddBanco
          onCancel={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchBancos(); // Actualizar la tabla después de agregar
          }}
        />
      ) : showEditForm ? (
        <EditBanco
          initialData={editData}
          onCancel={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            fetchBancos(); // Actualizar la tabla después de editar
          }}
        />
      ) : (
        <>
          <h2>Bancos</h2>
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
                <th>País</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bancos.map((item) => (
                <tr key={item.BAN_bancos}>
                  <td>{item.BAN_bancos}</td>
                  <td>{item.BAN_Nombre}</td>
                  <td>{item.BAN_Pais}</td>
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
                        setDeleteId(item.BAN_bancos);
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
          onConfirm={deleteBancos}
          onCancel={() => {
            setShowConfirmDelete(false);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}

export default Bancos;
