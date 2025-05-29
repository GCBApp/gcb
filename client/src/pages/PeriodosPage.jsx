import React, { useEffect, useState, useRef } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const PeriodosPage = () => {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    fetchPeriodos();
  }, []);

  const fetchPeriodos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/periodo`);
      const data = await res.json();
      setPeriodos(data);
    } catch {
      setPeriodos([]);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (periodo, nuevoEstado) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/periodo/${periodo.PER_Periodo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ PER_Estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error();
      toast.current.show({
        severity: "success",
        summary: `Periodo ${nuevoEstado === "Abierto" ? "abierto" : "cerrado"}`,
        detail: `El periodo se ha ${nuevoEstado === "Abierto" ? "abierto" : "cerrado"} correctamente.`,
        life: 3000,
      });
      fetchPeriodos();
    } catch {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `No se pudo ${nuevoEstado === "Abierto" ? "abrir" : "cerrar"} el periodo.`,
        life: 3500,
      });
    } finally {
      setLoading(false);
    }
  };

  const estadoBody = (row) => (
    <Tag
      value={row.PER_Estado}
      severity={row.PER_Estado === "Abierto" ? "success" : "warning"}
      style={{ fontSize: 13, borderRadius: 6, padding: "4px 12px" }}
    />
  );

  const accionesBody = (row) => (
    <div style={{ display: "flex", gap: 8 }}>
      <Button
        icon="pi pi-lock-open"
        className="p-button-rounded p-button-text p-button-success"
        tooltip="Abrir"
        disabled={row.PER_Estado === "Abierto" || loading}
        onClick={() => cambiarEstado(row, "Abierto")}
      />
      <Button
        icon="pi pi-lock"
        className="p-button-rounded p-button-text p-button-warning"
        tooltip="Cerrar"
        disabled={row.PER_Estado === "Cerrado" || loading}
        onClick={() => cambiarEstado(row, "Cerrado")}
      />
    </div>
  );

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const date = new Date(fechaStr);
    if (isNaN(date)) return "";
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fa", padding: "40px 0" }}>
      <Toast ref={toast} />
      <Card
        title="Gestión de Periodos"
        subTitle="Abre o cierra periodos para calcular y guardar el saldo histórico de cada cuenta."
        style={{
          maxWidth: "98vw",
          margin: "0 auto",
          borderRadius: 16,
          boxShadow: "0 2px 16px #e0e1dd",
          background: "#fff",
          width: "100%",
        }}
      >
        <DataTable
          value={periodos}
          loading={loading}
          paginator
          rows={8}
          rowsPerPageOptions={[8, 16, 32]}
          emptyMessage="No hay periodos registrados"
          style={{ fontSize: 15, borderRadius: 12, width: "100%" }}
          responsiveLayout="scroll"
          scrollable
          scrollHeight="flex"
        >
          <Column field="PER_Periodo" header="Periodo" style={{ minWidth: 120 }} />
          <Column field="PER_Descripcion" header="Descripción" style={{ minWidth: 180 }} />
          <Column field="PER_Fecha_inicio" header="Inicio" body={row => formatFecha(row.PER_Fecha_inicio)} style={{ minWidth: 120 }} />
          <Column field="PER_Fecha_final" header="Fin" body={row => formatFecha(row.PER_Fecha_final)} style={{ minWidth: 120 }} />
          <Column field="PER_Estado" header="Estado" body={estadoBody} style={{ minWidth: 110 }} />
          <Column header="Acciones" body={accionesBody} style={{ minWidth: 110, textAlign: "center" }} />
        </DataTable>
      </Card>
    </div>
  );
};

export default PeriodosPage;
