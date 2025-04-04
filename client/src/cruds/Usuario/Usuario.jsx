import { useState, useEffect } from "react";
import AddUsuario from "./AddUsuario";
import EditUsuario from "./EditUsuario";
import ConfirmDelete from "./ConfirmDeleteUsuario";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Usuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/api/usuario`);
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error("Error al obtener los usuarios:", err);
    }
  };

  const deleteUsuario = async () => {
    if (!deleteId) {
      console.error("No hay ID para eliminar");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/usuario/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log(`Registro con ID ${deleteId} eliminado correctamente`);
        setUsuarios((prev) => prev.filter((item) => item.US_usuario !== deleteId));
        setShowConfirmDelete(false);
        setDeleteId(null);
        setErrorMessage("");
      } else {
        const errorText = await res.text();
        console.error("Error al eliminar el usuario:", errorText);
        setShowConfirmDelete(false);
        setErrorMessage("No se puede eliminar el registro porque está relacionado con otros datos.");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error al eliminar el usuario:", err);
      setShowConfirmDelete(false);
      setErrorMessage("Ocurrió un error al intentar eliminar el registro.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div>
      {showAddForm ? (
        <AddUsuario
          onCancel={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchUsuarios();
          }}
        />
      ) : showEditForm ? (
        <EditUsuario
          initialData={editData}
          onCancel={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            fetchUsuarios();
          }}
        />
      ) : (
        <>
          <h2>Usuarios</h2>
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
                <th>Tipo Usuario</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Contraseña</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((item) => (
                <tr key={item.US_usuario}>
                  <td>{item.US_usuario || "N/A"}</td>
                  <td>{item.TU_tipousuario || "N/A"}</td>
                  <td>{item.US_nombre}</td>
                  <td>{item.US_correo}</td>
                  <td>{item.US_contraseña}</td>
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
                        setDeleteId(item.US_usuario);
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
          onConfirm={deleteUsuario}
          onCancel={() => {
            setShowConfirmDelete(false);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}

export default Usuario;
