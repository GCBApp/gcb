import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const HomePage = () => {
  const [lineChartData, setLineChartData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/movimiento`);
        if (!res.ok) throw new Error("Error al obtener los movimientos.");
        const data = await res.json();

        // Guardar los movimientos para la tabla (solo los más recientes)
        const sortedMovimientos = [...data].sort((a, b) => 
          new Date(b.MOV_Fecha_Mov) - new Date(a.MOV_Fecha_Mov)
        ).slice(0, 5); // Solo mostramos los 5 más recientes
        
        setMovimientos(sortedMovimientos);

        // Procesar datos para el gráfico de líneas
        const labels = data.map((mov) => mov.MOV_Fecha_Mov.split("T")[0]); // Fechas
        const valores = data.map((mov) => mov.MOV_Valor_GTQ); // Valores

        setLineChartData({
          labels,
          datasets: [
            {
              label: "Flujo de Movimientos (GTQ)",
              data: valores,
              borderColor: "#42A5F5",
              backgroundColor: "rgba(66, 165, 245, 0.2)",
              fill: true,
              tension: 0.4,
            },
          ],
        });

        // Procesar datos para el gráfico de pastel
        const tiposMovimiento = [...new Set(data.map((mov) => mov.TipoMovimiento))];
        const valoresPorTipo = tiposMovimiento.map((tipo) =>
          data.filter((mov) => mov.TipoMovimiento === tipo).reduce((sum, mov) => sum + mov.MOV_Valor_GTQ, 0)
        );

        setPieChartData({
          labels: tiposMovimiento,
          datasets: [
            {
              data: valoresPorTipo,
              backgroundColor: ["#42A5F5", "#66BB6A", "#FFA726", "#FF7043"],
            },
          ],
        });
      } catch (err) {
        console.error("Error al cargar los movimientos:", err);
      }
    };

    fetchMovimientos();
  }, []);

  // Formato de fecha para la tabla
  const dateBodyTemplate = (rowData) => {
    if (!rowData.MOV_Fecha_Mov) return "N/A";
    const date = new Date(rowData.MOV_Fecha_Mov);
    return date.toLocaleDateString();
  };

  // Formato de montos con color según sea positivo o negativo
  const amountBodyTemplate = (rowData) => {
    const amount = rowData.MOV_Valor_GTQ;
    return (
      <span style={{ color: amount < 0 ? '#d32f2f' : '#388e3c', fontWeight: 'bold' }}>
        {new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(amount)}
      </span>
    );
  };

  return (
    <section className="home-page" style={pageStyle}>
      <div className="content-container" style={containerStyle}>
        <h1 style={headerStyle}>Bienvenido a GCB App</h1>
        <p style={descriptionStyle}>Proyecto</p>

        <div style={chartRowStyle}>
          {lineChartData && (
            <div style={chartContainerStyle}>
              <h3>Flujo de Movimientos</h3>
              <Chart type="line" data={lineChartData} style={{ width: "100%", maxWidth: "600px" }} />
            </div>
          )}
          {pieChartData && (
            <div style={chartContainerStyle}>
              <h3>Distribución por Tipo</h3>
              <Chart
                type="pie"
                data={pieChartData}
                options={{
                  plugins: {
                    legend: {
                      display: true,
                      position: "bottom",
                    },
                  },
                }}
                style={{ width: "100%", maxWidth: "400px" }}
              />
            </div>
          )}
        </div>

        {/* Tabla de Movimientos Recientes */}
        <div style={tableContainerStyle}>
          <h2 style={tableTitleStyle}>Movimientos Recientes</h2>
          <DataTable 
            value={movimientos} 
            responsiveLayout="scroll"
            stripedRows
            style={tableStyle}
          >
            <Column 
              field="MOV_Fecha_Mov" 
              header="Fecha" 
              body={dateBodyTemplate}
              style={{ width: '20%' }}
            />
            <Column 
              field="MOV_Descripcion" 
              header="Descripción" 
              style={{ width: '60%' }}
            />
            <Column 
              field="MOV_Valor_GTQ" 
              header="Monto" 
              body={amountBodyTemplate}
              style={{ width: '20%', textAlign: 'right' }}
            />
          </DataTable>
        </div>
      </div>
    </section>
  );
};

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
};

const containerStyle = {
  width: "100%",
  maxWidth: "1400px", // Ampliar el contenedor principal
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "10px",
};

const descriptionStyle = {
  textAlign: "center",
  marginBottom: "20px",
};

const chartRowStyle = {
  display: "flex",
  justifyContent: "space-around",
  flexWrap: "wrap",
  gap: "20px",
  marginBottom: "30px",
};

const chartContainerStyle = {
  flex: "1 1 calc(50% - 20px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

// Estilos para la tabla de movimientos recientes
const tableContainerStyle = {
  width: "100%",
  marginTop: "20px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "20px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
};

const tableTitleStyle = {
  marginBottom: "15px",
  color: "#0D1B2A",
  fontWeight: "600",
};

const tableStyle = {
  width: "100%",
};

export default HomePage;
