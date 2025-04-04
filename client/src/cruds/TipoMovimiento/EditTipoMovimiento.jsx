import { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function EditTipoMovimiento({ initialData, onCancel, onSuccess }) {
  const [formData, setFormData] = useState(initialData);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/tipoMovimiento/${formData.TM_Tipomovimiento}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      onSuccess(); // Llamar a la función de éxito para regresar a la tabla
    } catch (err) {
      console.error("Error al actualizar el tipo de movimiento:", err);
    }
  };

  return (
    <div>
      <h2>Editar Tipo de Movimiento</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="number"
          name="TM_Tipomovimiento"
          placeholder="ID Tipo Movimiento"
          value={formData.TM_Tipomovimiento}
          onChange={handleChange}
          required
          disabled
        />
        <input
          type="text"
          name="TM_descripcion"
          placeholder="Descripción"
          value={formData.TM_descripcion}
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

export default EditTipoMovimiento;