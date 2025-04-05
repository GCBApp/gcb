import { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function EditEstado({ initialData, onCancel, onSuccess }) {
  const [formData, setFormData] = useState(initialData);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/estado/${formData.COM_Compensacion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      onSuccess(); // Llamar a la función de éxito para regresar a la tabla
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  return (
    <div>
      <h2>Editar Estado</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <div>
          <label>Referencia:</label>
          <input
            type="number"
            name="EST_Estado"
            value={formData.EST_Estado}
            onChange={handleChange}
            required
            disabled
          />
        </div>

        <div>
          <label>ID Movimiento:</label>
          <input
            type="number"
            name="MOV_movimiento"
            value={formData.MOV_movimiento}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>ID Compensación:</label>
          <input
            type="number"
            name="COM_Compensacion"
            value={formData.COM_Compensacion}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Descripción:</label>
          <input
            type="text"
            name="EST_descripcion"
            value={formData.EST_descripcion}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Actualizar</button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default EditEstado;
