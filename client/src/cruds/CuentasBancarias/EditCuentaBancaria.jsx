import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function EditCuentaBancaria({ initialData, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({ ...initialData });
  const [tiposCuenta, setTiposCuenta] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchTiposCuenta = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tipoCuentaBancaria`);
        const data = await res.json();
        setTiposCuenta(Array.isArray(data) ? data : []);
      } catch (err) {
        setTiposCuenta([]);
      }
    };
    const fetchBancos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/bancos`);
        const data = await res.json();
        setBancos(Array.isArray(data) ? data : []);
      } catch (err) {
        setBancos([]);
      }
    };
    const fetchMonedas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/moneda`);
        const data = await res.json();
        setMonedas(Array.isArray(data) ? data : []);
      } catch (err) {
        setMonedas([]);
      }
    };
    fetchTiposCuenta();
    fetchBancos();
    fetchMonedas();
  }, []);

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

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.CUB_Nombre ||
      !formData.TCP_Tipo_cuenta ||
      !formData.BAN_banco ||
      !formData.MON_moneda ||
      !formData.CUB_Numero ||
      formData.CUB_saldo === ""
    ) {
      setErrorMessage("Todos los campos son obligatorios.");
      return;
    }
    if (isNaN(Number(formData.CUB_saldo))) {
      setErrorMessage("El saldo debe ser un número válido.");
      return;
    }
    try {
      await fetch(`${API_URL}/api/cuentasBancarias/${formData.CUB_Cuentabancaria}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          CUB_saldo: Number(formData.CUB_saldo),
        }),
      });
      onSuccess(); // Llamar a la función de éxito para regresar a la tabla
    } catch (err) {
      setErrorMessage("Error al actualizar la cuenta bancaria.");
      console.error("Error al actualizar la cuenta:", err, "Datos enviados:", formData);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fa", padding: "40px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 420, borderRadius: 16, boxShadow: "0 2px 16px #e0e1dd", background: "#fff" }}>
        <form onSubmit={handleSubmit} autoComplete="off" style={{ padding: 24 }}>
          <h2 style={{ color: "#1B263B", fontWeight: 700, margin: "0 0 24px 0", textAlign: "center", fontSize: 26 }}>Editar Cuenta Bancaria</h2>
          {errorMessage && (
            <div style={{ color: "#D90429", marginBottom: "10px", textAlign: "center" }}>
              <strong>{errorMessage}</strong>
            </div>
          )}
          <div className="p-field" style={{ marginBottom: 18 }}>
            <label htmlFor="CUB_Cuentabancaria" style={{ fontWeight: 600, color: "#1B263B" }}>ID cuenta</label>
            <input
              id="CUB_Cuentabancaria"
              name="CUB_Cuentabancaria"
              value={formData.CUB_Cuentabancaria}
              onChange={handleChange}
              placeholder="ID cuenta"
              style={{ width: "100%" }}
              required
              disabled
            />
          </div>
          <div className="p-field" style={{ marginBottom: 18 }}>
            <label htmlFor="CUB_Nombre" style={{ fontWeight: 600, color: "#1B263B" }}>Nombre de la Cuenta</label>
            <input
              id="CUB_Nombre"
              name="CUB_Nombre"
              value={formData.CUB_Nombre}
              onChange={handleChange}
              placeholder="Nombre de la cuenta"
              style={{ width: "100%" }}
              autoFocus
              required
            />
          </div>
          <div className="p-field" style={{ marginBottom: 18 }}>
            <label htmlFor="TCP_Tipo_cuenta" style={{ fontWeight: 600, color: "#1B263B" }}>Tipo de Cuenta</label>
            <select
              id="TCP_Tipo_cuenta"
              name="TCP_Tipo_cuenta"
              value={formData.TCP_Tipo_cuenta}
              onChange={handleChange}
              style={{ width: "100%" }}
              required
            >
              <option value="">Seleccione tipo de cuenta</option>
              {tiposCuenta.length === 0 && (
                <option disabled value="">Cargando tipos de cuenta...</option>
              )}
              {tiposCuenta.map((tipo) => (
                <option key={tipo.TCP_Tipo_cuenta} value={tipo.TCP_Tipo_cuenta}>
                  {tipo.TCP_Descripcion || tipo.TCP_Tipo_cuenta}
                </option>
              ))}
            </select>
          </div>
          <div className="p-field" style={{ marginBottom: 18 }}>
            <label htmlFor="BAN_banco" style={{ fontWeight: 600, color: "#1B263B" }}>Banco</label>
            <select
              id="BAN_banco"
              name="BAN_banco"
              value={formData.BAN_banco}
              onChange={handleChange}
              style={{ width: "100%" }}
              required
            >
              <option value="">Seleccione banco</option>
              {bancos.length === 0 && (
                <option disabled value="">Cargando bancos...</option>
              )}
              {bancos.map((banco) => (
                <option key={banco.BAN_banco} value={banco.BAN_banco}>
                  {banco.BAN_Nombre || banco.BAN_banco}
                </option>
              ))}
            </select>
          </div>
          <div className="p-field" style={{ marginBottom: 18 }}>
            <label htmlFor="MON_moneda" style={{ fontWeight: 600, color: "#1B263B" }}>Moneda</label>
            <select
              id="MON_moneda"
              name="MON_moneda"
              value={formData.MON_moneda}
              onChange={handleChange}
              style={{ width: "100%" }}
              required
            >
              <option value="">Seleccione moneda</option>
              {monedas.length === 0 && (
                <option disabled value="">Cargando monedas...</option>
              )}
              {monedas.map((moneda) => (
                <option key={moneda.MON_moneda} value={moneda.MON_moneda}>
                  {moneda.MON_nombre || moneda.MON_moneda}
                </option>
              ))}
            </select>
          </div>
          <div className="p-field" style={{ marginBottom: 18 }}>
            <label htmlFor="CUB_Numero" style={{ fontWeight: 600, color: "#1B263B" }}>Número de Cuenta</label>
            <input
              id="CUB_Numero"
              name="CUB_Numero"
              value={formData.CUB_Numero}
              onChange={handleChange}
              placeholder="Número de cuenta"
              style={{ width: "100%" }}
              required
            />
          </div>
          <div className="p-field" style={{ marginBottom: 18 }}>
            <label htmlFor="CUB_saldo" style={{ fontWeight: 600, color: "#1B263B" }}>Saldo Inicial (GTQ)</label>
            <input
              id="CUB_saldo"
              name="CUB_saldo"
              type="number"
              value={formData.CUB_saldo}
              onChange={handleChange}
              placeholder="Saldo inicial"
              style={{ width: "100%" }}
              required
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 18 }}>
            <button type="button" onClick={onCancel} style={{ width: "50%", background: "#D90429", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", padding: "10px 12px", borderRadius: 7, fontSize: 15 }}>Cancelar</button>
            <button type="submit" style={{ width: "50%", background: "#21B573", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", padding: "10px 12px", borderRadius: 7, fontSize: 15 }}>Actualizar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCuentaBancaria;
