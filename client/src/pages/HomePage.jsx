import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Chart } from "primereact/chart";
import { Dialog } from "primereact/dialog";
import { FaWallet, FaMoneyBillWave, FaExchangeAlt, FaUsers } from "react-icons/fa";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const HomePage = () => {
  const [lineChartData, setLineChartData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [saldoTotal, setSaldoTotal] = useState(0);
  const [ultimoMovimiento, setUltimoMovimiento] = useState(null);
  const [showCambioModal, setShowCambioModal] = useState(false);
  const [tipoCambioData, setTipoCambioData] = useState(null);
  const [showResumenModal, setShowResumenModal] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Movimientos
        const movRes = await fetch(`${API_URL}/api/movimiento`);
        const movData = await movRes.json();
        setMovimientos(movData);

        // Cuentas
        const cuentasRes = await fetch(`${API_URL}/api/cuentasBancarias`);
        const cuentasData = await cuentasRes.json();
        setCuentas(cuentasData);

        // Usuarios
        const usuariosRes = await fetch(`${API_URL}/api/empleado`);
        const usuariosData = await usuariosRes.json();
        setUsuarios(usuariosData);

        // Saldo total
        const total = cuentasData.reduce((sum, c) => sum + (c.CUB_saldo || 0), 0);
        setSaldoTotal(total);

        // Último movimiento
        const sortedMovimientos = [...movData].sort((a, b) => new Date(b.MOV_Fecha_Mov) - new Date(a.MOV_Fecha_Mov));
        if (sortedMovimientos.length > 0) setUltimoMovimiento(sortedMovimientos[0]);

        // Gráfico de líneas: flujo diario
        const labels = [...new Set(movData.map((mov) => mov.MOV_Fecha_Mov.split("T")[0]))].sort();
        const valores = labels.map(label => {
          const movForDay = movData.filter(mov => mov.MOV_Fecha_Mov.split("T")[0] === label);
          return movForDay.reduce((sum, mov) => sum + mov.MOV_Valor_GTQ, 0);
        });
        setLineChartData({
          labels,
          datasets: [
            {
              label: "Flujo Diario (GTQ)",
              data: valores,
              borderColor: "#1565C0",
              backgroundColor: "rgba(21, 101, 192, 0.2)",
              fill: true,
              tension: 0.4,
            },
          ],
        });

        // Gráfico de pastel: distribución por tipo
        const tiposMovimiento = [...new Set(movData.map((mov) => mov.TipoMovimiento))];
        const valoresPorTipo = tiposMovimiento.map((tipo) =>
          movData.filter((mov) => mov.TipoMovimiento === tipo)
            .reduce((sum, mov) => sum + Math.abs(mov.MOV_Valor_GTQ), 0)
        );
        setPieChartData({
          labels: tiposMovimiento,
          datasets: [
            {
              data: valoresPorTipo,
              backgroundColor: ["#1565C0", "#778DA9", "#415A77", "#0D1B2A", "#21B573", "#D90429"],
              borderColor: "#E0E1DD",
            },
          ],
        });

        // Gráfico de barras: saldo por cuenta
        const cuentasLabels = cuentasData.map(c => c.CUB_Nombre || c.CUB_Cuentabancaria);
        const cuentasSaldos = cuentasData.map(c => c.CUB_saldo || 0);
        setBarChartData({
          labels: cuentasLabels,
          datasets: [
            {
              label: "Saldo por Cuenta (GTQ)",
              data: cuentasSaldos,
              backgroundColor: cuentasSaldos.map(s => s >= 0 ? "#21B573" : "#D90429"),
            },
          ],
        });
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };

    fetchAll();
  }, []);

  const handleTipoCambioClick = () => {
    setTipoCambioData({
      fecha: new Date().toLocaleDateString(),
      monedas: [
        { codigo: "USD", nombre: "Dólar Estadounidense", compra: 7.75, venta: 7.85 },
        { codigo: "EUR", nombre: "Euro", compra: 8.40, venta: 8.60 },
        { codigo: "MXN", nombre: "Peso Mexicano", compra: 0.42, venta: 0.46 },
        { codigo: "CAD", nombre: "Dólar Canadiense", compra: 5.70, venta: 5.85 }
      ]
    });
    setShowCambioModal(true);
  };

  const handleResumenClick = () => setShowResumenModal(true);

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fa", padding: "40px 0" }}>
      <div style={{ maxWidth: "98vw", margin: "0 auto" }}>
        {/* Tarjetas de resumen con iconos */}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
          <Card style={{ flex: 1, minWidth: 220, background: "#E0E1DD", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <FaWallet size={36} color="#1565C0" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 16, color: "#415A77", marginBottom: 8 }}>Cuentas</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{cuentas.length}</div>
          </Card>
          <Card style={{ flex: 1, minWidth: 220, background: "#E0E1DD", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <FaMoneyBillWave size={36} color="#21B573" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 16, color: "#415A77", marginBottom: 8 }}>Saldo Total</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: saldoTotal >= 0 ? "#388e3c" : "#d32f2f" }}>
              {new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(saldoTotal)}
            </div>
          </Card>
          <Card style={{ flex: 1, minWidth: 220, background: "#E0E1DD", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <FaExchangeAlt size={36} color="#778DA9" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 16, color: "#415A77", marginBottom: 8 }}>Movimientos</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{movimientos.length}</div>
          </Card>
          <Card style={{ flex: 1, minWidth: 220, background: "#E0E1DD", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <FaUsers size={36} color="#415A77" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 16, color: "#415A77", marginBottom: 8 }}>Usuarios</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{usuarios.length}</div>
          </Card>
        </div>
        {/* Acciones rápidas */}
        <div style={{ display: "flex", gap: 16, justifyContent: "flex-end", marginBottom: 16 }}>
          <Button label="Resumen Mensual" className="p-button-sm p-button-info" onClick={handleResumenClick} />
          <Button label="Ver Tipo de Cambio" className="p-button-sm p-button-help" onClick={handleTipoCambioClick} />
        </div>
        {/* Gráficos */}
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 32, width: "100%" }}>
          <Card title="Flujo de Movimientos" style={{ flex: 1, minWidth: 320, borderRadius: 16, width: "100%" }}>
            {lineChartData && (
              <Chart type="line" data={lineChartData} options={{
                plugins: { legend: { labels: { color: '#415A77' } } },
                scales: {
                  x: { ticks: { color: '#415A77' }, grid: { color: 'rgba(65, 90, 119, 0.1)' } },
                  y: { ticks: { color: '#415A77' }, grid: { color: 'rgba(65, 90, 119, 0.1)' } }
                }
              }} />
            )}
          </Card>
          <Card title="Distribución por Tipo" style={{ flex: 1, minWidth: 320, borderRadius: 16, width: "100%" }}>
            {pieChartData && (
              <Chart type="pie" data={pieChartData} options={{
                plugins: { legend: { position: "bottom", labels: { color: '#415A77' } } }
              }} />
            )}
          </Card>
          <Card title="Saldo por Cuenta" style={{ flex: 1, minWidth: 320, borderRadius: 16, width: "100%" }}>
            {barChartData && (
              <Chart type="bar" data={barChartData} options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#415A77' }, grid: { color: 'rgba(65, 90, 119, 0.1)' } },
                  y: { ticks: { color: '#415A77' }, grid: { color: 'rgba(65, 90, 119, 0.1)' } }
                }
              }} />
            )}
          </Card>
        </div>
        {/* Tabla de movimientos recientes */}
        <Card title="Movimientos Recientes" style={{ borderRadius: 16, width: "100%", maxWidth: "100%" }}>
          <DataTable
            value={movimientos.slice(0, 10)}
            responsiveLayout="scroll"
            stripedRows
            style={{ fontSize: 15, borderRadius: 12, width: "100%" }}
            emptyMessage="No hay movimientos registrados"
            rowHover
            scrollable
            scrollHeight="flex"
          >
            <Column
              field="MOV_Fecha_Mov"
              header="Fecha"
              body={(rowData) => new Date(rowData.MOV_Fecha_Mov).toLocaleDateString()}
              style={{ minWidth: 120 }}
            />
            <Column
              field="MOV_Descripcion"
              header="Descripción"
              style={{ minWidth: 200 }}
            />
            <Column
              field="TipoMovimiento"
              header="Tipo"
              style={{ minWidth: 120 }}
            />
            <Column
              field="CUB_Cuentabancaria"
              header="Cuenta"
              style={{ minWidth: 120 }}
            />
            <Column
              field="MOV_Valor_GTQ"
              header="Monto"
              body={(rowData) => (
                <span style={{ color: rowData.MOV_Valor_GTQ < 0 ? "#d32f2f" : "#388e3c", fontWeight: "bold" }}>
                  {new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(rowData.MOV_Valor_GTQ)}
                </span>
              )}
              style={{ minWidth: 120, textAlign: "right" }}
            />
          </DataTable>
        </Card>
        {/* Tabla de cuentas */}
        <Card title="Cuentas Bancarias" style={{ borderRadius: 16, width: "100%", maxWidth: "100%", marginTop: 32 }}>
          <DataTable
            value={cuentas}
            responsiveLayout="scroll"
            stripedRows
            style={{ fontSize: 15, borderRadius: 12, width: "100%" }}
            emptyMessage="No hay cuentas registradas"
            rowHover
            scrollable
            scrollHeight="flex"
          >
            <Column field="CUB_Nombre" header="Nombre" style={{ minWidth: 180 }} />
            <Column field="Banco_Nombre" header="Banco" style={{ minWidth: 120 }} />
            <Column field="CUB_Numero" header="Número" style={{ minWidth: 120 }} />
            <Column field="TCP_Descripcion" header="Tipo" style={{ minWidth: 120 }} />
            <Column
              field="CUB_saldo"
              header="Saldo"
              body={rowData => (
                <span style={{ color: rowData.CUB_saldo < 0 ? "#d32f2f" : "#388e3c", fontWeight: "bold" }}>
                  {new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(rowData.CUB_saldo)}
                </span>
              )}
              style={{ minWidth: 120, textAlign: "right" }}
            />
          </DataTable>
        </Card>
      </div>
      {/* Modal de Tipo de Cambio */}
      <Dialog header={`Tipos de Cambio - ${tipoCambioData?.fecha || ""}`} visible={showCambioModal} style={{ width: "400px" }} modal onHide={() => setShowCambioModal(false)} footer={
        <Button label="Cerrar" className="p-button-text" onClick={() => setShowCambioModal(false)} />
      }>
        <table style={{ width: "100%", marginBottom: 10 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Moneda</th>
              <th style={{ textAlign: "right" }}>Compra</th>
              <th style={{ textAlign: "right" }}>Venta</th>
            </tr>
          </thead>
          <tbody>
            {tipoCambioData?.monedas.map((moneda) => (
              <tr key={moneda.codigo}>
                <td><strong>{moneda.codigo}</strong> - {moneda.nombre}</td>
                <td style={{ textAlign: "right" }}>Q {moneda.compra.toFixed(2)}</td>
                <td style={{ textAlign: "right" }}>Q {moneda.venta.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ color: "#666", fontSize: "14px" }}>
          Información actualizada al {new Date().toLocaleTimeString()}
        </div>
      </Dialog>
      {/* Modal de Resumen Mensual */}
      <Dialog header="Resumen Mensual" visible={showResumenModal} style={{ width: "400px" }} modal onHide={() => setShowResumenModal(false)} footer={
        <Button label="Cerrar" className="p-button-text" onClick={() => setShowResumenModal(false)} />
      }>
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#415A77', marginBottom: '15px' }}>Balance General</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Total Ingresos:</span>
            <span style={{ color: '#388e3c', fontWeight: '500' }}>
              {new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" })
                .format(movimientos.filter(mov => mov.MOV_Valor_GTQ > 0)
                .reduce((sum, mov) => sum + mov.MOV_Valor_GTQ, 0))}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Total Egresos:</span>
            <span style={{ color: '#d32f2f', fontWeight: '500' }}>
              {new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" })
                .format(movimientos.filter(mov => mov.MOV_Valor_GTQ < 0)
                .reduce((sum, mov) => sum + Math.abs(mov.MOV_Valor_GTQ), 0))}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
            <span><strong>Balance:</strong></span>
            <span style={{
              fontWeight: '600',
              color: saldoTotal >= 0 ? '#388e3c' : '#d32f2f'
            }}>
              {new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(saldoTotal)}
            </span>
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#415A77', marginBottom: '15px' }}>Actividad Reciente</h4>
          <div style={{ color: '#666', fontSize: '14px' }}>
            <p>Número de movimientos este mes: <strong>{movimientos.length}</strong></p>
            <p>Último movimiento: <strong>
              {ultimoMovimiento ? new Date(ultimoMovimiento.MOV_Fecha_Mov).toLocaleDateString() : "N/A"}
            </strong></p>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default HomePage;
