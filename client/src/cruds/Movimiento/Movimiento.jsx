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

  // Función mejorada para obtener los movimientos con diagnóstico detallado
  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      console.log("Obteniendo movimientos desde:", `${API_URL}/api/movimiento`);
      
      const res = await fetch(`${API_URL}/api/movimiento`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Error ${res.status}: ${errorText}`);
        throw new Error(`Error del servidor: ${res.status} - ${errorText}`);
      }
      
      // Registrar los encabezados de respuesta para diagnóstico
      const headers = {};
      res.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("Encabezados de respuesta:", headers);
      
      const contentType = res.headers.get("content-type");
      console.log("Tipo de contenido:", contentType);
      
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Tipo de contenido inesperado: ${contentType}`);
      }
      
      // Obtener datos como texto primero para diagnóstico
      const rawText = await res.clone().text();
      console.log("Respuesta en texto:", rawText);
      
      try {
        const data = await res.json();
        console.log("Datos parseados:", data);
        
       
        
        if (Array.isArray(data)) {
          setMovimientos(data);
          setErrorMessage("");
        } else {
          console.warn("La API devolvió datos, pero no es un array:", data);
          setMovimientos([]);
          setErrorMessage("La API devolvió un formato inesperado. Verifique la consola.");
        }
      } catch (parseError) {
        console.error("Error al parsear JSON:", parseError);
        console.log("Texto que causó el error:", rawText);
        throw new Error("Error al interpretar la respuesta como JSON");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener los movimientos:", err);
      setMovimientos([]);
      setLoading(false);
      setErrorMessage(`Error: ${err.message}`);
    }
  };

  // Eliminar un movimiento
  const deleteMovimiento = async () => {
    if (!deleteId) {
      console.error("No hay ID para eliminar");
      return;
    }

    try {
      setErrorMessage(""); // Limpiar errores previos
      console.log("Eliminando movimiento con ID:", deleteId);
      
      const res = await fetch(`${API_URL}/api/movimiento/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log(`Registro con ID ${deleteId} eliminado correctamente`);
        setMovimientos((prev) => prev.filter((item) => item.MOV_Movimiento !== deleteId));
        setShowConfirmDelete(false);
        setDeleteId(null);
      } else {
        const errorText = await res.text();
        console.error("Error al eliminar el movimiento:", errorText);
        setShowConfirmDelete(false);
        setErrorMessage(`Error al eliminar: ${res.status} ${errorText}`);
        setTimeout(() => setErrorMessage(""), 5000);
      }
    } catch (err) {
      console.error("Error al eliminar el movimiento:", err);
      setShowConfirmDelete(false);
      setErrorMessage(`Error: ${err.message}`);
      setTimeout(() => setErrorMessage(""), 5000);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      // Crear un objeto Date desde la cadena de fecha
      const [year, month, day] = dateString.split("T")[0].split("-");

      // Formatear la fecha en formato local (DD/MM/YYYY)
      return `${day}/${month}/${year}`;
    } catch (e) {
      console.error("Error al formatear fecha:", dateString, e);
      return "Fecha inválida";
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchMovimientos();
  }, []);

  // Forzar una nueva carga de datos
  const handleReload = () => {
    fetchMovimientos();
  };

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
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button onClick={() => setShowAddForm(true)}>Agregar</button>
            <button onClick={handleReload}>Recargar Datos</button>
          </div>
          
          {errorMessage && (
            <div style={{ color: "red", marginTop: "10px", padding: "10px", border: "1px solid #ffcccc", backgroundColor: "#fff5f5" }}>
              <strong>{errorMessage}</strong>
            </div>
          )}
          
          
          
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <p>Cargando datos...</p>
            </div>
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
                  {movimientos.length > 0 ? (
                    movimientos.map((item) => (
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
                            style={{ marginLeft: "5px" }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" style={{ textAlign: "center", padding: "15px" }}>
                        No hay datos disponibles
                      </td>
                    </tr>
                  )}
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