import { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function EditCuentaBancaria({ initialData, onCancel, onSuccess }) {
  const [formData, setFormData] = useState(initialData);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/cuentasBancarias/${formData.CUB_Cuentabancaria}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      onSuccess(); // Llamar a la función de éxito para regresar a la tabla
    } catch (err) {
      console.error("Error al actualizar la cuenta:", err);
    }
  };

  return (
    <div>
      <h2>Editar Cuenta Bancaria</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="number"
          name="CUB_Cuentabancaria"
          placeholder="ID cuenta"
          value={formData.CUB_Cuentabancaria}
          onChange={handleChange}
          required
          disabled
        />
        <input
          type="text"
          name="CUB_Nombre"
          placeholder="nombre"
          value={formData.CUB_Nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="CUB_Tipo"
          placeholder="tipo"
          value={formData.CUB_Tipo}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="BAN_banco"
          placeholder="banco"
          value={formData.BAN_banco}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="MON_moneda"
          placeholder="moneda"
          value={formData.MON_moneda}
          onChange={handleChange}
          required
        />
        
        <input
          type="number"
          name="CUB_Número"
          placeholder="Número"
          value={formData.CUB_Número}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="CUB_saldo"
          placeholder="saldo"
          value={formData.CUB_saldo}
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

export default EditCuentaBancaria;
