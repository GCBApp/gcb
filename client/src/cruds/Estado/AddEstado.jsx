import { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AddEstado({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({ EST_Estado: "", MOV_movimiento: "", COM_Compensacion: "", EST_descripcion: ""});
  const [errorMessage, setErrorMessage] = useState("");

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/estado`, {
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
      console.error("Error al crear el estado", err);
      setErrorMessage("Ocurrió un error al intentar agregar el registro.");
    }
  };

  return (
    <div>
      <h2>Agregar Estado</h2>
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <strong>{errorMessage}</strong>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <div>
          <label>Referencia:</label>
          <input
            type="number"
            name="EST_Estado"
            value={formData.EST_Estado}
            onChange={handleChange}
            required
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
            name="EST_Descripcion"
            value={formData.EST_Descripcion}
            onChange={handleChange}
          />
        </div>

        
        <button type="submit">Agregar</button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default AddEstado;
