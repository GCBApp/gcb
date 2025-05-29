// ESTE ARCHIVO ESTÁ DEPRECADO. Toda la lógica y referencias de movimientos deben ir a pages/MovementsPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog"; // Importar el componente Dialog de PrimeReact
import Papa from "papaparse"; // Librería para procesar CSV
import { Toast } from "primereact/toast"; // Importar Toast de PrimeReact
import { ProgressSpinner } from "primereact/progressspinner"; // Importar ProgressSpinner de PrimeReact
import "./Carga.css"; // Importar el archivo CSS personalizado
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";

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
  const [cuentas, setCuentas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [formData, setFormData] = useState({
    MOV_Descripcion: "",
    MOV_Valor: null,
    MOV_Tipo: "",
    CUB_Cuentabancaria: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
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
          // "ID Movimiento": "MOV_Movimiento", // Eliminado porque ahora es automático
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

        try {
          // Enviar todos los registros al backend en paralelo
          const uploadPromises = mappedData.map((record) =>
            fetch(`${API_URL}/api/movimiento`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record),
            })
          );

          const responses = await Promise.all(uploadPromises);

          // Verificar si hubo errores en alguna de las solicitudes
          const failedUploads = responses.filter((res) => !res.ok);
          if (failedUploads.length > 0) {
            console.error("Algunos registros no se pudieron cargar:", failedUploads);
            toast.current.show({
              severity: "warn",
              summary: "Carga incompleta",
              detail: `${failedUploads.length} registros no se pudieron cargar.`,
              life: 4000,
            });
          } else {
            toast.current.show({
              severity: "success",
              summary: "Completado",
              detail: "Carga masiva finalizada exitosamente.",
              life: 3000,
            });
          }
        } catch (err) {
          console.error("Error al procesar la carga masiva:", err);
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Ocurrió un error al procesar la carga masiva.",
            life: 4000,
          });
        } finally {
          setIsUploading(false); // Ocultar spinner
          fetchMovimientos(); // Recargar movimientos después de la carga masiva
        }
      },
      error: (err) => {
        console.error("Error al procesar el archivo CSV:", err);
        setIsUploading(false); // Ocultar spinner
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Error al procesar el archivo CSV.",
          life: 3000,
        });
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

  // Obtener cuentas y tipos para el formulario
  useEffect(() => {
    const fetchCuentas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cuentasBancarias`);
        const data = await res.json();
        setCuentas(Array.isArray(data) ? data : []);
      } catch {
        setCuentas([]);
      }
    };
    const fetchTipos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tipoMovimiento`);
        const data = await res.json();
        setTipos(Array.isArray(data) ? data : []);
      } catch {
        setTipos([]);
      }
    };
    fetchCuentas();
    fetchTipos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    setFormData((prev) => ({ ...prev, MOV_Valor: e.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.MOV_Descripcion || !formData.MOV_Valor || !formData.MOV_Tipo || !formData.CUB_Cuentabancaria) {
      toast.current.show({ severity: "warn", summary: "Campos requeridos", detail: "Todos los campos son obligatorios.", life: 3000 });
      return;
    }
    setShowConfirm(true);
  };

  const confirmarEnvio = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/movimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.current.show({ severity: "success", summary: "Movimiento creado", detail: "El movimiento fue registrado correctamente.", life: 2000 });
        setTimeout(() => onSuccess && onSuccess(), 1200);
      } else {
        const errorText = await res.text();
        toast.current.show({ severity: "error", summary: "Error", detail: errorText, life: 3500 });
      }
    } catch {
      toast.current.show({ severity: "error", summary: "Error", detail: "Error al registrar el movimiento.", life: 3500 });
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <Toast ref={toast} />
      
      {/* Modal de confirmación de eliminación */}
      <Dialog
        visible={deleteDialogVisible}
        onHide={() => setDeleteDialogVisible(false)}
        header="Confirmar eliminación"
        style={{ width: "400px", borderRadius: "8px", overflow: "hidden" }}
        headerClassName="dialog-header"
        contentClassName="dialog-content"
        footer={
          <div className="dialog-footer">
            <button
              onClick={() => setDeleteDialogVisible(false)}
              className="btn-cancel"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="btn-delete-confirm"
            >
              Eliminar
            </button>
          </div>
        }
      >
        <p className="dialog-text">¿Está seguro de que desea eliminar este registro?</p>
      </Dialog>
      
      {/* Dialogo de confirmación para registro */}
      <Dialog
        header="Confirmar registro"
        visible={showConfirm}
        style={{ width: "350px" }}
        modal
        onHide={() => setShowConfirm(false)}
        footer={
          <div>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setShowConfirm(false)} />
            <Button label="Registrar" icon="pi pi-check" className="p-button-success" onClick={confirmarEnvio} loading={loading} />
          </div>
        }
      >
        <span>
          ¿Está seguro que desea registrar este movimiento?
        </span>
      </Dialog>
      
      {/* Overlay de carga */}
      {isUploading && (
        <div className="spinner-overlay">
          <div className="spinner-container">
            <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="#E0E1DD" animationDuration=".5s" />
            <p className="spinner-text">Procesando archivo...</p>
          </div>
        </div>
      )}
      
      {/* Cabecera de la página */}
      <div className="header">
        <h1 className="title">Gestión de Movimientos</h1>
        <p className="subtitle">Consulta y administración de registros financieros</p>
      </div>
      
      {/* Barra de acciones */}
      <div className="action-bar">
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          <i className="pi pi-plus" style={{marginRight: '8px'}}></i>
          Nuevo registro
        </button>
        <label
          htmlFor="csvUpload"
          className="btn-secondary"
        >
          <i className="pi pi-upload" style={{marginRight: '8px'}}></i>
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
          className="btn-tertiary"
        >
          <i className="pi pi-download" style={{marginRight: '8px'}}></i>
          Descargar plantilla
        </a>
      </div>
      
      {/* Mensaje de error */}
      {errorMessage && (
        <div className="error-message">
          <i className="pi pi-exclamation-circle" style={{marginRight: '8px'}}></i>
          {errorMessage}
        </div>
      )}
      
      {/* Contenedor de la tabla */}
      <div className="table-container">
        {loading ? (
          <div className="loading-container">
            <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="4" fill="#E0E1DD" animationDuration=".5s" />
            <p>Cargando datos...</p>
          </div>
        ) : (
          <DataTable
            value={movimientos}
            dataKey="MOV_Movimiento"
            showGridlines
            footer={() => (
              <div className="table-footer">
                <span>Total Debe: <strong className="valor-positivo">
                  {new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(totalDebe)}
                </strong></span> 
                <span>Total Haber: <strong className="valor-negativo">
                  {new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(totalHaber)}
                </strong></span>
              </div>
            )}
            emptyMessage="No se encontraron movimientos"
            rowHover
            paginator
            rows={8}
            rowsPerPageOptions={[8, 16, 32]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
          >
            <Column field="MOV_Movimiento" header="# Movimiento" sortable></Column>
            <Column field="MOV_id" header="Referencia" sortable></Column>
            <Column field="MOV_Descripcion" header="Descripción" sortable style={{width: '20%'}}></Column>
            <Column field="CuentaBancaria" header="Cuenta Bancaria"></Column>
            <Column field="Moneda" header="Moneda"></Column>
            <Column field="TipoMovimiento" header="Tipo"></Column>
            <Column field="NombreUsuario" header="Usuario"></Column>
            <Column
              field="MOV_Fecha_Mov"
              header="Fecha"
              body={(rowData) => formatDate(rowData.MOV_Fecha_Mov)}
              sortable
            ></Column>
            <Column
              field="MOV_Valor_GTQ"
              header="Debe"
              body={(rowData) => rowData.MOV_Valor_GTQ > 0 ? (
                <span className="valor-positivo">
                  {new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(rowData.MOV_Valor_GTQ)}
                </span>
              ) : "-"}
              sortable
            ></Column>
            <Column
              field="MOV_Valor_GTQ"
              header="Haber"
              body={(rowData) => rowData.MOV_Valor_GTQ < 0 ? (
                <span className="valor-negativo">
                  {new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(Math.abs(rowData.MOV_Valor_GTQ))}
                </span>
              ) : "-"}
              sortable
            ></Column>
            <Column
              body={(rowData) => (
                <div className="action-buttons">
                  <button
                    onClick={() => handleView(rowData)}
                    className="btn-view"
                    title="Ver detalle"
                  >
                    <i className="pi pi-eye"></i>
                  </button>
                  <button
                    onClick={() => confirmDelete(rowData.MOV_Movimiento)}
                    className="btn-delete"
                    title="Eliminar registro"
                  >
                    <i className="pi pi-trash"></i>
                  </button>
                </div>
              )}
              header="Acciones"
              style={{width: '100px', textAlign: 'center'}}
              frozen
              alignFrozen="right"
            ></Column>
          </DataTable>
        )}
      </div>
      
      {/* Formulario de registro */}
      {showAddForm && (
        <div className="form-overlay">
          <div className="form-container">
            <Card
              title="Registrar Movimiento"
              style={{
                width: "100%",
                maxWidth: 420,
                borderRadius: 16,
                boxShadow: "0 2px 16px #e0e1dd",
                background: "#fff",
              }}
            >
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className="p-field" style={{ marginBottom: 18 }}>
                  <label htmlFor="MOV_Descripcion" style={{ fontWeight: 600, color: "#1B263B" }}>Descripción</label>
                  <InputText
                    id="MOV_Descripcion"
                    name="MOV_Descripcion"
                    value={formData.MOV_Descripcion}
                    onChange={handleChange}
                    placeholder="Descripción del movimiento"
                    style={{ width: "100%" }}
                    autoFocus
                  />
                </div>
                <div className="p-field" style={{ marginBottom: 18 }}>
                  <label htmlFor="MOV_Valor" style={{ fontWeight: 600, color: "#1B263B" }}>Valor</label>
                  <InputNumber
                    id="MOV_Valor"
                    name="MOV_Valor"
                    value={formData.MOV_Valor}
                    onValueChange={handleNumberChange}
                    mode="decimal"
                    min={0}
                    step={0.01}
                    showButtons
                    placeholder="Valor"
                    style={{ width: "100%" }}
                    inputStyle={{ width: "100%" }}
                  />
                </div>
                <div className="p-field" style={{ marginBottom: 18 }}>
                  <label htmlFor="MOV_Tipo" style={{ fontWeight: 600, color: "#1B263B" }}>Tipo de Movimiento</label>
                  <Dropdown
                    id="MOV_Tipo"
                    name="MOV_Tipo"
                    value={formData.MOV_Tipo}
                    options={tipos.map(tipo => ({
                      label: tipo.TM_descripcion || tipo.TM_Tipomovimiento,
                      value: tipo.TM_Tipomovimiento
                    }))}
                    onChange={handleChange}
                    placeholder="Seleccione tipo de movimiento"
                    style={{ width: "100%" }}
                    showClear
                  />
                </div>
                <div className="p-field" style={{ marginBottom: 18 }}>
                  <label htmlFor="CUB_Cuentabancaria" style={{ fontWeight: 600, color: "#1B263B" }}>Cuenta Bancaria</label>
                  <Dropdown
                    id="CUB_Cuentabancaria"
                    name="CUB_Cuentabancaria"
                    value={formData.CUB_Cuentabancaria}
                    options={cuentas.map(cuenta => ({
                      label: cuenta.CUB_Nombre || cuenta.CUB_Cuentabancaria,
                      value: cuenta.CUB_Cuentabancaria
                    }))}
                    onChange={handleChange}
                    placeholder="Seleccione una cuenta"
                    style={{ width: "100%" }}
                    showClear
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 18 }}>
                  <Button type="button" label="Cancelar" className="p-button-secondary" onClick={() => setShowAddForm(false)} disabled={loading} />
                  <Button type="submit" label="Registrar" className="p-button-success" loading={loading} />
                </div>
              </form>
            </Card>
          </div>
        </div>
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