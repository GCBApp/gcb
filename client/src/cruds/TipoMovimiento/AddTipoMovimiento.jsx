import { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AddTipoMovimiento({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({ TM_Tipomovimiento: "", TM_descripcion: "" });
  const [errorMessage, setErrorMessage] = useState("");

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/tipoMovimiento`, {
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
      console.error("Error al crear el tipo de movimiento", err);
      setErrorMessage("Ocurrió un error al intentar agregar el registro.");
    }
  };

  return (
    <div>
      <h2>Agregar Tipo de Movimiento</h2>
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <strong>{errorMessage}</strong>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="number"
          name="TM_Tipomovimiento"
          placeholder="ID Tipo Movimiento"
          value={formData.TM_Tipomovimiento}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="TM_descripcion"
          placeholder="Descripción"
          value={formData.TM_descripcion}
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

export default AddTipoMovimiento;