import { useState, useEffect } from "react";
import AddTipoUsuario from "./AddTipoUsuario";
import EditTipoUsuario from "./EditTipoUsuario";
import ConfirmDelete from "./ConfirmDeleteTipoUsuario";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function TipoUsuario() {
  const [tipoUsuarios, setTipoUsuarios] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Obtener todos los tipos de usuario
  const fetchTipoUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tipoUsuario`);
      const data = await res.json();
      setTipoUsuarios(data);
    } catch (err) {
      console.error("Error al obtener los tipos de usuario:", err);
    }
  };

  // Eliminar un tipo de usuario
  const deleteTipoUsuario = async () => {
    if (!deleteId) {
      console.error("No hay ID para eliminar");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/tipoUsuario/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log(`Registro con ID ${deleteId} eliminado correctamente`);
        setTipoUsuarios((prev) => prev.filter((item) => item.TU_tipousuario !== deleteId));
        setShowConfirmDelete(false);
        setDeleteId(null);
        setErrorMessage(""); // Limpiar cualquier mensaje de error previo
      } else {
        const errorText = await res.text();
        console.error("Error al eliminar el tipo de usuario:", errorText);
        setShowConfirmDelete(false); // Cerrar la ventana de confirmación
        setErrorMessage("No se puede eliminar el registro porque está relacionado con otros datos.");
        setTimeout(() => setErrorMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
      }
    } catch (err) {
      console.error("Error al eliminar el tipo de usuario:", err);
      setShowConfirmDelete(false); // Cerrar la ventana de confirmación
      setErrorMessage("Ocurrió un error al intentar eliminar el registro.");
      setTimeout(() => setErrorMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchTipoUsuarios();
  }, []);

  return (
    <div>
      {showAddForm ? (
        <AddTipoUsuario
          onCancel={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchTipoUsuarios(); // Actualizar la tabla después de agregar
          }}
        />
      ) : showEditForm ? (
        <EditTipoUsuario
          initialData={editData}
          onCancel={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            fetchTipoUsuarios(); // Actualizar la tabla después de editar
          }}
        />
      ) : (
        <>
          <h2>Tipo Usuario</h2>
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
              {tipoUsuarios.map((item) => (
                <tr key={item.TU_tipousuario}>
                  <td>{item.TU_tipousuario}</td>
                  <td>{item.TU_descripcion}</td>
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
                        setDeleteId(item.TU_tipousuario);
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
          onConfirm={deleteTipoUsuario}
          onCancel={() => {
            setShowConfirmDelete(false);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}

export default TipoUsuario;
