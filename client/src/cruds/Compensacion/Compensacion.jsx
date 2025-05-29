import { useState, useEffect } from "react";
import EditCompensacion from "./EditCompensacion";
import ConfirmDelete from "./ConfirmDeleteCompensacion";
import ProcessCompensacion from "./ProcessCompensacion"; // Importar el nuevo componente

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Compensacion() {
  const [compensacion, setCompensacion] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCompensacionId, setSelectedCompensacionId] = useState(null);

  // Obtener todos las compensaciones
  const fetchcompensacion = async () => {
    try {
      const res = await fetch(`${API_URL}/api/compensacion`);
      const data = await res.json();
      setCompensacion(data);
    } catch (err) {
      console.error("Error al obtener las compensaciones:", err);
    }
  };

  // Eliminar una compensación
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
        setErrorMessage("");
      } else {
        const errorText = await res.text();
        console.error("Error al eliminar compensacion:", errorText);
        setShowConfirmDelete(false);
        setErrorMessage("No se puede eliminar el registro porque está relacionado con otros datos.");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error al eliminar el banco:", err);
      setShowConfirmDelete(false);
      setErrorMessage("Ocurrió un error al intentar eliminar el registro.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchcompensacion();
  }, []);

  return (
    <div>
      {showEditForm ? (
        <EditCompensacion
          initialData={editData}
          onCancel={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            fetchcompensacion();
          }}
        />
      ) : showProcessForm ? (
        <ProcessCompensacion
          onCancel={() => setShowProcessForm(false)}
          onSuccess={() => {
            setShowProcessForm(false);
            fetchcompensacion();
          }}
        />
      ) : showDetails ? (
        <DetalleCompensacion
          compensacionId={selectedCompensacionId}
          onClose={() => {
            setShowDetails(false);
            setSelectedCompensacionId(null);
          }}
        />
      ) : (
        <>
          <h2>Compensaciones</h2>
          <div>
            <button 
              onClick={() => setShowProcessForm(true)}
              style={{ marginLeft: '0px', backgroundColor: '#4CAF50', color: 'white' }}
            >
              Procesar Compensación
            </button>
          </div>
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
                <th>Acciones</th>
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
                    <button
                      onClick={() => {
                        setSelectedCompensacionId(item.COM_Compensacion);
                        setShowDetails(true);
                      }}
                      style={{ backgroundColor: '#007BFF', color: 'white' }}
                    >
                      Detalles
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
