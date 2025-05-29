import React, { useState, useEffect } from "react";
import AddCarga from "../views/AddCarga";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { ProgressSpinner } from "primereact/progressspinner";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import "../views/Carga.css";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const MovementsPage = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [filteredMovimientos, setFilteredMovimientos] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: "contains" },
    CuentaBancaria: null,
    NombreUsuario: null,
    Moneda: null,
    TipoMovimiento: null,
    MOV_Fecha_Mov: null,
  });

  // Opciones para los filtros
  const [cuentas, setCuentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [estadosBackend, setEstadosBackend] = useState([]); // Estados reales de la BD

  // --- EXTRAE fetchMovimientos PARA REUTILIZAR ---
  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await fetch(`${API_URL}/api/movimiento`);
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Error al obtener los movimientos.");
      }
      const data = await res.json();
      setMovimientos(data);
      setFilteredMovimientos(data);
      setLoading(false);
      setCuentas(
        [...new Set(data.map((m) => m.CuentaBancaria).filter(Boolean))].map(
          (c) => ({ label: c, value: c })
        )
      );
      setUsuarios(
        [...new Set(data.map((m) => m.NombreUsuario).filter(Boolean))].map(
          (u) => ({ label: u, value: u })
        )
      );
      setMonedas(
        [...new Set(data.map((m) => m.Moneda).filter(Boolean))].map((mo) => ({
          label: mo,
          value: mo,
        }))
      );
      setTipos(
        [...new Set(data.map((m) => m.TipoMovimiento).filter(Boolean))].map(
          (t) => ({ label: t, value: t })
        )
      );
    } catch (err) {
      setErrorMessage("Error al cargar los movimientos: " + (err.message || ""));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovimientos();
  }, []);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const res = await fetch(`${API_URL}/api/estado`);
        if (!res.ok) throw new Error("Error al obtener los estados.");
        const data = await res.json();
        // data debe ser un array de objetos con EST_Estado y EST_Descripcion
        setEstadosBackend(data.map(e => {
          // Normalizar para comparar sin tildes, mayúsculas y espacios extras
          const descNorm = (e.EST_Descripcion || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
          let color = "#E0E1DD";
          if (descNorm === "conciliado") color = "#A3D9B1";
          else if (descNorm === "no conciliado") color = "#FFE6A7";
          else if (descNorm === "anulado") color = "#F7B2AD";
          return {
            id: e.EST_Estado,
            label: e.EST_Descripcion,
            color
          };
        }));
        setEstados(data.map(e => ({
          label: e.EST_Descripcion,
          value: e.EST_Estado
        })));
      } catch {
        setEstadosBackend([]);
        setEstados([]);
      }
    };
    fetchEstados();
  }, []); // Solo al montar

  // Filtros avanzados
  const onFilter = (e) => {
    let value = e.value;
    let name = e.target ? e.target.name : e.name;
    let _filters = { ...filters, [name]: value };
    setFilters(_filters);

    let filtered = movimientos.filter((mov) => {
      // Filtro global
      if (
        _filters.global.value &&
        !Object.values(mov).some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(_filters.global.value.toLowerCase())
        )
      ) {
        return false;
      }
      // Filtro por cuenta
      if (
        _filters.CuentaBancaria &&
        mov.CuentaBancaria !== _filters.CuentaBancaria
      )
        return false;
      // Filtro por usuario
      if (_filters.NombreUsuario && mov.NombreUsuario !== _filters.NombreUsuario)
        return false;
      // Filtro por moneda
      if (_filters.Moneda && mov.Moneda !== _filters.Moneda) return false;
      // Filtro por tipo
      if (_filters.TipoMovimiento && mov.TipoMovimiento !== _filters.TipoMovimiento)
        return false;
      // Filtro por fecha (rango)
      if (_filters.MOV_Fecha_Mov && _filters.MOV_Fecha_Mov.length === 2) {
        const movDate = new Date(mov.MOV_Fecha_Mov.split("T")[0]);
        const [start, end] = _filters.MOV_Fecha_Mov;
        if (start && movDate < start) return false;
        if (end && movDate > end) return false;
      }
      // Filtro por estado
      if (_filters.EST_Id && mov.EST_Id !== _filters.EST_Id) return false;
      return true;
    });
    setFilteredMovimientos(filtered);
  };

  const clearFilters = () => {
    setFilters({
      global: { value: null, matchMode: "contains" },
      CuentaBancaria: null,
      NombreUsuario: null,
      Moneda: null,
      TipoMovimiento: null,
      MOV_Fecha_Mov: null,
    });
    setFilteredMovimientos(movimientos);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  // Formatear moneda
  const formatCurrency = (value, currency = "GTQ") => {
    if (isNaN(value)) return "-";
    return new Intl.NumberFormat("es-GT", { style: "currency", currency }).format(
      value
    );
  };

  // Columnas para la tabla principal
  const columns = [
    { field: "MOV_Movimiento", header: "ID" },
    { field: "MOV_id", header: "REFERENCIA" },
    { field: "CuentaBancaria", header: "CUENTA BANCARIA" },
    { field: "TipoMovimiento", header: "TIPO MOVIMIENTO" },
    { field: "EST_Descripcion", header: "ESTADO" },
    { field: "MOV_Fecha_Mov", header: "FECHA DOCUMENTO" },
    { field: "MOV_Fecha_Registro", header: "FECHA REGISTRO" },
    { field: "MOV_Descripcion", header: "DESCRIPCION" },
    { field: "Moneda", header: "MONEDA" },
    { field: "MOV_Valor", header: "MONTO" },
    { field: "MOV_Valor_GTQ", header: "MONTO GTQ" },
    { field: "NombreUsuario", header: "USUARIO" },
    { field: "MOV_Periodo", header: "PERIODO" },
    { field: "MOV_Saldo_General", header: "SALDO GENERAL" },
  ];

  // Devuelve el meta de estado, pero si no existe, busca por descripción ignorando tildes y mayúsculas
  const normalizar = (str) => str?.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
  const getEstadoMeta = (id, descripcionFallback) => {
    let meta = estadosBackend.find(e => e.id === id);
    if (meta) return meta;
    // Buscar por descripción normalizada
    if (descripcionFallback) {
      const descNorm = normalizar(descripcionFallback);
      meta = estadosBackend.find(e => normalizar(e.label) === descNorm);
      if (meta) return meta;
      // Si hay descripción pero no está mapeada, usar color de advertencia
      if (descripcionFallback !== 'Desconocido' && descripcionFallback !== 'Pendiente') {
        console.warn('Estado no mapeado:', descripcionFallback, 'ID:', id);
        return { label: descripcionFallback, color: '#FFD580' }; // Naranja pastel
      }
    }
    return { label: 'Desconocido', color: '#E0E1DD' };
  };

  const [estadoDialog, setEstadoDialog] = useState({ visible: false, movimiento: null, selected: null });
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [movimientoToDelete, setMovimientoToDelete] = useState(null);

  const handleEstadoDialogOpen = (movimiento) => {
    setEstadoDialog({ visible: true, movimiento, selected: movimiento.EST_Id });
  };

  const handleEstadoDialogSave = async () => {
    const { movimiento, selected } = estadoDialog;
    try {
      const res = await fetch(`${API_URL}/api/movimiento/estado/${movimiento.MOV_Movimiento}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevoEstado: selected })
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Error al actualizar estado en la base de datos");
      }
      setMovimientos(prev =>
        prev.map(m =>
          m.MOV_Movimiento === movimiento.MOV_Movimiento
            ? { ...m, EST_Id: selected, EST_Descripcion: getEstadoMeta(selected).label }
            : m
        )
      );
      setFilteredMovimientos(prev =>
        prev.map(m =>
          m.MOV_Movimiento === movimiento.MOV_Movimiento
            ? { ...m, EST_Id: selected, EST_Descripcion: getEstadoMeta(selected).label }
            : m
        )
      );
      setEstadoDialog({ visible: false, movimiento: null, selected: null });
    } catch (err) {
      alert("Error al cambiar el estado: " + (err.message || ""));
    }
  };

  // Cambia el estado al siguiente en la lista y actualiza en backend y frontend
  const handleEstadoDobleClick = async (movimiento) => {
    const idx = estadoOptions.findIndex(e => e.id === movimiento.EST_Id);
    const nextIdx = (idx + 1) % estadoOptions.length;
    const nextEstado = estadoOptions[nextIdx];

    try {
      await fetch(`${API_URL}/api/movimiento/estado/${movimiento.MOV_Movimiento}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevoEstado: nextEstado.id })
      });
      // Actualiza el frontend localmente
      setMovimientos(prev =>
        prev.map(m =>
          m.MOV_Movimiento === movimiento.MOV_Movimiento
            ? { ...m, EST_Id: nextEstado.id, EST_Descripcion: nextEstado.label }
            : m
        )
      );
      setFilteredMovimientos(prev =>
        prev.map(m =>
          m.MOV_Movimiento === movimiento.MOV_Movimiento
            ? { ...m, EST_Id: nextEstado.id, EST_Descripcion: nextEstado.label }
            : m
        )
      );
    } catch (err) {
      alert("Error al cambiar el estado");
    }
  };

  // Función para ver detalles
  const handleView = (movimiento) => {
    setSelectedMovimiento(movimiento);
    setShowViewDialog(true);
  };

  // Función para cerrar el modal de detalles
  const handleCloseView = () => {
    setSelectedMovimiento(null);
    setShowViewDialog(false);
  };

  // Función para confirmar borrado
  const confirmDelete = (movimientoId) => {
    setMovimientoToDelete(movimientoId);
    setDeleteDialogVisible(true);
  };

  // Función para eliminar el movimiento
  const handleDelete = async () => {
    if (!movimientoToDelete) return;
    try {
      const res = await fetch(`${API_URL}/api/movimiento/${movimientoToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setMovimientos(prev => prev.filter(m => m.MOV_Movimiento !== movimientoToDelete));
        setFilteredMovimientos(prev => prev.filter(m => m.MOV_Movimiento !== movimientoToDelete));
      }
    } catch (err) {
      alert("Error al eliminar el movimiento");
    } finally {
      setDeleteDialogVisible(false);
      setMovimientoToDelete(null);
    }
  };

  // Diccionario para mostrar nombres amigables en la vista detalle
  const fieldLabels = {
    MOV_Movimiento: "ID Movimiento",
    MOV_id: "Referencia",
    NombreUsuario: "Usuario",
    Moneda: "Moneda",
    TipoMovimiento: "Tipo de Movimiento",
    CuentaBancaria: "Cuenta Bancaria",
    EST_Id: "ID Estado",
    EST_Descripcion: "Estado",
    MOV_Descripcion: "Descripción",
    MOV_Fecha_Mov: "Fecha de Movimiento",
    MOV_Fecha_Registro: "Fecha de Registro",
    MOV_Valor: "Monto",
    MOV_Tipo_Cambio: "Tipo de Cambio",
    MOV_Valor_GTQ: "Monto GTQ",
    // Agrega aquí más campos si aparecen nuevos
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fa", padding: "40px 0" }}>
      <Card
        title="Movimientos"
        subTitle="Consulta y administración de movimientos bancarios"
        style={{
          maxWidth: "98vw",
          margin: "0 auto",
          borderRadius: 16,
          boxShadow: "0 2px 16px #e0e1dd",
          background: "#fff",
          marginBottom: 32,
          width: "100%",
        }}
      >
        <div className="action-bar" style={{ marginBottom: 18 }}>
          <button className="btn-primary" onClick={() => setShowAddForm(true)}>
            <i className="pi pi-plus" style={{ marginRight: "8px" }}></i> Nuevo movimiento
          </button>
        </div>
        {/* Filtros avanzados */}
        <div style={{ marginBottom: 18 }}>
          <InputText
            name="global"
            value={filters.global.value || ""}
            onChange={(e) => onFilter({ name: "global", value: e.target.value })}
            placeholder="Buscar en todo..."
            style={{ minWidth: 180, marginRight: 8 }}
          />
          <Dropdown
            value={filters.CuentaBancaria}
            options={cuentas}
            onChange={(e) => onFilter({ name: "CuentaBancaria", value: e.value })}
            placeholder="Cuenta bancaria"
            style={{ minWidth: 160, marginRight: 8 }}
            showClear
          />
          <Dropdown
            value={filters.NombreUsuario}
            options={usuarios}
            onChange={(e) => onFilter({ name: "NombreUsuario", value: e.value })}
            placeholder="Usuario"
            style={{ minWidth: 140, marginRight: 8 }}
            showClear
          />
          <Dropdown
            value={filters.Moneda}
            options={monedas}
            onChange={(e) => onFilter({ name: "Moneda", value: e.value })}
            placeholder="Moneda"
            style={{ minWidth: 120, marginRight: 8 }}
            showClear
          />
          <Dropdown
            value={filters.TipoMovimiento}
            options={tipos}
            onChange={(e) => onFilter({ name: "TipoMovimiento", value: e.value })}
            placeholder="Tipo"
            style={{ minWidth: 120, marginRight: 8 }}
            showClear
          />
          <Calendar
            value={filters.MOV_Fecha_Mov}
            onChange={(e) => onFilter({ name: "MOV_Fecha_Mov", value: e.value })}
            selectionMode="range"
            placeholder="Rango de fechas"
            dateFormat="dd/mm/yy"
            style={{ minWidth: 180, marginRight: 8 }}
            showIcon
            showButtonBar
          />
          <Dropdown
            value={filters.EST_Id}
            options={estados}
            onChange={(e) => onFilter({ name: "EST_Id", value: e.value })}
            placeholder="Estado"
            style={{ minWidth: 140, marginRight: 8 }}
            showClear
          />
          <button className="btn-secondary" style={{ marginLeft: 8 }} onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
        {errorMessage && (
          <div className="error-message">
            <i className="pi pi-exclamation-circle" style={{ marginRight: "8px" }}></i>
            {errorMessage}
          </div>
        )}
        {loading ? (
          <div className="loading-container">
            <ProgressSpinner style={{ width: "40px", height: "40px" }} strokeWidth="4" fill="#E0E1DD" animationDuration=".5s" />
            <p>Cargando movimientos...</p>
          </div>
        ) : (
          <DataTable
            value={filteredMovimientos}
            dataKey="MOV_Movimiento"
            showGridlines
            paginator
            rows={10}
            rowsPerPageOptions={[10, 20, 50]}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
            emptyMessage="No se encontraron movimientos"
            responsiveLayout="scroll"
            style={{ fontSize: 15, borderRadius: 12, width: "100%" }}
            className="modern-table"
            scrollable
            scrollHeight="flex"
          >
            <Column field="MOV_Movimiento" header="ID" sortable style={{ minWidth: 120 }} />
            <Column field="MOV_id" header="REFERENCIA" sortable style={{ minWidth: 120 }} />
            <Column field="CuentaBancaria" header="CUENTA BANCARIA" sortable style={{ minWidth: 160 }} />
            <Column field="TipoMovimiento" header="TIPO MOVIMIENTO" sortable style={{ minWidth: 120 }} />
            <Column
              field="EST_Descripcion"
              header="ESTADO"
              body={(rowData) => {
                // Normalizar el texto visual del estado
                const descNorm = (rowData.EST_Descripcion || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
                let color = "#E0E1DD";
                if (descNorm === "conciliado") color = "#A3D9B1";
                else if (descNorm === "no conciliado") color = "#FFE6A7";
                else if (descNorm === "anulado") color = "#F7B2AD";
                return (
                  <Tag
                    value={rowData.EST_Descripcion}
                    style={{
                      background: color,
                      color: "#444",
                      borderRadius: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      border: "none",
                      padding: "6px 18px",
                      fontSize: 15,
                      letterSpacing: 0.2,
                      minWidth: 90,
                      textAlign: "center",
                      boxShadow: "0 1px 4px #e0e1dd"
                    }}
                    onDoubleClick={() => handleEstadoDialogOpen(rowData)}
                    title="Doble clic para cambiar estado"
                  />
                );
              }}
              sortable
              style={{ minWidth: 120, textAlign: "center" }}
            />
            <Column field="MOV_Fecha_Mov" header="FECHA DOCUMENTO" body={rowData => formatDate(rowData.MOV_Fecha_Mov)} sortable style={{ minWidth: 120 }} />
            <Column field="MOV_Fecha_Registro" header="FECHA REGISTRO" body={rowData => formatDate(rowData.MOV_Fecha_Registro)} sortable style={{ minWidth: 120 }} />
            <Column field="MOV_Descripcion" header="DESCRIPCION" sortable style={{ minWidth: 200 }} />
            <Column field="Moneda" header="MONEDA" sortable style={{ minWidth: 100 }} />
            <Column field="MOV_Valor" header="MONTO" body={rowData => formatCurrency(rowData.MOV_Valor, rowData.Moneda === "Desconocido" ? "GTQ" : rowData.Moneda)} sortable style={{ minWidth: 140 }} />
            <Column field="MOV_Valor_GTQ" header="MONTO GTQ" body={rowData => formatCurrency(rowData.MOV_Valor_GTQ, "GTQ")} sortable style={{ minWidth: 140 }} />
            <Column field="NombreUsuario" header="USUARIO" sortable style={{ minWidth: 140 }} />
            {/* Elimina la columna de periodo */}
            {/* <Column field="PER_Periodo" header="PERIODO" sortable style={{ minWidth: 120 }} /> */}
            {/* ...acciones... */}
            <Column
              body={rowData => (
                <div className="action-buttons" style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button
                    className="btn-view"
                    title="Ver detalles"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                    onClick={() => handleView(rowData)}
                  >
                    <i className="pi pi-eye" style={{ fontSize: 18, color: "#415A77" }}></i>
                  </button>
                  <button
                    className="btn-delete"
                    title="Eliminar movimiento"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                    onClick={() => confirmDelete(rowData.MOV_Movimiento)}
                  >
                    <i className="pi pi-times" style={{ fontSize: 18, color: "#D90429" }}></i>
                  </button>
                </div>
              )}
              header="Acciones"
              style={{ width: "100px", textAlign: "center" }}
              frozen
              alignFrozen="right"
            />
          </DataTable>
        )}
        {showAddForm && (
          <AddCarga
            onCancel={() => setShowAddForm(false)}
            onSuccess={() => {
              setShowAddForm(false);
              fetchMovimientos();
            }}
          />
        )}
        {/* 
          Asegúrate de que NO haya ningún renderizado de:
          - AddCompensacion
          - AddCompensación
          - Cualquier otro formulario de compensación
          - Cualquier modal con título "Nueva Compensación"
        */}
        {/* Modal para cambiar estado */}
        <Dialog
          header="Cambiar estado"
          visible={estadoDialog.visible}
          style={{ width: "340px" }}
          modal
          onHide={() => setEstadoDialog({ visible: false, movimiento: null, selected: null })}
          footer={null}
        >
          {estadoDialog.movimiento && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
              <span style={{ fontWeight: 500, marginBottom: 8 }}>Selecciona el nuevo estado:</span>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                {estadosBackend.map(e => (
                  <button
                    key={e.id}
                    onClick={() => setEstadoDialog(s => ({ ...s, selected: e.id }))}
                    style={{
                      background: e.color,
                      color: "#222",
                      border: estadoDialog.selected === e.id ? "2.5px solid #415A77" : "1.5px solid #e0e1dd",
                      borderRadius: 12,
                      fontWeight: 600,
                      fontSize: 15,
                      padding: "10px 18px",
                      minWidth: 90,
                      cursor: "pointer",
                      boxShadow: estadoDialog.selected === e.id ? "0 2px 8px #e0e1dd" : "none",
                      outline: "none",
                      transition: "border 0.2s, box-shadow 0.2s"
                    }}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button
                  className="btn-secondary"
                  style={{ padding: "8px 22px" }}
                  onClick={() => setEstadoDialog({ visible: false, movimiento: null, selected: null })}
                >
                  Cancelar
                </button>
                <button
                  className="btn-primary"
                  style={{ padding: "8px 22px" }}
                  disabled={!estadoDialog.selected || estadoDialog.selected === estadoDialog.movimiento?.EST_Id}
                  onClick={handleEstadoDialogSave}
                >
                  Guardar
                </button>
              </div>
            </div>
          )}
        </Dialog>
        {/* Modal para ver detalles del movimiento */}
        <Dialog
          header="Detalle del movimiento"
          visible={showViewDialog}
          style={{ width: "480px" }}
          modal
          onHide={handleCloseView}
          footer={null}
        >
          {selectedMovimiento && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(selectedMovimiento).map(([key, value]) => {
                let displayValue = value;
                if (key === "MOV_Fecha_Mov" || key === "MOV_Fecha_Registro") {
                  // Formato dd/mm/yyyy
                  if (typeof value === "string" && value.includes("T")) {
                    const [year, month, day] = value.split("T")[0].split("-");
                    displayValue = `${day}/${month}/${year}`;
                  }
                }
                if (key === "EST_Descripcion" && value && value !== "Desconocido" && value !== "Pendiente") {
                  displayValue = value;
                }
                return (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", padding: "4px 0" }}>
                    <span style={{ fontWeight: 500, color: "#415A77" }}>{fieldLabels[key] || key}</span>
                    <span style={{ color: "#222" }}>{String(displayValue)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Dialog>
        {/* Modal de confirmación de borrado */}
        <Dialog
          header="¿Eliminar movimiento?"
          visible={deleteDialogVisible}
          style={{ width: "340px" }}
          modal
          onHide={() => setDeleteDialogVisible(false)}
          footer={null}
        >
          <div style={{ textAlign: "center", margin: 0, padding: 0 }}>
            <p style={{ fontWeight: 600, fontSize: 18, color: "#D90429", margin: "18px 0 24px 0" }}>
              ¿Estás seguro de que deseas eliminar este movimiento?
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 18, margin: 0, padding: 0 }}>
              <button
                className="btn-secondary"
                onClick={() => setDeleteDialogVisible(false)}
                style={{
                  padding: "10px 32px",
                  borderRadius: 8,
                  border: "2px solid #778DA9",
                  background: "#fff",
                  color: "#415A77",
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: "none",
                  transition: "background 0.2s, color 0.2s, border 0.2s"
                }}
              >
                Cancelar
              </button>
              <button
                className="btn-delete"
                onClick={handleDelete}
                style={{
                  padding: "10px 32px",
                  borderRadius: 8,
                  border: "2px solid #D90429",
                  background: "#fff",
                  color: "#D90429",
                  fontWeight: 700,
                  fontSize: 16,
                  minWidth: 120,
                  minHeight: 48,
                  boxShadow: "none",
                  transition: "background 0.2s, color 0.2s, border 0.2s"
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </Dialog>
      </Card>
    </div>
  );
};

export default MovementsPage;
