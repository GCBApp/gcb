import { useState, useEffect } from "react";
import AddCuentaBancaria from "./AddCuentaBancaria";
import EditCuentaBancaria from "./EditCuentaBancaria";
import ConfirmDelete from "./ConfirmDeleteCuentaBancaria";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function CuentaBancaria() {
  const [cuentas, setCuentas] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Obtener todos los bancos
  const fetchCuentas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cuentasBancarias`);
      const data = await res.json();
      setCuentas(data);
    } catch (err) {
      console.error("Error al obtener las cuentas bancarias:", err);
    }
  };

  // Eliminar un banco
  const deleteCuentas = async () => {
    if (!deleteId) {
      console.error("No hay ID para eliminar");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/cuentasBancarias/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        console.log(`Registro con ID ${deleteId} eliminado correctamente`);
        setCuentas((prev) => prev.filter((item) => item.CUB_Cuentabancaria !== deleteId));
        setShowConfirmDelete(false);
        setDeleteId(null);
        setErrorMessage(""); // Limpiar cualquier mensaje de error previo
      } else {
        const errorText = await res.text();
        console.error("Error al eliminar la cuenta:", errorText);
        setShowConfirmDelete(false); // Cerrar la ventana de confirmación
        setErrorMessage("No se puede eliminar el registro porque está relacionado con otros datos.");
        setTimeout(() => setErrorMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
      }
    } catch (err) {
      console.error("Error al eliminar la cuenta:", err);
      setShowConfirmDelete(false); // Cerrar la ventana de confirmación
      setErrorMessage("Ocurrió un error al intentar eliminar el registro.");
      setTimeout(() => setErrorMessage(""), 3000); // Ocultar el mensaje después de 3 segundos
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchCuentas();
  }, []);

  return (
    <div>
      {showAddForm ? (
        <AddCuentaBancaria
          onCancel={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchCuentas(); // Actualizar la tabla después de agregar
          }}
        />
      ) : showEditForm ? (
        <EditCuentaBancaria
          initialData={editData}
          onCancel={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            fetchCuentas(); // Actualizar la tabla después de editar
          }}
        />
      ) : (
        <>
          <h2>Cuentas Bancarias</h2>
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
                <th>Tipo</th>
                <th>ID_Banco</th>
                <th>Moneda</th>
                <th>Número</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.map((item) => (
                <tr key={item.CUB_Cuentabancaria}>
                  <td>{item.CUB_Cuentabancaria}</td>
                  <td>{item.CUB_Nombre}</td>
                  <td>{item.CUB_Tipo}</td>
                  <td>{item.BAN_banco}</td>
                  <td>{item.MON_moneda}</td>
                  <td>{item.CUB_Número}</td>
                  <td>{item.CUB_saldo}</td>
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
                        setDeleteId(item.CUB_Cuentabancaria);
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
          onConfirm={deleteCuentas}
          onCancel={() => {
            setShowConfirmDelete(false);
            setDeleteId(null);
          }}
        />
      )}
    </div>
  );
}

export default CuentaBancaria;
