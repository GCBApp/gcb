import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const HomePage = () => {
  const [lineChartData, setLineChartData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [saldoTotal, setSaldoTotal] = useState(0);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  const [showCambioModal, setShowCambioModal] = useState(false);
  const [tipoCambioData, setTipoCambioData] = useState(null);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  // Fetch data
  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/movimiento`);
        if (!res.ok) throw new Error("Error al obtener los movimientos.");
        const data = await res.json();

        // Ordenar movimientos por fecha (más recientes primero)
        const sortedMovimientos = [...data]
          .sort((a, b) => new Date(b.MOV_Fecha_Mov) - new Date(a.MOV_Fecha_Mov));

        // Obtener los 5 más recientes para la tabla
        const recentMovimientos = sortedMovimientos.slice(0, 5);
        setMovimientos(recentMovimientos);

        // Calcular saldo total
        const total = data.reduce((sum, mov) => sum + mov.MOV_Valor_GTQ, 0);
        setSaldoTotal(total);

        // Último movimiento
        if (sortedMovimientos.length > 0) {
          setUltimoMovimiento(sortedMovimientos[0]);
        }

        // Datos para gráfica de línea
        const labels = [...new Set(data.map((mov) => mov.MOV_Fecha_Mov.split("T")[0]))].sort();
        const valores = labels.map(label => {
          const movForDay = data.filter(mov => mov.MOV_Fecha_Mov.split("T")[0] === label);
          return movForDay.reduce((sum, mov) => sum + mov.MOV_Valor_GTQ, 0);
        });

        setLineChartData({
          labels,
          datasets: [
            {
              label: "Flujo de Movimientos (GTQ)",
              data: valores,
              borderColor: "#1565C0",
              backgroundColor: "rgba(21, 101, 192, 0.2)",
              fill: true,
              tension: 0.4,
            },
          ],
        });

        // Datos para gráfica de pie
        const tiposMovimiento = [...new Set(data.map((mov) => mov.TipoMovimiento))];
        const valoresPorTipo = tiposMovimiento.map((tipo) =>
          data.filter((mov) => mov.TipoMovimiento === tipo)
              .reduce((sum, mov) => sum + Math.abs(mov.MOV_Valor_GTQ), 0)
        );

        setPieChartData({
          labels: tiposMovimiento,
          datasets: [
            {
              data: valoresPorTipo,
              backgroundColor: ["#1565C0", "#778DA9", "#415A77", "#0D1B2A"],
              borderColor: "#E0E1DD",
            },
          ],
        });
      } catch (err) {
        console.error("Error al cargar los movimientos:", err);
      }
    };

    fetchMovimientos();
  }, []);

  // Añadir estas funciones después del useEffect existente

  // Función para consultar tipos de cambio actuales
  const handleTipoCambioClick = () => {
    // Simulamos obtener tipos de cambio actuales desde una API
    const fetchTipoCambio = async () => {
      try {
        // En un entorno real, esto sería una llamada a una API externa
        // Por ahora, simulamos datos de tipo de cambio
        setTipoCambioData({
          fecha: new Date().toLocaleDateString(),
          monedas: [
            { codigo: "USD", nombre: "Dólar Estadounidense", compra: 7.75, venta: 7.85 },
            { codigo: "EUR", nombre: "Euro", compra: 8.40, venta: 8.60 },
            { codigo: "MXN", nombre: "Peso Mexicano", compra: 0.42, venta: 0.46 },
            { codigo: "CAD", nombre: "Dólar Canadiense", compra: 5.70, venta: 5.85 }
          ]
        });
        
        // Mostrar el modal
        setShowCambioModal(true);
      } catch (error) {
        console.error("Error al obtener tipo de cambio:", error);
        alert("No se pudo obtener información de tipos de cambio");
      }
    };
    
    fetchTipoCambio();
  };

  // Función para descargar datos de movimientos como CSV
  const handleDescargarCSV = () => {
    try {
      // Convertir los datos de movimientos a formato CSV
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Encabezados
      csvContent += "Fecha,Descripción,Monto (GTQ)\n";
      
      // Agregar filas de datos
      movimientos.forEach(mov => {
        const fecha = new Date(mov.MOV_Fecha_Mov).toLocaleDateString();
        const descripcion = mov.MOV_Descripcion.replace(/,/g, " "); // Evitar problemas con comas
        const monto = mov.MOV_Valor_GTQ;
        csvContent += `${fecha},"${descripcion}",${monto}\n`;
      });
      
      // Crear un elemento de descarga
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `movimientos-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // Descargar el archivo
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error al generar CSV:", error);
      alert("Error al generar el archivo CSV");
    }
  };

  return (
    <div style={containerStyle}>
      {/* Panel superior - Bienvenida */}
      <div style={headerContainerStyle}>
        <h1 style={headerStyle}>Bienvenido a GCB App</h1>
        <p style={subtitleStyle}>Sistema de Gestión de Cuentas Bancarias</p>
      </div>

      {/* Panel principal */}
      <div style={mainContentStyle}>
        {/* Tarjetas de resumen */}
        <div style={cardRowStyle}>
          <div style={cardStyle}>
            <div style={cardIconStyle}>
              <span style={iconStyle}>💰</span>
            </div>
            <div style={cardContentStyle}>
              <h3 style={cardTitleStyle}>Saldo Total</h3>
              <p style={{
                ...cardValueStyle,
                color: saldoTotal >= 0 ? "#388e3c" : "#d32f2f"
              }}>
                {new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(saldoTotal)}
              </p>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardIconStyle}>
              <span style={iconStyle}>📊</span>
            </div>
            <div style={cardContentStyle}>
              <h3 style={cardTitleStyle}>Último Movimiento</h3>
              <p style={cardValueStyle}>
                {ultimoMovimiento ? (
                  <span>
                    {new Date(ultimoMovimiento.MOV_Fecha_Mov).toLocaleDateString()}
                    <br />
                    <span style={{
                      color: ultimoMovimiento.MOV_Valor_GTQ >= 0 ? "#388e3c" : "#d32f2f",
                      fontWeight: "500"
                    }}>
                      {new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(ultimoMovimiento.MOV_Valor_GTQ)}
                    </span>
                  </span>
                ) : (
                  "No hay movimientos"
                )}
              </p>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardIconStyle}>
              <span style={iconStyle}>🔄</span>
            </div>
            <div style={cardContentStyle}>
              <h3 style={cardTitleStyle}>Acciones Rápidas</h3>
              <div style={quickLinksStyle}>
                <button style={quickLinkButtonStyle} onClick={() => navigate("/nuevo-movimiento")}>
                  Nuevo Movimiento
                </button>
                <button style={quickLinkButtonStyle} onClick={() => navigate("/reportes")}>
                  Generar Reporte
                </button>
                <button 
                  style={quickLinkButtonStyle} 
                  onClick={handleTipoCambioClick}
                >
                  Ver Tipo de Cambio
                </button>
                <button 
                  style={quickLinkButtonStyle} 
                  onClick={handleDescargarCSV}
                >
                  Descargar CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficas con estilo renovado */}
        <div style={chartSectionStyle}>
          <h2 style={sectionTitleStyle}>Análisis Financiero</h2>
          <div style={chartRowStyle}>
            {lineChartData && (
              <div style={chartContainerStyle}>
                <h3 style={chartTitleStyle}>Flujo de Movimientos</h3>
                <div style={chartWrapperStyle}>
                  <Chart 
                    type="line" 
                    data={lineChartData} 
                    options={{
                      plugins: {
                        legend: {
                          labels: {
                            color: '#415A77',
                            font: {
                              family: "'Open Sans', sans-serif"
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          ticks: {
                            color: '#415A77',
                            font: {
                              family: "'Open Sans', sans-serif"
                            }
                          },
                          grid: {
                            color: 'rgba(65, 90, 119, 0.1)'
                          }
                        },
                        y: {
                          ticks: {
                            color: '#415A77',
                            font: {
                              family: "'Open Sans', sans-serif"
                            }
                          },
                          grid: {
                            color: 'rgba(65, 90, 119, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
            {pieChartData && (
              <div style={chartContainerStyle}>
                <h3 style={chartTitleStyle}>Distribución por Tipo</h3>
                <div style={chartWrapperStyle}>
                  <Chart
                    type="pie"
                    data={pieChartData}
                    options={{
                      plugins: {
                        legend: {
                          display: true,
                          position: "bottom",
                          labels: {
                            color: '#415A77',
                            font: {
                              family: "'Open Sans', sans-serif"
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de Movimientos Recientes con nuevo estilo */}
        <div style={tableSectionStyle}>
          <h2 style={sectionTitleStyle}>Movimientos Recientes</h2>
          <div style={tableContainerStyle}>
            <DataTable
              value={movimientos}
              responsiveLayout="scroll"
              stripedRows
              style={tableStyle}
              emptyMessage="No hay movimientos registrados"
              rowHover
            >
              <Column
                field="MOV_Fecha_Mov"
                header="Fecha"
                body={(rowData) => new Date(rowData.MOV_Fecha_Mov).toLocaleDateString()}
                style={{ width: "20%" }}
                headerStyle={{ backgroundColor: '#0D1B2A', color: '#E0E1DD' }}
              />
              <Column
                field="MOV_Descripcion"
                header="Descripción"
                style={{ width: "60%" }}
                headerStyle={{ backgroundColor: '#0D1B2A', color: '#E0E1DD' }}
              />
              <Column
                field="MOV_Valor_GTQ"
                header="Monto"
                body={(rowData) => (
                  <span style={{ color: rowData.MOV_Valor_GTQ < 0 ? "#d32f2f" : "#388e3c", fontWeight: "bold" }}>
                    {new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(rowData.MOV_Valor_GTQ)}
                  </span>
                )}
                style={{ width: "20%", textAlign: "right" }}
                headerStyle={{ backgroundColor: '#0D1B2A', color: '#E0E1DD' }}
              />
            </DataTable>
            <div style={viewAllButtonContainerStyle}>
              <button style={viewAllButtonStyle} onClick={() => navigate("/movimientos")}>
                Ver Todos los Movimientos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Tipo de Cambio */}
      {showCambioModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{margin: 0}}>Tipos de Cambio - {tipoCambioData?.fecha}</h3>
              <button 
                style={closeButtonStyle} 
                onClick={() => setShowCambioModal(false)}
              >
                ✕
              </button>
            </div>
            <div style={modalBodyStyle}>
              <table style={cambioTableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Moneda</th>
                    <th style={thStyle}>Compra</th>
                    <th style={thStyle}>Venta</th>
                  </tr>
                </thead>
                <tbody>
                  {tipoCambioData?.monedas.map((moneda, index) => (
                    <tr key={moneda.codigo} style={index % 2 === 0 ? trEvenStyle : trOddStyle}>
                      <td style={tdStyle}>
                        <strong>{moneda.codigo}</strong> - {moneda.nombre}
                      </td>
                      <td style={{...tdStyle, textAlign: "right"}}>
                        Q {moneda.compra.toFixed(2)}
                      </td>
                      <td style={{...tdStyle, textAlign: "right"}}>
                        Q {moneda.venta.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{marginTop: "20px", textAlign: "center", color: "#666", fontSize: "14px"}}>
                Información actualizada al {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div style={modalFooterStyle}>
              <button 
                style={{...viewAllButtonStyle, width: "100%"}} 
                onClick={() => setShowCambioModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos coherentes con la página de login
const containerStyle = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  width: "100%",
  backgroundColor: "#E0E1DD",
  fontFamily: "'Open Sans', sans-serif",
};

const headerContainerStyle = {
  backgroundColor: "#0D1B2A",
  padding: "30px 20px",
  color: "white",
  textAlign: "center",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
};

const headerStyle = {
  margin: 0,
  fontSize: "32px",
  fontWeight: "600",
};

const subtitleStyle = {
  fontSize: "16px",
  marginTop: "10px",
  color: "#E0E1DD",
};

const mainContentStyle = {
  padding: "30px 40px",
  flex: 1,
  maxWidth: "1400px",
  margin: "0 auto",
  width: "100%",
};

const cardRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "20px",
  marginBottom: "30px",
};

const cardStyle = {
  flex: "1 1 300px",
  backgroundColor: "white",
  borderRadius: "8px",
  padding: "20px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  display: "flex",
  alignItems: "center",
};

const cardIconStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  backgroundColor: "#1565C0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginRight: "20px",
};

const iconStyle = {
  fontSize: "28px",
};

const cardContentStyle = {
  flex: 1,
};

const cardTitleStyle = {
  fontSize: "16px",
  margin: 0,
  marginBottom: "10px",
  color: "#415A77",
};

const cardValueStyle = {
  fontSize: "20px",
  fontWeight: "600",
  margin: 0,
};

const quickLinksStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};

const quickLinkButtonStyle = {
  backgroundColor: "#778DA9",
  color: "white",
  border: "none",
  borderRadius: "5px",
  padding: "8px 12px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "background-color 0.3s",
};

const sectionTitleStyle = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#0D1B2A",
  marginBottom: "20px",
  paddingBottom: "10px",
  borderBottom: "2px solid #778DA9",
};

const chartSectionStyle = {
  marginBottom: "30px",
};

const chartRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "30px",
};

const chartContainerStyle = {
  flex: "1 1 calc(50% - 15px)",
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  minWidth: "300px",
};

const chartTitleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#415A77",
  marginBottom: "15px",
  textAlign: "center",
};

const chartWrapperStyle = {
  padding: "10px",
};

const tableSectionStyle = {
  marginBottom: "30px",
};

const tableContainerStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
};

const tableStyle = {
  width: "100%",
  fontFamily: "'Open Sans', sans-serif",
};

const viewAllButtonContainerStyle = {
  display: "flex",
  justifyContent: "center",
  marginTop: "20px",
};

const viewAllButtonStyle = {
  backgroundColor: "#1565C0",
  color: "white",
  border: "none",
  borderRadius: "5px",
  padding: "10px 20px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: "pointer",
  transition: "background-color 0.3s",
  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "white",
  borderRadius: "8px",
  width: "90%",
  maxWidth: "500px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  overflow: "hidden",
};

const modalHeaderStyle = {
  backgroundColor: "#1565C0",
  color: "white",
  padding: "15px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const closeButtonStyle = {
  backgroundColor: "transparent",
  border: "none",
  color: "white",
  fontSize: "20px",
  cursor: "pointer",
};

const modalBodyStyle = {
  padding: "20px",
};

const cambioTableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  backgroundColor: "#0D1B2A",
  color: "white",
  padding: "10px",
  textAlign: "left",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
};

const trEvenStyle = {
  backgroundColor: "#f9f9f9",
};

const trOddStyle = {
  backgroundColor: "white",
};

const modalFooterStyle = {
  padding: "15px",
  backgroundColor: "#f1f1f1",
  textAlign: "center",
};

export default HomePage;
