import { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AddCuentaBancaria({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({ CUB_Cuentabancaria: "", CUB_Nombre: "", CUB_Tipo: "", BAN_banco: "", MON_moneda: "", CUB_Número: "", CUB_saldo: "" });
  const [errorMessage, setErrorMessage] = useState("");

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/cuentasBancarias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess(); // Llamar a la función de éxito para regresar a la tabla
      } else {
        const errorText = await res.text();
        setErrorMessage(errorText); // Mostrar el mensaje de error
      }
    } catch (err) {
      console.error("Error al crear la cuenta", err);
      setErrorMessage("Ocurrió un error al intentar agregar el registro.");
    }
  };

  return (
    <div>
      <h2>Agregar Cuenta Bancaria</h2>
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <strong>{errorMessage}</strong>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text" // Cambiado de "number" a "text" para reflejar Char(10)
          name="CUB_Cuentabancaria"
          placeholder="ID Cuenta"
          value={formData.CUB_Cuentabancaria}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="CUB_Nombre"
          placeholder="nombre"
          value={formData.CUB_Nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="CUB_Tipo"
          placeholder="tipo"
          value={formData.CUB_Tipo}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="BAN_banco"
          placeholder="banco"
          value={formData.BAN_banco}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="MON_moneda"
          placeholder="moneda"
          value={formData.MON_moneda}
          onChange={handleChange}
          required
        />
        
        <input
          type="number"
          name="CUB_Número"
          placeholder="Número"
          value={formData.CUB_Número}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="CUB_saldo"
          placeholder="saldo"
          value={formData.CUB_saldo}
          onChange={handleChange}
          required
        />
        <button type="submit">Agregar</button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default AddCuentaBancaria;
