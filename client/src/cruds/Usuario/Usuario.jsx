import { useState, useEffect } from "react";
import AddEmpleado from "./AddEmpleado";
import EditEmpleado from "./EditEmpleado";
import ConfirmDeleteEmpleado from "./ConfirmDeleteEmpleado";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Empleado() {
  const [empleados, setEmpleados] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchEmpleados = async () => {
    try {
      const res = await fetch(`${API_URL}/api/empleado`);
      const data = await res.json();
      setEmpleados(data);
    } catch (err) {
      console.error("Error al obtener los empleados:", err);
    }
  };

  const deleteEmpleado = async () => {
    if (!deleteId) {
      console.error("No hay ID para eliminar");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/empleado/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log(`Registro con ID ${deleteId} eliminado correctamente`);
        setEmpleados((prev) => prev.filter((item) => item.EM_empleado !== deleteId));
        setShowConfirmDelete(false);
        setDeleteId(null);
        setErrorMessage("");
      } else {
        const errorText = await res.text();
        console.error("Error al eliminar el empleado:", errorText);
        setShowConfirmDelete(false);
        setErrorMessage("No se puede eliminar el registro porque está relacionado con otros datos.");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error al eliminar el empleado:", err);
      setShowConfirmDelete(false);
      setErrorMessage("Ocurrió un error al intentar eliminar el registro.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  return (
    <div>
      {showAddForm ? (
        <AddEmpleado
          onCancel={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchEmpleados();
          }}
        />
      ) : showEditForm ? (
        <EditEmpleado
          initialData={editData}
          onCancel={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            fetchEmpleados();
          }}
        />
      ) : (
        <>
          <h2>Empleados</h2>
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
                <th>Usuario</th>
                <th>Tipo Usuario</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((item) => (
                <tr key={item.EM_empleado}>
                  <td>{item.EM_empleado}</td>
                  <td>{item.EM_usuario}</td>
                  <td>{item.TU_tipousuario}</td>
                  <td>{item.EM_nombre}</td>
                  <td>{item.EM_apellido}</td>
                  <td>{item.EM_correo}</td>
                  <td>{item.EM_telefono}</td>
                  <td>{item.EM_direccion}</td>
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
                        setDeleteId(item.EM_empleado);
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
        <ConfirmDeleteEmpleado
          message="¿Desea eliminar el registro?"
          onConfirm={deleteEmpleado}
          onCancel={() => {
            setShowConfirmDelete(false);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}

export default Empleado;
