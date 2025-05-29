import React, { useEffect, useState, useRef, useCallback } from "react";
import AddCompensacion from "./AddCompensacion";
import { Toast } from "primereact/toast";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AddCarga({ onCancel, onSuccess, initialData = {}, isReadOnly = false }) {
  // Estados principales
  const [cuentasBancarias, setCuentasBancarias] = useState([]);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [formData, setFormData] = useState({
    MOV_Referencia: "",
    MON_Moneda: "",
    TM_Tipomovimiento: "",
    CUB_Cuentabancaria: "",
    MOV_Descripcion: "",
    MOV_Fecha_Documento: "",
    MOV_Monto: "",
    US_usuario: "",
    ...initialData,
  });
  const [showCompensacionForm, setShowCompensacionForm] = useState(false);
  const [compensacionData, setCompensacionData] = useState(null);
  const [factor, setFactor] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const toast = useRef(null);

  // Obtención robusta del usuario autenticado
  const getActiveUser = useCallback(() => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
      if (!user) user = JSON.parse(localStorage.getItem("empleado"));
      if (!user && window && window.user) user = window.user;
      if (!user && sessionStorage.getItem("user")) user = JSON.parse(sessionStorage.getItem("user"));
      if (user && !user.US_Usuario && user.EMP_Usuario) user.US_Usuario = user.EMP_Usuario;
    } catch {}
    return user;
  }, []);
  const user = getActiveUser();

  // Cargar opciones de selects al montar
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [cuentasRes, tiposRes, monedasRes] = await Promise.all([
          fetch(`${API_URL}/api/cuentasBancarias`),
          fetch(`${API_URL}/api/tipoMovimiento`),
          fetch(`${API_URL}/api/moneda`)
        ]);
        setCuentasBancarias(await cuentasRes.json());
        const tipos = await tiposRes.json();
        setTiposMovimiento(tipos);
        // Deduplicar monedas por MON_moneda
        const monedasArr = await monedasRes.json();
        const monedasUnicas = Object.values(
          monedasArr.reduce((acc, m) => {
            if (!acc[m.MON_moneda]) acc[m.MON_moneda] = m;
            return acc;
          }, {})
        );
        setMonedas(monedasUnicas);
        // Si ya hay tipo de movimiento seleccionado, setear factor
        if (formData.TM_Tipomovimiento) {
          const tipo = tipos.find(t => t.TM_Tipomovimiento === formData.TM_Tipomovimiento);
          setFactor(tipo?.factor === "resta" ? -1 : 1);
        }
      } catch (err) {
        setErrorMessage("Error al cargar opciones de formulario.");
      }
    };
    fetchOptions();
    // eslint-disable-next-line
  }, []);

  // Actualizar factor cuando cambia el tipo de movimiento
  useEffect(() => {
    if (formData.TM_Tipomovimiento && tiposMovimiento.length > 0) {
      const tipo = tiposMovimiento.find(t => t.TM_Tipomovimiento === formData.TM_Tipomovimiento);
      // Usar siempre TM_Factor (de la BD) para decidir el signo
      if (tipo && typeof tipo.TM_Factor !== 'undefined') {
        setFactor((tipo.TM_Factor || '').toLowerCase() === 'resta' ? -1 : 1);
      } else {
        setFactor(1); // Por defecto suma
      }
    }
  }, [formData.TM_Tipomovimiento, tiposMovimiento]);

  // Setear usuario automáticamente
  useEffect(() => {
    if (user && user.US_Usuario) {
      setFormData((prev) => ({ ...prev, US_usuario: user.US_Usuario }));
    }
  }, [user]);

  // Estilos reutilizables
  const labelStyle = {
    display: "block",
    fontWeight: 600,
    color: "#1B263B",
    marginBottom: 6,
    marginTop: 12,
    fontSize: 15,
    letterSpacing: 0.2,
  };
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1.5px solid #415A77",
    borderRadius: 7,
    fontSize: 15,
    marginBottom: 2,
    background: "#F7F7F7",
    color: "#1B263B",
    outline: "none",
    transition: "border 0.2s",
    boxSizing: "border-box",
  };
  const selectStyle = { ...inputStyle };
  const headerStyle = { color: "#1B263B", fontWeight: 700, marginBottom: 18, textAlign: "center" };
  const formContainerStyle = { backgroundColor: "#fff", padding: "20px", borderRadius: 10, boxShadow: "0 2px 8px rgba(13,27,42,0.08)", maxWidth: 400, margin: "0 auto" };
  const overlayStyle = { minHeight: "100vh", width: "100vw", background: "linear-gradient(rgba(13,27,42,0.85), rgba(13,27,42,0.85))", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, position: "fixed", top: 0, left: 0, zIndex: 1000 };

  // Manejo de cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validación de campos obligatorios
  const validateForm = () => {
    if (!formData.MOV_Referencia || !formData.MON_Moneda || !formData.TM_Tipomovimiento || !formData.CUB_Cuentabancaria || !formData.MOV_Descripcion || !formData.MOV_Fecha_Documento || formData.MOV_Monto === "") {
      setErrorMessage("Todos los campos son obligatorios.");
      return false;
    }
    if (!formData.US_usuario) {
      setErrorMessage("No se detectó usuario autenticado. Vuelva a iniciar sesión.");
      return false;
    }
    if (Number(formData.MOV_Monto) <= 0 || isNaN(Number(formData.MOV_Monto))) {
      setErrorMessage("El valor debe ser un número positivo.");
      return false;
    }
    return true;
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    setErrorMessage("");
    let usuarioFinal = formData.US_usuario;
    const usuarioActivo = getActiveUser();
    if (!usuarioFinal && usuarioActivo && usuarioActivo.US_Usuario) usuarioFinal = usuarioActivo.US_Usuario;
    if (!usuarioFinal && usuarioActivo && usuarioActivo.EMP_Usuario) usuarioFinal = usuarioActivo.EMP_Usuario;
    setFormData((prev) => ({ ...prev, US_usuario: usuarioFinal }));
    if (!validateForm()) return;
    // Determinar naturaleza del movimiento según factor
    let processedValue = Math.abs(Number(formData.MOV_Monto));
    if (factor < 0) processedValue = -processedValue;
    try {
      const payload = {
        MOV_Referencia: formData.MOV_Referencia,
        US_usuario: usuarioFinal,
        MON_Moneda: formData.MON_Moneda,
        TM_Tipomovimiento: formData.TM_Tipomovimiento,
        CUB_Cuentabancaria: formData.CUB_Cuentabancaria,
        MOV_Descripcion: formData.MOV_Descripcion,
        MOV_Fecha_Documento: formData.MOV_Fecha_Documento,
        MOV_Monto: processedValue
      };
      const res = await fetch(`${API_URL}/api/movimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        toast.current?.show({ severity: "success", summary: "Éxito", detail: "Movimiento creado exitosamente.", life: 3000 });
        setCompensacionData({
          COM_Compensacion: `CM${data.MOV_Movimiento}`,
          COM_Descripción: `Compensación para movimiento ${data.MOV_Movimiento}`,
          COM_Fecha: new Date().toISOString().split("T")[0],
          COM_Tipo: "Automática",
          COM_Valor: processedValue,
        });
        setShowCompensacionForm(true);
        // --- REFRESCAR LISTA EN PARENT ---
        if (typeof onSuccess === 'function') onSuccess();
      } else {
        const errorText = await res.text();
        setErrorMessage(errorText || "Error al crear el movimiento.");
      }
    } catch (err) {
      setErrorMessage("Error al enviar el movimiento. Por favor, intente nuevamente.");
    }
  };

  // Callbacks para compensación
  const handleCompensacionCancel = () => {
    setShowCompensacionForm(false);
    onSuccess();
  };
  const handleCompensacionSuccess = () => {
    toast.current?.show({ severity: "success", summary: "Éxito", detail: "Compensación creada exitosamente.", life: 3000 });
    setShowCompensacionForm(false);
    onSuccess();
  };

  // Renderizado de formulario o compensación
  if (showCompensacionForm) {
    return (
      <>
        <Toast ref={toast} position="top-right" />
        <AddCompensacion
          initialData={compensacionData}
          onCancel={handleCompensacionCancel}
          onSuccess={handleCompensacionSuccess}
        />
      </>
    );
  }

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <div style={overlayStyle}>
        <div style={formContainerStyle}>
          <h2 style={headerStyle}>{isReadOnly ? "Visualizar Movimiento" : "Nuevo Movimiento"}</h2>
          {errorMessage && (
            <div style={{ color: "#D90429", marginBottom: "10px", textAlign: "center", minHeight: 24 }}>
              <strong>{errorMessage}</strong>
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ marginBottom: "20px", maxWidth: 350, margin: "0 auto" }} autoComplete="off">
            <label style={labelStyle}>Referencia de Movimiento</label>
            <input
              type="text"
              name="MOV_Referencia"
              placeholder="Referencia"
              value={formData.MOV_Referencia}
              onChange={handleChange}
              required
              style={inputStyle}
              readOnly={isReadOnly}
              maxLength={50}
            />
            <label style={labelStyle}>Descripción</label>
            <input
              type="text"
              name="MOV_Descripcion"
              placeholder="Descripción"
              value={formData.MOV_Descripcion}
              onChange={handleChange}
              style={inputStyle}
              readOnly={isReadOnly}
              required={!isReadOnly}
              maxLength={100}
            />
            <label style={labelStyle}>Cuenta Bancaria</label>
            {isReadOnly ? (
              <input
                type="text"
                value={cuentasBancarias.find((cuenta) => cuenta.CUB_Cuentabancaria === formData.CUB_Cuentabancaria)?.CUB_Nombre || ""}
                style={inputStyle}
                readOnly
              />
            ) : (
              <select
                name="CUB_Cuentabancaria"
                value={formData.CUB_Cuentabancaria}
                onChange={handleChange}
                style={selectStyle}
                required
              >
                <option value="">Seleccione una cuenta</option>
                {cuentasBancarias.map((cuenta) => (
                  <option key={cuenta.CUB_Cuentabancaria} value={cuenta.CUB_Cuentabancaria}>
                    {cuenta.CUB_Nombre}
                  </option>
                ))}
              </select>
            )}
            <label style={labelStyle}>Tipo Movimiento</label>
            {isReadOnly ? (
              <input
                type="text"
                value={tiposMovimiento.find((tipo) => tipo.TM_Tipomovimiento === formData.TM_Tipomovimiento)?.TM_descripcion || ""}
                style={inputStyle}
                readOnly
              />
            ) : (
              <select
                name="TM_Tipomovimiento"
                value={formData.TM_Tipomovimiento}
                onChange={handleChange}
                style={selectStyle}
                required
              >
                <option value="">Seleccione un tipo</option>
                {tiposMovimiento.map((tipo) => (
                  <option key={tipo.TM_Tipomovimiento} value={tipo.TM_Tipomovimiento}>
                    {tipo.TM_descripcion}
                  </option>
                ))}
              </select>
            )}
            <label style={labelStyle}>Moneda</label>
            {isReadOnly ? (
              <input
                type="text"
                value={monedas.find((moneda) => moneda.MON_moneda === formData.MON_Moneda)?.MON_nombre || ""}
                style={inputStyle}
                readOnly
              />
            ) : (
              <select
                name="MON_Moneda"
                value={formData.MON_Moneda}
                onChange={handleChange}
                style={selectStyle}
                required
              >
                <option value="">Seleccione una moneda</option>
                {monedas.map((moneda) => (
                  <option key={moneda.MON_moneda} value={moneda.MON_moneda}>
                    {moneda.MON_nombre}
                  </option>
                ))}
              </select>
            )}
            <input type="hidden" name="US_usuario" value={formData.US_usuario} />
            <label style={labelStyle}>Fecha Movimiento</label>
            <input
              type="date"
              name="MOV_Fecha_Documento"
              value={formData.MOV_Fecha_Documento}
              onChange={handleChange}
              style={inputStyle}
              readOnly={isReadOnly}
              required={!isReadOnly}
              max={new Date().toISOString().split("T")[0]}
            />
            <label style={labelStyle}>Valor</label>
            <input
              type="number"
              name="MOV_Monto"
              value={formData.MOV_Monto}
              onChange={handleChange}
              style={inputStyle}
              readOnly={isReadOnly}
              required={!isReadOnly}
              min={1}
              step={0.01}
            />
            {!isReadOnly && (
              <>
                <button type="submit" style={{ ...inputStyle, background: "#21B573", color: "#fff", fontWeight: 700, marginTop: 18, border: "none", cursor: "pointer" }}>Agregar</button>
                <button type="button" onClick={onCancel} style={{ ...inputStyle, background: "#D90429", color: "#fff", fontWeight: 700, marginTop: 10, border: "none", cursor: "pointer" }}>
                  Cancelar
                </button>
              </>
            )}
            {isReadOnly && (
              <button type="button" onClick={onCancel} style={{ ...inputStyle, background: "#415A77", color: "#fff", fontWeight: 700, marginTop: 18, border: "none", cursor: "pointer" }}>
                Cerrar
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default AddCarga;