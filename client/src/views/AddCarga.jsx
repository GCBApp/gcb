import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AddCarga({ onCancel, onSuccess, initialData = {}, isReadOnly = false }) {
  const [cuentasBancarias, setCuentasBancarias] = useState([]);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    MOV_Movimiento: "",
    MOV_id: "",
    MON_Moneda: "",
    TM_Tipomovimiento: "",
    CUB_Cuentabancaria: "",
    MOV_Descripcion: "",
    MOV_Fecha_Mov: "",
    MOV_Valor: "",
    US_Usuario: "",
    MOV_Tipo: "DEBE",
    ...initialData,
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const cuentasRes = await fetch(`${API_URL}/api/cuentasBancarias`);
        const tiposRes = await fetch(`${API_URL}/api/tipoMovimiento`);
        const monedasRes = await fetch(`${API_URL}/api/moneda`);
        const usuariosRes = await fetch(`${API_URL}/api/usuario`);
        setCuentasBancarias(await cuentasRes.json());
        setTiposMovimiento(await tiposRes.json());
        setMonedas(await monedasRes.json());
        setUsuarios(await usuariosRes.json());
      } catch (err) {
        console.error("Error al cargar opciones:", err);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return; // No enviar datos si está en modo de solo lectura

    const processedValue =
      formData.MOV_Tipo === "HABER" ? -Math.abs(formData.MOV_Valor) : Math.abs(formData.MOV_Valor);

    try {
      const res = await fetch(`${API_URL}/api/movimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, MOV_Valor: processedValue }),
      });

      if (res.ok) {
        console.log("Movimiento creado exitosamente.");
        onSuccess();
      } else {
        const errorText = await res.text();
        console.error("Error al crear la carga:", errorText);
        alert(`Error al crear la carga: ${errorText}`);
      }
    } catch (err) {
      console.error("Error al enviar la carga:", err);
      alert("Error al enviar la carga. Por favor, intente nuevamente.");
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={formContainerStyle}>
        <h3 style={headerStyle}>{isReadOnly ? "Visualizar Movimiento" : "Nueva Carga"}</h3>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>ID de Movimiento:</label>
            <input
              type="text"
              name="MOV_Movimiento"
              placeholder="ID Movimiento (Llave primaria)"
              value={formData.MOV_Movimiento}
              onChange={handleChange}
              style={inputStyle}
              readOnly={isReadOnly}
              required={!isReadOnly}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Referencia de Movimiento:</label>
            <input
              type="text"
              name="MOV_id"
              placeholder="Referencia"
              value={formData.MOV_id}
              onChange={handleChange}
              style={inputStyle}
              readOnly={isReadOnly}
              required={!isReadOnly}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Descripción:</label>
            <input
              type="text"
              name="MOV_Descripcion"
              placeholder="Descripción"
              value={formData.MOV_Descripcion}
              onChange={handleChange}
              style={inputStyle}
              readOnly={isReadOnly}
              required={!isReadOnly}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Cuenta Bancaria:</label>
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
                style={inputStyle}
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
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Tipo Movimiento:</label>
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
                style={inputStyle}
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
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Moneda:</label>
            {isReadOnly ? (
              <input
                type="text"
                value={monedas.find((moneda) => moneda.MON_Moneda === formData.MON_moneda)?.MON_nombre || ""}
                style={inputStyle}
                readOnly
              />
            ) : (
              <select
                name="MON_Moneda"
                value={formData.MON_Moneda}
                onChange={handleChange}
                style={inputStyle}
                required
              >
                <option value="">Seleccione una moneda</option>
                {monedas.map((moneda) => (
                  <option key={moneda.MON_Moneda} value={moneda.MON_moneda}>
                    {moneda.MON_nombre}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Usuario:</label>
            {isReadOnly ? (
              <input
                type="text"
                value={usuarios.find((usuario) => usuario.US_Usuario === formData.US_usuario)?.US_nombre || ""}
                style={inputStyle}
                readOnly
              />
            ) : (
              <select
                name="US_Usuario"
                value={formData.US_Usuario}
                onChange={handleChange}
                style={inputStyle}
                required
              >
                <option value="">Seleccione un usuario</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.US_Usuario} value={usuario.US_usuario}>
                    {usuario.US_nombre}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Fecha Movimiento:</label>
            <input
              type="date"
              name="MOV_Fecha_Mov"
              value={formData.MOV_Fecha_Mov}
              onChange={handleChange}
              style={inputStyle}
              readOnly={isReadOnly}
              required={!isReadOnly}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Valor:</label>
            <input
              type="number"
              name="MOV_Valor"
              value={formData.MOV_Valor}
              onChange={handleChange}
              style={inputStyle}
              readOnly={isReadOnly}
              required={!isReadOnly}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Tipo de Valor:</label>
            <select
              name="MOV_Tipo"
              value={formData.MOV_Tipo}
              onChange={handleChange}
              style={inputStyle}
              disabled={isReadOnly}
              required={!isReadOnly}
            >
              <option value="DEBE">DEBE</option>
              <option value="HABER">HABER</option>
            </select>
          </div>
          <div style={buttonContainerStyle}>
            <button type="button" onClick={onCancel} style={cancelButtonStyle}>
              {isReadOnly ? "Cerrar" : "Cancelar"}
            </button>
            {!isReadOnly && (
              <button type="submit" style={buttonStyle}>
                Guardar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const formContainerStyle = {
  backgroundColor: "#fff",
  padding: "16px", // Reducido un 20% del padding original (20px -> 16px)
  borderRadius: "8px",
  width: "320px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const labelStyle = {
  fontSize: "14px",
  color: "#555",
};

const inputStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "14px",
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
};

const buttonStyle = {
  padding: "10px 20px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
  backgroundColor: "#1B263B", // Fondo verde personalizado para "Guardar"
  color: "#fff", // Texto blanco
  transition: "background-color 0.3s",
};

const cancelButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#778DA9", // Fondo naranja personalizado para "Cerrar"
};

const headerStyle = {
  textAlign: "center",
  color: "#333",
  marginBottom: "20px",
};

export default AddCarga;