import { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function EditMoneda({ initialData, onCancel, onSuccess }) {
  const [formData, setFormData] = useState(initialData);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/moneda/${formData.MON_moneda}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      onSuccess(); // Llamar a la función de éxito para regresar a la tabla
    } catch (err) {
      console.error("Error al actualizar la moneda:", err);
    }
  };

  return (
    <div>
      <h2>Editar Moneda</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text" // Cambiado de "number" a "text" para reflejar Char(10)
          name="MON_moneda"
          placeholder="ID Moneda"
          value={formData.MON_moneda}
          onChange={handleChange}
          required
          disabled
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
          name="MON_valor"
          placeholder="Valor"
          value={formData.MON_valor}
          onChange={handleChange}
          step="0.00001" // Permitir hasta 5 decimales
          required
        />
        <button type="submit">Actualizar</button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default EditMoneda;
