import { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function EditBanco({ initialData, onCancel, onSuccess }) {
  const [formData, setFormData] = useState(initialData);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/bancos/${formData.BAN_bancos}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      onSuccess(); // Llamar a la función de éxito para regresar a la tabla
    } catch (err) {
      console.error("Error al actualizar el banco:", err);
    }
  };

  return (
    <div>
      <h2>Editar Banco</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="number"
          name="BAN_bancos"
          placeholder="ID Banco"
          value={formData.BAN_bancos}
          onChange={handleChange}
          required
          disabled
        />
        <input
          type="text"
          name="BAN_Nombre"
          placeholder="nombre"
          value={formData.BAN_Nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="BAN_Pais"
          placeholder="pais"
          value={formData.BAN_Pais}
          onChange={handleChange}
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

export default EditBanco;
