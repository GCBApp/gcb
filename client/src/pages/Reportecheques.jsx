import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const HomePage = () => {
  const [lineChartData, setLineChartData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/movimiento`);
        if (!res.ok) throw new Error("Error al obtener los movimientos.");
        const data = await res.json();

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

  return (
    <section className="home-page" style={pageStyle}>
      <div className="content-container" style={containerStyle}>
        <h1 style={headerStyle}>Bienvenido a GCB App</h1>
        <p style={descriptionStyle}>Proyecto</p>

        <div style={chartRowStyle}>
          {lineChartData && (
            <div style={chartContainerStyle}>
              <h3> </h3>
              <Chart type="line" data={lineChartData} style={{ width: "100%", maxWidth: "600px" }} />
            </div>
          )}
          {pieChartData && (
            <div style={chartContainerStyle}>
              <h3> </h3>
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

export default HomePage;
