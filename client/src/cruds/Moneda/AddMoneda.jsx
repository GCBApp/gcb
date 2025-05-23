import { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AddMoneda({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({ MON_moneda: "", MON_nombre: "", MON_Tipo_Compra: "", MON_Tipo_Venta: "", MON_id_Banguat: "" });
  const [errorMessage, setErrorMessage] = useState("");

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/moneda`, {
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
      console.error("Error al crear la moneda", err);
      setErrorMessage("Ocurrió un error al intentar agregar el registro.");
    }
  };

  return (
    <div>
      <h2>Agregar Moneda</h2>
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <strong>{errorMessage}</strong>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text" // Cambiado de "number" a "text" para reflejar Char(10)
          name="MON_moneda"
          placeholder="ID Moneda"
          value={formData.MON_moneda}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="MON_nombre"
          placeholder="Nombre"
          value={formData.MON_nombre}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="MON_Tipo_Compra"
          placeholder="Tipo de Compra"
          value={formData.MON_Tipo_Compra}
          onChange={handleChange}
          step="0.00001" // Permitir hasta 5 decimales
          required
        />
        <input
          type="number"
          name="MON_Tipo_Venta"
          placeholder="Tipo de Venta"
          value={formData.MON_Tipo_Venta}
          onChange={handleChange}
          step="0.00001" // Permitir hasta 5 decimales
          required
        />
        <input
          type="number"
          name="MON_id_Banguat"
          placeholder="ID Banguat"
          value={formData.MON_id_Banguat}
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

export default AddMoneda;
