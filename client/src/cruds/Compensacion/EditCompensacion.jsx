import { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function EditCompensacion({ initialData, onCancel, onSuccess }) {
  const [formData, setFormData] = useState(initialData);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/compensacion/${formData.COM_Compensacion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      onSuccess(); // Llamar a la función de éxito para regresar a la tabla
    } catch (err) {
      console.error("Error al actualizar compensación:", err);
    }
  };

  return (
    <div>
      <h2>Editar Compensación</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div>
          <label>Referencia:</label>
          <input
            type="text" // Asegúrate de que sea "text" para reflejar Char(10)
            name="COM_Compensacion"
            value={formData.COM_Compensacion}
            onChange={handleChange}
            required
            disabled
          />
        </div>

        <div>
          <label>Descripción:</label>
          <input
            type="text"
            name="COM_Descripción"
            value={formData.COM_Descripción}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Fecha:</label>
          <input
            type="date"
            name="COM_Fecha"
            value={formData.COM_Fecha}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Tipo:</label>
          <input
            type="text"
            name="COM_Tipo"
            value={formData.COM_Tipo}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Valor:</label>
          <input
            type="number"
            step="0.01"
            name="COM_Valor"
            value={formData.COM_Valor}
            onChange={handleChange}
            required
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

export default EditCompensacion;
