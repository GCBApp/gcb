import { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AddCompensacion({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({ COM_Compensacion: "", COM_Descripción: "", COM_Fecha: "", COM_Tipo: "", COM_Valor: "" });
  const [errorMessage, setErrorMessage] = useState("");

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/compensacion`, {
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
      console.error("Error al crear la compensacion", err);
      setErrorMessage("Ocurrió un error al intentar agregar el registro.");
    }
  };

  return (
    <div>
      <h2>Agregar Compensacion</h2>
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
            name="COM_Valor"
            value={formData.COM_Valor}
            onChange={handleChange}
            required
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

export default AddCompensacion;
