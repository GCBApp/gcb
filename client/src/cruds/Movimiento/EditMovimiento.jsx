import { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function EditMovimiento({ initialData, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    MOV_Movimiento: initialData.MOV_Movimiento || "",
    MOV_id: initialData.MOV_id || "",
    US_Usuario: initialData.US_Usuario || "",
    MON_Moneda: initialData.MON_Moneda || "",
    TM_Tipomovimiento: initialData.TM_Tipomovimiento || "",
    CUB_Cuentabancaria: initialData.CUB_Cuentabancaria || "",
    MOV_Descripcion: initialData.MOV_Descripcion || "",
    MOV_Fecha_Mov: initialData.MOV_Fecha_Mov || "",
    MOV_Valor: initialData.MOV_Valor || "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/movimiento/${formData.MOV_Movimiento}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const errorText = await res.text();
        setErrorMessage(errorText);
      }
    } catch (err) {
      console.error("Error al actualizar el movimiento:", err);
      setErrorMessage("Ocurrió un error al intentar actualizar el registro.");
    }
  };

  return (
    <div>
      <h2>Editar Movimiento</h2>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="MOV_Movimiento"
          value={formData.MOV_Movimiento}
          disabled
        />
        <input
          type="text"
          name="MOV_id"
          placeholder="Referencia"
          value={formData.MOV_id}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="US_Usuario"
          placeholder="Usuario"
          value={formData.US_Usuario}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="MON_Moneda"
          placeholder="Moneda"
          value={formData.MON_Moneda}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="TM_Tipomovimiento"
          placeholder="Tipo Movimiento"
          value={formData.TM_Tipomovimiento}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="CUB_Cuentabancaria"
          placeholder="Cuenta Bancaria"
          value={formData.CUB_Cuentabancaria}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="MOV_Descripcion"
          placeholder="Descripción"
          value={formData.MOV_Descripcion}
          onChange={handleChange}
        />
        <input
          type="datetime-local"
          name="MOV_Fecha_Mov"
          placeholder="Fecha Movimiento"
          value={formData.MOV_Fecha_Mov}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="MOV_Valor"
          placeholder="Valor"
          value={formData.MOV_Valor}
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

export default EditMovimiento;
