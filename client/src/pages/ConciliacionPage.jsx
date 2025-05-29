import React, { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const LOGO_URL = "/src/assets/logo.png";

const estadosOrden = ["conciliado", "no conciliado", "anulado"];

function normalizarEstado(str) {
  return (str || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

const ConciliacionPage = () => {
  const [mes, setMes] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch movimientos al cambiar mes
  useEffect(() => {
    if (!mes) return;
    const fetchMovs = async () => {
      setLoading(true);
      const y = mes.getFullYear();
      const m = (mes.getMonth() + 1).toString().padStart(2, "0");
      try {
        const res = await fetch(`${API_URL}/api/movimiento?periodo=${y}-${m}`);
        const data = await res.json();
        setMovimientos(data);
      } catch {
        setMovimientos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovs();
  }, [mes]);

  // Agrupa movimientos por estado
  const movimientosPorGrupo = () => {
    const grupos = { conciliado: [], "no conciliado": [], anulado: [], otros: [] };
    movimientos.forEach(mov => {
      const norm = normalizarEstado(mov.EST_Descripcion);
      if (grupos[norm]) grupos[norm].push(mov);
      else grupos.otros.push(mov);
    });
    return grupos;
  };

  // Generar PDF agrupado
  const grupoColors = {
    conciliado: { title: [46, 125, 50], head: [232, 245, 233] }, // verde
    "no conciliado": { title: [249, 168, 37], head: [255, 249, 196] }, // amarillo
    anulado: { title: [198, 40, 40], head: [255, 235, 238] }, // rojo
    otros: { title: [136, 136, 136], head: [238, 238, 238] } // gris
  };
  const exportPDF = async () => {
    const doc = new jsPDF();
    const img = new window.Image();
    img.src = LOGO_URL;
    await new Promise(res => { img.onload = res; });
    doc.addImage(img, "PNG", 10, 8, 32, 16);
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text("Reporte de Conciliación", 55, 18);
    if (mes) {
      const mesStr = mes.toLocaleString("es-ES", { month: "long", year: "numeric" });
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text(`Mes: ${mesStr.charAt(0).toUpperCase() + mesStr.slice(1)}`, 55, 26);
    }
    let y = 32;
    const grupos = movimientosPorGrupo();
    for (const key of ["conciliado", "no conciliado", "anulado", "otros"]) {
      if (!grupos[key].length) continue;
      // Colorear título de sección
      const color = grupoColors[key]?.title || [136, 136, 136];
      doc.setFontSize(13);
      doc.setTextColor(...color);
      doc.text(key.charAt(0).toUpperCase() + key.slice(1), 10, y);
      y += 6;
      autoTable(doc, {
        startY: y,
        head: [["ID", "Referencia", "Cuenta", "Tipo", "Estado", "Fecha", "Monto", "Saldo"]],
        body: grupos[key].map(mov => [
          mov.MOV_Movimiento,
          mov.MOV_id,
          mov.CuentaBancaria,
          mov.TipoMovimiento,
          mov.EST_Descripcion,
          mov.MOV_Fecha_Mov ? mov.MOV_Fecha_Mov.split("T")[0] : "",
          mov.MOV_Valor,
          mov.MOV_Saldo_General ?? ""
        ]),
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: {
          fillColor: grupoColors[key]?.head || [238, 238, 238],
          textColor: color,
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [250,250,250] },
        margin: { left: 10, right: 10 }
      });
      y = doc.lastAutoTable.finalY + 8;
    }
    doc.save("conciliacion.pdf");
  };

  return (
    <section className="conciliacion-page container">
      <div className="header">
        <h1>Vista de conciliación</h1>
        <p>Seleccione un mes para ver los movimientos conciliados, no conciliados y anulados.</p>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
        <Calendar
          value={mes}
          onChange={e => setMes(e.value)}
          view="month"
          dateFormat="mm/yy"
          showIcon
          placeholder="Seleccionar mes"
          style={{ minWidth: 160 }}
        />
        <Button
          label="Exportar PDF"
          icon="pi pi-file-pdf"
          className="p-button-danger"
          onClick={exportPDF}
          disabled={!movimientos.length}
        />
      </div>
      {/* Mostrar cada grupo por separado */}
      {Object.entries(movimientosPorGrupo()).map(([grupo, lista]) => (
        lista.length ? (
          <div key={grupo} style={{ marginBottom: 24 }}>
            <h3 style={{ color: grupo === "conciliado" ? "#2e7d32" : grupo === "no conciliado" ? "#f9a825" : grupo === "anulado" ? "#c62828" : "#888", marginBottom: 8 }}>
              {grupo.charAt(0).toUpperCase() + grupo.slice(1)}
            </h3>
            <DataTable
              value={lista}
              loading={loading}
              emptyMessage={`No hay movimientos en el grupo "${grupo}".`}
              showGridlines
              responsiveLayout="scroll"
              style={{ minWidth: "100%", fontSize: 15, background: "#F7F7F7" }}
              className="modern-table"
            >
              <Column field="MOV_Movimiento" header="ID" style={{ minWidth: 80 }} />
              <Column field="MOV_id" header="Referencia" style={{ minWidth: 100 }} />
              <Column field="CuentaBancaria" header="Cuenta Bancaria" style={{ minWidth: 120 }} />
              <Column field="TipoMovimiento" header="Tipo Movimiento" style={{ minWidth: 100 }} />
              <Column field="EST_Descripcion" header="Estado" style={{ minWidth: 100 }} />
              <Column field="MOV_Fecha_Mov" header="Fecha" body={row => row.MOV_Fecha_Mov ? row.MOV_Fecha_Mov.split("T")[0] : ""} style={{ minWidth: 100 }} />
              <Column field="MOV_Valor" header="Monto" style={{ minWidth: 100 }} />
              <Column field="MOV_Saldo_General" header="Saldo" style={{ minWidth: 100 }} />
            </DataTable>
          </div>
        ) : null
      ))}
    </section>
  );
};

export default ConciliacionPage;
