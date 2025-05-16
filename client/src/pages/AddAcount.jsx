import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AddAccount() {
  const navigate = useNavigate(); // Hook para redirigir a otra página
  const [bancos, setBancos] = useState([]);
    const [monedas, setMoneda] = useState([]); // Estado para almacenar la moneda
  const [formData, setFormData] = useState({
    CUB_Nombre: "",
    CUB_Número: "",
    CUB_Tipo: "",
    MON_moneda: "",
    BAN_banco: "",
    CUB_saldo: "",
  });

  useEffect(() => {
    const fetchBancos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/bancos`);
        const data = await res.json();
        setBancos(data);
      } catch (err) {
        console.error("Error al cargar bancos:", err);
      }
        
    };

    const fetchMonedas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/moneda`);
        const data = await res.json();
        setMoneda(data); // Guardar la moneda en el estado
      } catch (err) {
        console.error("Error al cargar monedas:", err);
      }

    };

    fetchBancos();
    fetchMonedas(); // Llamar a la función para cargar monedas
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/cuentasBancarias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        console.log("Cuenta bancaria creada exitosamente.");
        navigate("/accounts"); // Redirigir a AccountsPage después de guardar
      } else {
        const errorText = await res.text();
        console.error("Error al crear la cuenta bancaria:", errorText);
        alert(`Error al crear la cuenta bancaria: ${errorText}`);
      }
    } catch (err) {
      console.error("Error al enviar la cuenta bancaria:", err);
      alert("Error al enviar la cuenta bancaria. Por favor, intente nuevamente.");
    }
  };

  const handleCancel = () => {
    navigate("/accounts"); // Redirigir a AccountsPage al cancelar
  };

  return (
    <div style={overlayStyle}>
      <div style={formContainerStyle}>
        <h3 style={headerStyle}>Nueva Cuenta Bancaria</h3>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Nombre de la Cuenta:</label>
            <input
              type="text"
              name="CUB_Nombre"
              placeholder="Nombre de la cuenta"
              value={formData.CUB_Nombre}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Número de Cuenta:</label>
            <input
              type="text"
              name="CUB_Número"
              placeholder="Número de cuenta"
              value={formData.CUB_Número}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Tipo de Cuenta:</label>
            <select
              name="CUB_Tipo"
              value={formData.CUB_Tipo}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="">Seleccione un tipo</option>
              <option value="Ahorro">Ahorro</option>
              <option value="Corriente">Corriente</option>
            </select>
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Tipo de Moneda:</label>
            <select
                name="MON_moneda" // Corregido: debe coincidir con el estado
                value={formData.MON_moneda}
                onChange={handleChange}
                style={inputStyle}
                required
            >
                <option value="">Seleccione un tipo de moneda</option>
                {monedas.map((moneda) => (
                    <option key={moneda.MON_moneda} value={moneda.MON_moneda}>
                        {moneda.MON_nombre}
                    </option>
                ))}
            </select>
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Banco:</label>
            <select
              name="BAN_banco"
              value={formData.BAN_banco}
              onChange={handleChange}
              style={inputStyle}
              required
            >
              <option value="">Seleccione un banco</option>
              {bancos.map((banco) => (
                <option key={banco.BAN_banco} value={banco.BAN_bancos}>
                  {banco.BAN_Nombre}
                </option>
              ))}
            </select>
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Saldo Inicial (GTQ):</label>
            <input
              type="number"
              name="CUB_saldo"
              placeholder="Saldo inicial"
              value={formData.CUB_saldo}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
          <div style={buttonContainerStyle}>
            <button type="button" onClick={handleCancel} style={cancelButtonStyle}>
              Cancelar
            </button>
            <button type="submit" style={buttonStyle}>
              Guardar
            </button>
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
  backgroundColor: "rgba(13, 27, 42, 0.6)", // Más oscuro y con filtro azul
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const formContainerStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
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
  backgroundColor: "#1B263B",
  color: "#fff",
  transition: "background-color 0.3s",
};

const cancelButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#778DA9",
};

const headerStyle = {
  textAlign: "center",
  color: "#333",
  marginBottom: "20px",
};

export default AddAccount;