import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { FaWallet, FaMoneyBillWave, FaExchangeAlt } from "react-icons/fa";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const AccountsPage = () => {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedCuenta, setSelectedCuenta] = useState(null);
  const [showMovimientos, setShowMovimientos] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [movimientosCuenta, setMovimientosCuenta] = useState([]);
  const [historialSaldos, setHistorialSaldos] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [addFormData, setAddFormData] = useState({
    CUB_Nombre: "",
    TCP_Tipo_cuenta: "",
    BAN_banco: "",
    MON_moneda: "",
    CUB_Numero: "",
    CUB_saldo: null,
  });
  const [bancos, setBancos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [tiposCuenta, setTiposCuenta] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    fetchCuentas();
    fetchCatalogos();
  }, []);

  const fetchCuentas = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cuentasBancarias`);
      if (!res.ok) throw new Error("Error al cargar las cuentas.");
      const data = await res.json();
      setCuentas(Array.isArray(data) ? data : []);
      setErrorMessage("");
    } catch (err) {
      setCuentas([]);
      setErrorMessage("Error al cargar las cuentas.");
      console.error("Error al cargar cuentas:", err);
    }
    setLoading(false);
  };

  const fetchCatalogos = async () => {
    try {
      const [bancosRes, monedasRes, tiposRes] = await Promise.all([
        fetch(`${API_URL}/api/bancos`),
        fetch(`${API_URL}/api/moneda`),
        fetch(`${API_URL}/api/tipoCuentaBancaria`)
      ]);
      setBancos(await bancosRes.json());
      setMonedas(await monedasRes.json());
      setTiposCuenta(await tiposRes.json());
    } catch {
      setBancos([]); setMonedas([]); setTiposCuenta([]);
    }
  };

  const handleAddAccount = () => {
    setAddFormData({
      CUB_Nombre: "",
      TCP_Tipo_cuenta: "",
      BAN_banco: "",
      MON_moneda: "",
      CUB_Numero: "",
      CUB_saldo: null,
    });
    setShowAddDialog(true);
  };

  const handleEdit = (id) => {
    const cuenta = cuentas.find(c => c.CUB_Cuentabancaria === id);
    setEditFormData({
      ...cuenta,
      CUB_saldo: cuenta.CUB_saldo ?? 0
    });
    setShowEditDialog(true);
  };

  const handleDelete = async (id) => {
    setShowConfirmDelete(false);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cuentasBancarias/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCuentas((prev) => prev.filter((c) => c.CUB_Cuentabancaria !== id));
        toast.current && toast.current.show({ severity: "success", summary: "Eliminada", detail: "Cuenta eliminada correctamente", life: 2000 });
      } else {
        toast.current && toast.current.show({ severity: "error", summary: "Error", detail: "No se pudo eliminar la cuenta", life: 3500 });
      }
    } catch (err) {
      toast.current && toast.current.show({ severity: "error", summary: "Error", detail: "No se pudo eliminar la cuenta", life: 3500 });
      console.error("Error al eliminar cuenta:", err);
    }
    setLoading(false);
  };

  const handleCardClick = async (cuenta) => {
    setSelectedCuenta(cuenta);
    setShowMovimientos(true);
    try {
      const res = await fetch(`${API_URL}/api/movimiento?cuenta=${cuenta.CUB_Cuentabancaria}`);
      const data = await res.json();
      setMovimientosCuenta(Array.isArray(data) ? data : []);
    } catch (err) {
      setMovimientosCuenta([]);
      console.error("Error al cargar movimientos de la cuenta:", err);
    }
    try {
      const res = await fetch(`${API_URL}/api/historialSaldos?cuenta=${cuenta.CUB_Cuentabancaria}`);
      const data = await res.json();
      setHistorialSaldos(Array.isArray(data) ? data : []);
    } catch (err) {
      setHistorialSaldos([]);
      console.error("Error al cargar historial de saldos:", err);
    }
  };

  // --- FORMULARIO AGREGAR CUENTA (efecto GCB, modal) ---
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddNumberChange = (e) => {
    setAddFormData((prev) => ({ ...prev, CUB_saldo: e.value }));
  };
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (
      !addFormData.CUB_Nombre ||
      !addFormData.TCP_Tipo_cuenta ||
      !addFormData.BAN_banco ||
      !addFormData.MON_moneda ||
      !addFormData.CUB_Numero ||
      addFormData.CUB_saldo === null
    ) {
      toast.current.show({ severity: "warn", summary: "Campos requeridos", detail: "Todos los campos son obligatorios.", life: 3000 });
      return;
    }
    if (isNaN(Number(addFormData.CUB_saldo))) {
      toast.current.show({ severity: "warn", summary: "Saldo inválido", detail: "El saldo debe ser un número válido.", life: 3000 });
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cuentasBancarias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addFormData,
          CUB_saldo: Number(addFormData.CUB_saldo),
        }),
      });
      if (res.ok) {
        toast.current.show({ severity: "success", summary: "Cuenta creada", detail: "La cuenta bancaria fue creada correctamente.", life: 2000 });
        setShowAddDialog(false);
        fetchCuentas();
      } else {
        const errorText = await res.text();
        toast.current.show({ severity: "error", summary: "Error", detail: errorText, life: 3500 });
      }
    } catch (err) {
      toast.current.show({ severity: "error", summary: "Error", detail: "Error al enviar la cuenta bancaria.", life: 3500 });
    }
    setFormLoading(false);
  };

  // --- FORMULARIO EDITAR CUENTA (efecto GCB, modal) ---
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (
      !editFormData.CUB_Nombre ||
      !editFormData.TCP_Tipo_cuenta ||
      !editFormData.BAN_banco ||
      !editFormData.MON_moneda ||
      !editFormData.CUB_Numero
    ) {
      toast.current.show({ severity: "warn", summary: "Campos requeridos", detail: "Todos los campos son obligatorios.", life: 3000 });
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/cuentasBancarias/${editFormData.CUB_Cuentabancaria}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          // No enviar saldo como editable
        }),
      });
      if (res.ok) {
        toast.current.show({ severity: "success", summary: "Cuenta actualizada", detail: "La cuenta fue actualizada correctamente.", life: 2000 });
        setShowEditDialog(false);
        fetchCuentas();
      } else {
        const errorText = await res.text();
        toast.current.show({ severity: "error", summary: "Error", detail: errorText, life: 3500 });
      }
    } catch (err) {
      toast.current.show({ severity: "error", summary: "Error", detail: "Error al actualizar la cuenta.", life: 3500 });
    }
    setFormLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fa", padding: "40px 0", position: "relative" }}>
      <Toast ref={toast} />
      {/* Botón flotante efecto GCB */}
      <Button
        icon="pi pi-plus"
        className="p-button-rounded p-button-success"
        style={{
          position: "fixed",
          bottom: 40,
          right: 40,
          zIndex: 100,
          width: 56,
          height: 56,
          fontSize: 24,
          background: "#21B573",
          boxShadow: "0 4px 16px #21B57344",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        onClick={handleAddAccount}
        tooltip="Nueva cuenta bancaria"
        tooltipOptions={{ position: "left" }}
      />
      <Card
        title="Cuentas bancarias"
        subTitle="Consulta y administración de cuentas bancarias"
        style={{
          maxWidth: "98vw",
          margin: "0 auto",
          borderRadius: 16,
          boxShadow: "0 2px 16px #e0e1dd",
          background: "#fff",
          width: "100%",
        }}
      >
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        {loading ? (
          <p>Cargando cuentas...</p>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "24px",
            marginTop: 24,
            width: "100%",
          }}>
            {cuentas.map((cuenta) => (
              <Card
                key={cuenta.CUB_Cuentabancaria}
                style={{
                  width: "100%",
                  padding: 0,
                  overflow: "hidden",
                  backgroundColor: "#E0E1DD",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px #e0e1dd",
                  cursor: "pointer",
                  position: "relative"
                }}
                className="account-card"
                onClick={() => handleCardClick(cuenta)}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  width: "100%",
                  padding: "16px 16px 0 16px"
                }}>
                  <div style={{ width: "120px", height: "60px", display: "flex", alignItems: "flex-start" }}>
                    <img
                      src={`/bancos/${(cuenta.Banco_Nombre || "").toLowerCase().replace(/\s/g, "")}.png`}
                      alt={cuenta.Banco_Nombre}
                      style={{ maxHeight: "50px", maxWidth: "100%", objectFit: "contain" }}
                      onError={e => { e.target.onerror = null; e.target.src = "/bancos/default.png"; }}
                    />
                  </div>
                  <div style={{ textAlign: "right", flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "flex-start" }}>
                    <p style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: (cuenta.CUB_saldo || 0) >= 0 ? "green" : "red",
                      margin: 0
                    }}>
                      <FaMoneyBillWave style={{ marginRight: 8, verticalAlign: "middle" }} />
                      <strong>Saldo:</strong> {new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(cuenta.CUB_saldo || 0)}
                    </p>
                  </div>
                  <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 8, zIndex: 2 }}>
                    <Button
                      icon="pi pi-pencil"
                      className="p-button-rounded p-button-text p-button-info"
                      style={{ fontSize: 20, background: "#415A77", color: "#fff" }}
                      onClick={e => { e.stopPropagation(); handleEdit(cuenta.CUB_Cuentabancaria); }}
                      tooltip="Editar"
                      tooltipOptions={{ position: "top" }}
                    />
                    <Button
                      icon="pi pi-trash"
                      className="p-button-rounded p-button-text p-button-danger"
                      style={{ fontSize: 20, background: "#D90429", color: "#fff" }}
                      onClick={e => { e.stopPropagation(); setDeleteId(cuenta.CUB_Cuentabancaria); setShowConfirmDelete(true); }}
                      tooltip="Eliminar"
                      tooltipOptions={{ position: "top" }}
                    />
                  </div>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  padding: "0 16px 16px 16px"
                }}>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>
                      <FaWallet style={{ marginRight: 8, verticalAlign: "middle" }} />
                      {cuenta.CUB_Nombre}
                    </p>
                    <p style={{ fontSize: "20px", margin: 0 }}>{cuenta.Banco_Nombre}</p>
                    <p style={{ fontSize: "20px", margin: 0 }}>
                      Número: {cuenta.CUB_Numero ?? cuenta.CUB_Número ?? "-"}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "25px", margin: 0 }}>
                      <FaExchangeAlt style={{ marginRight: 8, verticalAlign: "middle" }} />
                      <strong>Tipo:</strong> {cuenta.TCP_Descripcion ?? cuenta.CUB_Tipo ?? "-"}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <Button
                    icon="pi pi-history"
                    className="p-button-rounded p-button-info"
                    style={{ fontSize: 18, marginTop: 4, background: "#415A77", color: "#fff" }}
                    onClick={e => { e.stopPropagation(); setSelectedCuenta(cuenta); setShowHistorial(true); }}
                    tooltip="Ver historial de saldos"
                    tooltipOptions={{ position: "bottom" }}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
        {/* Confirmación de eliminación */}
        <Dialog
          header="Confirmar eliminación"
          visible={showConfirmDelete}
          style={{ width: "350px" }}
          modal
          onHide={() => setShowConfirmDelete(false)}
          footer={
            <div>
              <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={() => setShowConfirmDelete(false)} />
              <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={() => handleDelete(deleteId)} />
            </div>
          }
        >
          <span>
            <i className="pi pi-exclamation-triangle" style={{ color: "#d32f2f", marginRight: 8 }} />
            ¿Desea eliminar la cuenta bancaria?
          </span>
        </Dialog>
        {/* Movimientos de la cuenta seleccionada */}
        <Dialog
          header={`Movimientos de ${selectedCuenta?.CUB_Nombre || ""}`}
          visible={showMovimientos}
          style={{ width: "90vw", maxWidth: 900 }}
          modal
          onHide={() => setShowMovimientos(false)}
        >
          <Card>
            {/* Aquí puedes mostrar una tabla de movimientos de la cuenta */}
            {/* ... */}
          </Card>
        </Dialog>
        {/* Historial de saldos de la cuenta seleccionada */}
        <Dialog
          header={`Historial de saldos de ${selectedCuenta?.CUB_Nombre || ""}`}
          visible={showHistorial}
          style={{ width: "90vw", maxWidth: 700 }}
          modal
          onHide={() => setShowHistorial(false)}
        >
          <Card>
            {/* Aquí puedes mostrar una tabla de historial de saldos */}
            {/* ... */}
          </Card>
        </Dialog>
      </Card>
      {/* Dialog Agregar Cuenta - DISEÑO IGUAL A CARGA.JSX */}
      <Dialog
        header={null}
        visible={showAddDialog}
        style={{ width: "400px", borderRadius: 16 }}
        modal
        className="gcb-modal"
        onHide={() => setShowAddDialog(false)}
        footer={null}
        contentStyle={{ background: "#fff", borderRadius: 16, padding: 0 }}
        closable={false}
      >
        <form onSubmit={handleAddSubmit} autoComplete="off" style={{ padding: 0 }}>
          <div style={{ padding: 24 }}>
            <h2 style={{ color: "#0D1B2A", margin: "0 0 24px 0", fontWeight: 700, fontSize: 26, textAlign: "center" }}>
              Nueva Cuenta Bancaria
            </h2>
            <div className="p-field" style={{ marginBottom: 18 }}>
              <label htmlFor="CUB_Nombre" style={{ fontWeight: 600, color: "#1B263B" }}>Nombre de la Cuenta</label>
              <InputText
                id="CUB_Nombre"
                name="CUB_Nombre"
                value={addFormData.CUB_Nombre}
                onChange={handleAddChange}
                placeholder="Nombre de la cuenta"
                style={{ width: "100%" }}
                autoFocus
              />
            </div>
            <div className="p-field" style={{ marginBottom: 18 }}>
              <label htmlFor="CUB_Numero" style={{ fontWeight: 600, color: "#1B263B" }}>Número de Cuenta</label>
              <InputText
                id="CUB_Numero"
                name="CUB_Numero"
                value={addFormData.CUB_Numero}
                onChange={handleAddChange}
                placeholder="Número de cuenta"
                style={{ width: "100%" }}
              />
            </div>
            <div className="p-field" style={{ marginBottom: 18 }}>
              <label htmlFor="TCP_Tipo_cuenta" style={{ fontWeight: 600, color: "#1B263B" }}>Tipo de Cuenta</label>
              <Dropdown
                id="TCP_Tipo_cuenta"
                name="TCP_Tipo_cuenta"
                value={addFormData.TCP_Tipo_cuenta}
                options={tiposCuenta.map(tipo => ({
                  label: tipo.TCP_Descripcion || tipo.TCP_Tipo_cuenta,
                  value: tipo.TCP_Tipo_cuenta
                }))}
                onChange={handleAddChange}
                placeholder="Seleccione tipo de cuenta"
                style={{ width: "100%" }}
                showClear
              />
            </div>
            <div className="p-field" style={{ marginBottom: 18 }}>
              <label htmlFor="MON_moneda" style={{ fontWeight: 600, color: "#1B263B" }}>Tipo de Moneda</label>
              <Dropdown
                id="MON_moneda"
                name="MON_moneda"
                value={addFormData.MON_moneda}
                options={monedas.map(moneda => ({
                  label: moneda.MON_nombre || moneda.MON_moneda,
                  value: moneda.MON_moneda
                }))}
                onChange={handleAddChange}
                placeholder="Seleccione un tipo de moneda"
                style={{ width: "100%" }}
                showClear
              />
            </div>
            <div className="p-field" style={{ marginBottom: 18 }}>
              <label htmlFor="BAN_banco" style={{ fontWeight: 600, color: "#1B263B" }}>Banco</label>
              <Dropdown
                id="BAN_banco"
                name="BAN_banco"
                value={addFormData.BAN_banco}
                options={bancos.map(banco => ({
                  label: banco.BAN_Nombre || banco.BAN_banco,
                  value: banco.BAN_banco
                }))}
                onChange={handleAddChange}
                placeholder="Seleccione un banco"
                style={{ width: "100%" }}
                showClear
              />
            </div>
            <div className="p-field" style={{ marginBottom: 18 }}>
              <label htmlFor="CUB_saldo" style={{ fontWeight: 600, color: "#1B263B" }}>Saldo Inicial (GTQ)</label>
              <InputNumber
                id="CUB_saldo"
                name="CUB_saldo"
                value={addFormData.CUB_saldo}
                onValueChange={handleAddNumberChange}
                mode="decimal"
                min={0}
                step={0.01}
                showButtons
                placeholder="Saldo inicial"
                style={{ width: "100%" }}
                inputStyle={{ width: "100%" }}
              />
            </div>
            <Button type="submit" label="Agregar" className="p-button-success" loading={formLoading} style={{
              width: "100%", marginBottom: 10, fontWeight: 700, fontSize: 16, background: "#21B573"
            }} />
            <Button type="button" label="Cancelar" className="p-button-danger" onClick={() => setShowAddDialog(false)} style={{
              width: "100%", fontWeight: 700, fontSize: 16, background: "#D90429"
            }} />
          </div>
        </form>
      </Dialog>
      {/* Dialog Editar Cuenta - DISEÑO IGUAL A CARGA.JSX */}
      <Dialog
        header={null}
        visible={showEditDialog}
        style={{ width: "400px", borderRadius: 16 }}
        modal
        className="gcb-modal"
        onHide={() => setShowEditDialog(false)}
        footer={null}
        contentStyle={{ background: "#fff", borderRadius: 16, padding: 0 }}
        closable={false}
      >
        <form onSubmit={handleEditSubmit} autoComplete="off" style={{ padding: 0 }}>
          <div style={{ padding: 24 }}>
            <h2 style={{ color: "#0D1B2A", margin: "0 0 24px 0", fontWeight: 700, fontSize: 26, textAlign: "center" }}>
              Editar Cuenta Bancaria
            </h2>
            <div className="p-field" style={{ marginBottom: 18 }}>
              <label htmlFor="CUB_Nombre" style={{ fontWeight: 600, color: "#1B263B" }}>Nombre de la Cuenta</label>
              <InputText
                id="CUB_Nombre"
                name="CUB_Nombre"
                value={editFormData?.CUB_Nombre || ""}
                onChange={handleEditChange}
                placeholder="Nombre de la cuenta"
                style={{ width: "100%" }}
                autoFocus
              />
            </div>
            <div className="p-field" style={{ marginBottom: 18 }}>
              <label htmlFor="CUB_Numero" style={{ fontWeight: 600, color: "#1B263B" }}>Número de Cuenta</label>
              <InputText
                id="CUB_Numero"
                name="CUB_Numero"
                value={editFormData?.CUB_Numero || ""}
                onChange={handleEditChange}
                placeholder="Número de cuenta"
                style={{ width: "100%" }}
              />
            </div>
            <div className="p-field" style={{ marginBottom: 18 }}>
              <label htmlFor="TCP_Tipo_cuenta" style={{ fontWeight: 600, color: "#1B263B" }}>Tipo de Cuenta</label>
              <Dropdown
                id="TCP_Tipo_cuenta"
                name="TCP_Tipo_cuenta"
                value={editFormData?.TCP_Tipo_cuenta || ""}
                options={tiposCuenta.map(tipo => ({
                  label: tipo.TCP_Descripcion || tipo.TCP_Tipo_cuenta,
                  value: tipo.TCP_Tipo_cuenta
                }))}
                onChange={handleEditChange}
                placeholder="Seleccione tipo de cuenta"
                style={{ width: "100%" }}
                showClear
              />
            </div>
            <div className="p-field" style={{ marginBottom: 18 }}>
              <label htmlFor="MON_moneda" style={{ fontWeight: 600, color: "#1B263B" }}>Tipo de Moneda</label>
              <Dropdown
                id="MON_moneda"
                name="MON_moneda"
                value={editFormData?.MON_moneda || ""}
                options={monedas.map(moneda => ({
                  label: moneda.MON_nombre || moneda.MON_moneda,
                  value: moneda.MON_moneda
                }))}
                onChange={handleEditChange}
                placeholder="Seleccione un tipo de moneda"
                style={{ width: "100%" }}
                showClear
              />
            </div>
            <div className="p-field" style={{ marginBottom: 18 }}>
              <label htmlFor="BAN_banco" style={{ fontWeight: 600, color: "#1B263B" }}>Banco</label>
              <Dropdown
                id="BAN_banco"
                name="BAN_banco"
                value={editFormData?.BAN_banco || ""}
                options={bancos.map(banco => ({
                  label: banco.BAN_Nombre || banco.BAN_banco,
                  value: banco.BAN_banco
                }))}
                onChange={handleEditChange}
                placeholder="Seleccione un banco"
                style={{ width: "100%" }}
                showClear
              />
            </div>
            <div className="p-field" style={{ marginBottom: 18 }}>
              <label htmlFor="CUB_saldo" style={{ fontWeight: 600, color: "#1B263B" }}>Saldo Inicial (GTQ)</label>
              <InputNumber
                id="CUB_saldo"
                name="CUB_saldo"
                value={editFormData?.CUB_saldo || 0}
                mode="decimal"
                min={0}
                step={0.01}
                showButtons
                placeholder="Saldo inicial"
                style={{ width: "100%" }}
                inputStyle={{ width: "100%" }}
                disabled // SOLO LECTURA AL EDITAR
              />
            </div>
            <Button type="submit" label="Guardar" className="p-button-success" loading={formLoading} style={{
              width: "100%", marginBottom: 10, fontWeight: 700, fontSize: 16, background: "#21B573"
            }} />
            <Button type="button" label="Cancelar" className="p-button-danger" onClick={() => setShowEditDialog(false)} style={{
              width: "100%", fontWeight: 700, fontSize: 16, background: "#D90429"
            }} />
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default AccountsPage;
