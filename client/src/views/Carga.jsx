import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog"; // Importar el componente Dialog de PrimeReact
import AddCarga from "./AddCarga";
import Papa from "papaparse"; // Librería para procesar CSV
import { Toast } from "primereact/toast"; // Importar Toast de PrimeReact
import { ProgressSpinner } from "primereact/progressspinner"; // Importar ProgressSpinner de PrimeReact
import "./Carga.css"; // Importar el archivo CSS personalizado

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function MovimientoResumen() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalDebe, setTotalDebe] = useState(0);
  const [totalHaber, setTotalHaber] = useState(0);
  const [isUploading, setIsUploading] = useState(false); // Estado para mostrar el spinner
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false); // Estado para mostrar el diálogo
  const [movimientoToDelete, setMovimientoToDelete] = useState(null); // Movimiento a eliminar
  const toast = React.useRef(null); // Referencia para el Toast
  const navigate = useNavigate();

  // Obtener todos los movimientos
  const fetchMovimientos = async () => {
    try {
      console.log("Obteniendo movimientos...");
      setLoading(true);
      const res = await fetch(`${API_URL}/api/movimiento`);
      if (!res.ok) throw new Error("Error al obtener los movimientos.");
      const data = await res.json();

      // Asegurarse de que no haya duplicados en los datos
      const movimientosUnicos = Array.from(new Set(data.map((item) => item.MOV_Movimiento))).map(
        (id) => data.find((item) => item.MOV_Movimiento === id)
      );

      console.log("Movimientos obtenidos:", movimientosUnicos);
      setMovimientos(movimientosUnicos);

      // Calcular totales para "Debe" y "Haber"
      setTotalDebe(
        movimientosUnicos.filter((mov) => mov.MOV_Valor_GTQ > 0).reduce((sum, mov) => sum + mov.MOV_Valor_GTQ, 0)
      );
      setTotalHaber(
        movimientosUnicos.filter((mov) => mov.MOV_Valor_GTQ < 0).reduce((sum, mov) => sum + Math.abs(mov.MOV_Valor_GTQ), 0)
      );

      setLoading(false);
    } catch (err) {
      console.error("Error al obtener los movimientos:", err);
      setLoading(false);
      setErrorMessage("Error al cargar los datos. Por favor, intente nuevamente.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const handleView = (movimiento) => {
    setSelectedMovimiento(movimiento);
  };

  const handleCloseView = () => {
    setSelectedMovimiento(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true); // Mostrar spinner
    toast.current.show({ severity: "info", summary: "Cargando", detail: "Procesando archivo CSV...", life: 4000 });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;

        // Mapeo de columnas del CSV a los nombres esperados por el backend
        const columnMapping = {
          "ID Movimiento": "MOV_Movimiento",
          "Referencia": "MOV_id",
          "Usuario": "US_Usuario",
          "Moneda": "MON_Moneda",
          "Tipo de movimiento": "TM_Tipomovimiento",
          "Cuenta bancaria": "CUB_Cuentabancaria",
          "Descripcion": "MOV_Descripcion",
          "Fecha movimiento": "MOV_Fecha_Mov",
          "Valor": "MOV_Valor",
        };

        const mappedData = data.map((record) => {
          const mappedRecord = {};
          for (const [csvColumn, backendField] of Object.entries(columnMapping)) {
            mappedRecord[backendField] = record[csvColumn];
          }
          return mappedRecord;
        });

        console.log("Datos mapeados para el backend:", mappedData); // Depuración

        for (const record of mappedData) {
          try {
            const res = await fetch(`${API_URL}/api/movimiento`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record),
            });

            if (!res.ok) {
              const errorText = await res.text();
              console.error(`Error al procesar el registro: ${JSON.stringify(record)} - ${errorText}`);
            }
          } catch (err) {
            console.error(`Error al enviar el registro: ${JSON.stringify(record)}`, err);
          }
        }

        setIsUploading(false); // Ocultar spinner
        toast.current.show({ severity: "success", summary: "Completado", detail: "Carga masiva finalizada.", life: 3000 });
        fetchMovimientos(); // Recargar movimientos después de la carga masiva
      },
      error: (err) => {
        console.error("Error al procesar el archivo CSV:", err);
        setIsUploading(false); // Ocultar spinner
        toast.current.show({ severity: "error", summary: "Error", detail: "Error al procesar el archivo CSV.", life: 3000 });
      },
    });
  };

  const renderFooter = () => {
    return (
      <div style={{ textAlign: "right", fontWeight: "bold" }}>
        <span>Total Debe: {totalDebe.toFixed(2)}</span> | <span>Total Haber: {totalHaber.toFixed(2)}</span>
      </div>
    );
  };

  const confirmDelete = (movimientoId) => {
    setMovimientoToDelete(movimientoId);
    setDeleteDialogVisible(true); // Mostrar el diálogo de confirmación
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/api/movimiento/${movimientoToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.current.show({ severity: "success", summary: "Eliminado", detail: "Registro eliminado correctamente.", life: 3000 });
        fetchMovimientos(); // Recargar movimientos después de eliminar
      } else {
        const errorText = await res.text();
        console.error("Error al eliminar el registro:", errorText);
        toast.current.show({ severity: "error", summary: "Error", detail: "No se pudo eliminar el registro.", life: 3000 });
      }
    } catch (err) {
      console.error("Error al eliminar el registro:", err);
      toast.current.show({ severity: "error", summary: "Error", detail: "Ocurrió un error al eliminar el registro.", life: 3000 });
    } finally {
      setDeleteDialogVisible(false); // Ocultar el diálogo
      setMovimientoToDelete(null); // Limpiar el movimiento seleccionado
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchMovimientos();
  }, []);

  return (
    <div>
      <Toast ref={toast} /> {/* Componente Toast */}
      <Dialog
        visible={deleteDialogVisible}
        onHide={() => setDeleteDialogVisible(false)}
        header="Confirmar eliminación"
        footer={
          <div>
            <button
              onClick={() => setDeleteDialogVisible(false)}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#6c757d",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#dc3545",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Eliminar
            </button>
          </div>
        }
      >
        <p>¿Está seguro de que desea eliminar este registro?</p>
      </Dialog>
      {isUploading && (
        <div style={spinnerOverlayStyle}>
          <ProgressSpinner style={{ color: "#0D1B2A" }} /> {/* Cambiar color del spinner */}
        </div>
      )}
      <h2>Listado de movimientos</h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setShowAddForm(true)}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#0D1B2A", // Fondo verde
            color: "#fff", // Texto blanco
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Nuevo registro
        </button>
        <label
          htmlFor="csvUpload"
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#415A77", // Cambiar color del botón de carga masiva
            color: "#fff",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Carga masiva
        </label>
        <input
          id="csvUpload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        <a
          href="/plantilla.csv"
          download="plantilla.csv"
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#778DA9",
            color: "#fff",
            textDecoration: "none",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <i className="pi pi-download"></i> Descargar plantilla
        </a>
      </div>
      {showAddForm && (
        <AddCarga
          onCancel={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchMovimientos(); // Recargar movimientos
          }}
          user={user}
        />
      )}
      {selectedMovimiento && (
        <AddCarga
          onCancel={handleCloseView}
          initialData={selectedMovimiento}
          isReadOnly={true}
        />
      )}
      {errorMessage && (
        <div style={{ color: "red", marginTop: "10px" }}>
          <strong>{errorMessage}</strong>
        </div>
      )}
      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <DataTable
          value={movimientos}
          dataKey="MOV_Movimiento"
          tableStyle={{ minWidth: "50rem", marginTop: "20px" }}
          showGridlines // Habilitar líneas de división
          footer={renderFooter()}
        >
          <Column field="MOV_Movimiento" header="Numero de Movimiento" style={{ width: "15%" }}></Column>
          <Column field="MOV_id" header="Referencia" style={{ width: "15%" }}></Column>
          <Column field="MOV_Descripcion" header="Descripción" style={{ width: "20%" }}></Column>
          <Column field="CuentaBancaria" header="Cuenta Bancaria" style={{ width: "15%" }}></Column>
          <Column field="Moneda" header="Moneda" style={{ width: "10%" }}></Column>
          <Column field="TipoMovimiento" header="Tipo Movimiento" style={{ width: "10%" }}></Column>
          <Column field="NombreUsuario" header="Usuario" style={{ width: "10%" }}></Column>
          <Column
            field="MOV_Fecha_Mov"
            header="Fecha"
            body={(rowData) => formatDate(rowData.MOV_Fecha_Mov)}
            style={{ width: "10%" }}
          ></Column>
          <Column
            field="MOV_Valor_GTQ"
            header="Debe"
            body={(rowData) => (rowData.MOV_Valor_GTQ > 0 ? rowData.MOV_Valor_GTQ : "-")}
            style={{ width: "10%" }}
          ></Column>
          <Column
            field="MOV_Valor_GTQ"
            header="Haber"
            body={(rowData) => (rowData.MOV_Valor_GTQ < 0 ? Math.abs(rowData.MOV_Valor_GTQ) : "-")}
            style={{ width: "10%" }}
          ></Column>
          <Column
            body={(rowData) => (
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                  onClick={() => handleView(rowData)}
                  style={{
                    padding: "5px",
                    border: "none",
                    borderRadius: "4px",
                    backgroundColor: "#778da9", // Fondo azul claro
                    color: "#0d47a1", // Ícono azul oscuro
                    cursor: "pointer",
                  }}
                >
                  <i className="pi pi-eye"></i> {/* Ícono de ojo */}
                </button>
                <button
                  onClick={() => confirmDelete(rowData.MOV_Movimiento)}
                  style={{
                    padding: "5px",
                    border: "none",
                    borderRadius: "4px",
                    backgroundColor: "#ffebee", // Fondo rojo claro
                    color: "#b71c1c", // Ícono rojo oscuro
                    cursor: "pointer",
                  }}
                >
                  <i className="pi pi-trash"></i> {/* Ícono de eliminar */}
                </button>
              </div>
            )}
            header="Acciones"
            style={{ width: "15%" }}
          ></Column>
        </DataTable>
      )}
    </div>
  );
}

const spinnerOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(255, 255, 255, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const buttonStyle = {
  padding: "5px 10px",
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#007bff",
  color: "#fff",
  cursor: "pointer",
};

export default MovimientoResumen;