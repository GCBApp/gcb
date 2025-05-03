import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./conciliacion.css";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const Conciliacion = () => {
  const [estados, setEstados] = useState([]);
  const [filteredEstados, setFilteredEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [filterDates, setFilterDates] = useState([null, null]);
  const [filterUser, setFilterUser] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterEstado, setFilterEstado] = useState("");


  const estadoOptions = [
    { label: "EN REVISIÓN", value: "EN REVISIÓN" },
    { label: "PENDIENTE", value: "PENDIENTE" },
    { label: "CONCILIADO", value: "CONCILIADO" },
  ];

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/estado`);
        if (!res.ok) throw new Error("Error al obtener los estados.");
        const data = await res.json();
        setEstados(data);
        setFilteredEstados(data);
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener los estados:", err);
        setErrorMessage("Error al cargar los estados. Por favor, intente nuevamente.");
        setLoading(false);
      }
    };

    fetchEstados();
  }, []);

  const applyFilters = () => {
    let filtered = [...estados];

    // Filtrar por rango de fechas
    if (filterDates[0] && filterDates[1]) {
      filtered = filtered.filter((estado) => {
        const fecha = new Date(estado.MOV_Fecha_Mov);
        return fecha >= filterDates[0] && fecha <= filterDates[1];
      });
    }

    // Filtrar por nombre de usuario
    if (filterUser) {
      filtered = filtered.filter((estado) =>
        estado.NombreUsuario.toLowerCase().includes(filterUser.toLowerCase())
      );
    }

    // Filtrar por tipo de movimiento
    if (filterType) {
      filtered = filtered.filter((estado) =>
        estado.TipoMovimiento.toLowerCase().includes(filterType.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filterEstado) {
      filtered = filtered.filter((estado) => estado.EST_Descripcion === filterEstado);
    }

    setFilteredEstados(filtered);
  };

  const clearFilters = () => {
    setFilterDates([null, null]);
    setFilterUser("");
    setFilterType("");
    setFilterEstado("");
    setFilteredEstados(estados);
  };

  const toggleEstado = async (estadoId, newEstado) => {
    try {
      const res = await fetch(`${API_URL}/api/estado/${estadoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ EST_Descripcion: newEstado }),
      });
      if (!res.ok) throw new Error("Error al actualizar el estado.");

      const updatedEstados = estados.map((estado) =>
        estado.EST_Estado === estadoId ? { ...estado, EST_Descripcion: newEstado } : estado
      );
      setEstados(updatedEstados);
      setFilteredEstados(updatedEstados);
    } catch (err) {
      console.error("Error al cambiar el estado:", err);
      alert("Error al cambiar el estado. Por favor, intente nuevamente.");
    }
  };

  const handleEstadoChange = (e, rowData) => {
    const newEstado = e.value;

    toggleEstado(rowData.EST_Estado, newEstado);

    const updatedEstados = estados.map((estado) =>
      estado.EST_Estado === rowData.EST_Estado ? { ...estado, EST_Descripcion: newEstado } : estado
    );
    setEstados(updatedEstados);
    setFilteredEstados(updatedEstados);
  };

  const estadoBodyTemplate = (rowData) => {
    return (
      <Dropdown
        value={rowData.EST_Descripcion}
        options={estadoOptions}
        onChange={(e) => handleEstadoChange(e, rowData)}
        placeholder="Seleccionar estado"
        style={{ width: "100%" }}
      />
    );
  };

  // Calcular totales y diferencias
  const calculateTotals = () => {
    const totals = {
      debeMov: 0,
      haberMov: 0,
      debeComp: 0,
      haberComp: 0,
    };

    filteredEstados.forEach((estado) => {
      if (estado.MOV_Valor > 0) totals.debeMov += estado.MOV_Valor;
      if (estado.MOV_Valor < 0) totals.haberMov += Math.abs(estado.MOV_Valor);
      if (estado.COM_Valor > 0) totals.debeComp += estado.COM_Valor;
      if (estado.COM_Valor < 0) totals.haberComp += Math.abs(estado.COM_Valor);
    });

    return totals;
  };

  const totals = calculateTotals();
  const differences = {
    mov: totals.debeMov - totals.haberMov,
    comp: totals.debeComp - totals.haberComp,
  };
  const downloadResults = () => {
    let content = "\tConciliación Realizada\n";
    content += '\n';
    content += '\n';
    content += "Filtros aplicados:\n";
    content += '\n';

    content += `Rango de Fechas: ${filterDates[0] ? filterDates[0].toLocaleDateString() : "N/A"} - ${
      filterDates[1] ? filterDates[1].toLocaleDateString() : "N/A"
    }\n`;
    content += `Nombre de Usuario: ${filterUser || "N/A"}\n`;
    content += `Tipo de Movimiento: ${filterType || "N/A"}\n`;
    content += '\n';
    content += '\n';


    content += "Resultados:\n";
    content += '\n';
    filteredEstados.forEach((estado, index) => {
      content += `Registro ${index + 1}:\n`;
      content += `  Referencia: ${estado.MOV_id}\n`;
      content += `  Descripción: ${estado.MOV_Descripcion}\n`;
      content += `  Usuario: ${estado.NombreUsuario}\n`;
      content += `  Tipo de Movimiento: ${estado.TipoMovimiento}\n`;
      content += `  Fecha: ${estado.MOV_Fecha_Mov.split("T")[0]}\n`;
      content += `  Estado: ${estado.EST_Descripcion}\n`;
      content += `  DEBE (Mov): ${estado.MOV_Valor > 0 ? `$${estado.MOV_Valor.toFixed(2)}` : ""}\n`;
      content += `  HABER (Mov): ${estado.MOV_Valor < 0 ? `$${Math.abs(estado.MOV_Valor).toFixed(2)}` : ""}\n`;
      content += `  DEBE (Comp): ${estado.COM_Valor > 0 ? `$${estado.COM_Valor.toFixed(2)}` : ""}\n`;
      content += `  HABER (Comp): ${estado.COM_Valor < 0 ? `$${Math.abs(estado.COM_Valor).toFixed(2)}` : ""}\n\n`;
      content += '\n';

    });

    content += `  DEBE Subtotal en movimiento: $${totals.debeMov.toFixed(2)}\n`;
      content += `  HABER Subtotal en movimiento: $${totals.haberMov.toFixed(2)}\n`; 
      content += `  DEBE Subtotal en compensación: $${totals.debeComp.toFixed(2)}\n`;
      content += `  HABER Subtotal en compensación: $${totals.haberComp.toFixed(2)}\n\n`;
      content += `  Total 1: $${differences.mov.toFixed(2)}\n`;
      content += `  Total 2: $${differences.comp.toFixed(2)}\n`;
      content += '\n';
      content += `  ${differences.mov === differences.comp ? "Conciliación correcta" : "Error en la Conciliación"}\n`;

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Conciliación_resultante.txt";
    link.click();
  };

  return (
    <div>
      <h1>Conciliación</h1>
      <p>Parámetros para hacer la conciliación</p>

      {/* Cuadro de filtros */}
      <div className="filters" style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
        <h3>Filtros</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div>
            <label>Rango de Fechas:</label>
            <Calendar
              value={filterDates}
              onChange={(e) => setFilterDates(e.value)}
              selectionMode="range"
              placeholder="Seleccionar rango"
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Nombre de Usuario:</label>
            <InputText
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              placeholder="Buscar usuario"
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Tipo de Movimiento:</label>
            <InputText
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              placeholder="Buscar tipo"
              style={{ width: "100%" }}
            />
          </div>
          
          </div>
        <div style={{ marginTop: "10px" }}>
          <Button label="Aplicar Filtros" icon="pi pi-filter" onClick={applyFilters} className="p-button-primary" />
          <Button label="Limpiar Filtros" icon="pi pi-times" onClick={clearFilters} className="p-button-secondary" style={{ marginLeft: "10px" }} />
          <Button label="Descargar Resultados" icon="pi pi-download" onClick={downloadResults} className="p-button-success" style={{ marginLeft: "10px" }} />
        </div>
      </div>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {loading ? (
        <ProgressSpinner />
      ) : (
        <>
        <DataTable
          value={[...filteredEstados, { isTotalRow: true }, { isDifferenceRow: true }]}
          dataKey="EST_Estado"
          style={{ marginTop: "20px" }}
        >
          <Column field="MOV_id" header="Referencia" body={(rowData) => (rowData.isTotalRow || rowData.isDifferenceRow ? "" : rowData.MOV_id)} />
          <Column
            field="MOV_Descripcion"
            header=" Descripción"
            body={(rowData) =>
              rowData.isTotalRow
                ? "Subtotales:"
                : rowData.isDifferenceRow
                ? "Diferencia:"
                : rowData.MOV_Descripcion
            }
            style={{ fontWeight: "bold" }}
          />
          <Column field="NombreUsuario" header="Usuario" body={(rowData) => (rowData.isTotalRow || rowData.isDifferenceRow ? "" : rowData.NombreUsuario)} />
          <Column field="COM_Compensacion" header="Referencia de Compensación" body={(rowData) => (rowData.isTotalRow || rowData.isDifferenceRow ? "" : rowData.COM_Compensacion)} />
          <Column field="TipoMovimiento" header="Tipo de Movimiento" body={(rowData) => (rowData.isTotalRow || rowData.isDifferenceRow ? "" : rowData.TipoMovimiento)} />
          <Column
            field="MOV_Fecha_Mov"
            header="Fecha"
            body={(rowData) => (rowData.isTotalRow || rowData.isDifferenceRow ? "" : `${rowData.MOV_Fecha_Mov.split("T")[0]}`)}
          />
          <Column
            field="EST_Descripcion"
            header="Estado"
            body={(rowData) => (rowData.isTotalRow || rowData.isDifferenceRow ? "" : estadoBodyTemplate(rowData))}
            style={{ textAlign: "center" }}
          />
          <Column
            field="MOV_Valor"
            header="DEBE (Mov)"
            body={(rowData) =>
              rowData.isTotalRow
                ? `$${totals.debeMov.toFixed(2)}`
                : rowData.isDifferenceRow
                ? `$${differences.mov.toFixed(2)}`
                : rowData.MOV_Valor > 0
                ? `$${rowData.MOV_Valor.toFixed(2)}`
                : ""
            }
            style={(rowData) =>
              rowData.isDifferenceRow ? { color: "green" } : { color: "blue" }}
          />
          <Column
            field="MOV_Valor"
            header="HABER (Mov)"
            body={(rowData) =>
              rowData.isTotalRow
                ? `$${totals.haberMov.toFixed(2)}`
                : rowData.isDifferenceRow
                ? ""
                : rowData.MOV_Valor < 0
                ? `$${Math.abs(rowData.MOV_Valor).toFixed(2)}`
                : ""
            }
            style={{ color: "red" }}
          />
          <Column
            field="COM_Valor"
            header="DEBE (Comp)"
            body={(rowData) =>
              rowData.isTotalRow
                ? `$${totals.debeComp.toFixed(2)}`
                : rowData.isDifferenceRow
                ? `$${differences.comp.toFixed(2)}`
                : rowData.COM_Valor > 0
                ? `$${rowData.COM_Valor.toFixed(2)}`
                : ""
            }
            style={(rowData) =>
              rowData.isDifferenceRow ? { color: "green" } : { color: "blue" }}
          />
          <Column
            field="COM_Valor"
            header="HABER (Comp)"
            body={(rowData) =>
              rowData.isTotalRow
                ? `$${totals.haberComp.toFixed(2)}`
                : rowData.isDifferenceRow
                ? ""
                : rowData.COM_Valor < 0
                ? `$${Math.abs(rowData.COM_Valor).toFixed(2)}`
                : ""
            }
            style={{ color: "red" }}
          />
        </DataTable>
        <p
  style={{
    marginTop: "20px",
    marginRight: "50px",
    fontWeight: "bold",
    color: differences.mov === differences.comp ? "green" : "red",
    textAlign: "right", // Alinea el texto a la derecha
  }}
>
  {differences.mov === differences.comp ? "Conciliación correcta" : "Error en la Conciliación"}
</p>
      </>
      )}
    </div>
  );
};

export default Conciliacion;

