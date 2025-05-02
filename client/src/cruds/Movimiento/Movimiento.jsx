import { useState, useEffect } from "react";
import AddMovimiento from "./AddMovimiento";
import EditMovimiento from "./EditMovimiento";
import ConfirmDeleteMovimiento from "./ConfirmDeleteMovimiento";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Movimiento() {
  const [movimientos, setMovimientos] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Obtener movimientos
  const fetchMovimientos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/movimiento`);
      if (!res.ok) throw new Error(`Error al obtener movimientos: ${res.status}`);
      const data = await res.json();

      // Asegurarse de que no haya duplicados en los datos
      const movimientosUnicos = Array.from(new Set(data.map((item) => item.MOV_Movimiento))).map(
        (id) => data.find((item) => item.MOV_Movimiento === id)
      );

      setMovimientos(movimientosUnicos);
      setErrorMessage("");
    } catch (err) {
      console.error("Error al obtener movimientos:", err);
      setErrorMessage("Error al cargar los movimientos.");
    }
  };

  const deleteMovimiento = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`${API_URL}/api/movimiento/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setMovimientos((prev) => prev.filter((item) => item.MOV_Movimiento !== deleteId));
        setShowConfirmDelete(false);
        setDeleteId(null);
      } else {
        console.error("Error al eliminar el movimiento.");
      }
    } catch (err) {
      console.error("Error al eliminar el movimiento:", err);
    }
  };

  // Cargar movimientos al montar el componente
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
          <table border="1" style={{ width: "100%", marginTop: "20px", textAlign: "left" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Referencia</th>
                <th>Usuario</th>
                <th>Moneda</th>
                <th>Tipo Movimiento</th>
                <th>Cuenta Bancaria</th>
                <th>Descripción</th>
                <th>Fecha Movimiento</th>
                <th>Fecha Registro</th>
                <th>Valor</th>
                <th>Tipo de Cambio</th> {/* Nueva columna */}
                <th>Valor GTQ</th>       {/* Nueva columna */}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((item) => (
                <tr key={item.MOV_Movimiento}>
                  <td>{item.MOV_Movimiento}</td>
                  <td>{item.MOV_id}</td>
                  <td>{item.NombreUsuario}</td>
                  <td>{item.Moneda}</td>
                  <td>{item.TipoMovimiento}</td>
                  <td>{item.CuentaBancaria}</td>
                  <td>{item.MOV_Descripcion}</td>
                  <td>{item.MOV_Fecha_Mov}</td>
                  <td>{item.MOV_Fecha_Registro}</td>
                  <td>{item.MOV_Valor}</td>
                  <td>{item.MOV_Tipo_Cambio}</td> {/* Mostrar Tipo de Cambio */}
                  <td>{item.MOV_Valor_GTQ}</td>   {/* Mostrar Valor en GTQ */}
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
        </>
      )}

      {showConfirmDelete && (
        <ConfirmDeleteMovimiento
          message="¿Desea eliminar el movimiento?"
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