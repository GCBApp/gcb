// Basado en AddUsuario.jsx, adaptado para empleado
import { useState } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AddEmpleado({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    EMP_Empleado: "",
    EMP_Usuario: "",
    EMP_Contraseña: "",
    TU_tipousuario: "",
    EMP_Nombre: "",
    EMP_Apellido: "",
    EMP_Correo: "",
    EMP_Telefono: "",
    EMP_Direccion: ""
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/empleado`, {
        method: "POST",
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
      setErrorMessage("Ocurrió un error al intentar agregar el registro.");
    }
  };

  return (
    <div>
      <h2>Agregar Empleado</h2>
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <strong>{errorMessage}</strong>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input type="text" name="EMP_Empleado" placeholder="ID Empleado" value={formData.EMP_Empleado} onChange={handleChange} required />
        <input type="text" name="EMP_Usuario" placeholder="Usuario" value={formData.EMP_Usuario} onChange={handleChange} required />
        <input type="password" name="EMP_Contraseña" placeholder="Contraseña" value={formData.EMP_Contraseña} onChange={handleChange} required />
        <input type="text" name="TU_tipousuario" placeholder="Tipo Usuario" value={formData.TU_tipousuario} onChange={handleChange} required />
        <input type="text" name="EMP_Nombre" placeholder="Nombre" value={formData.EMP_Nombre} onChange={handleChange} required />
        <input type="text" name="EMP_Apellido" placeholder="Apellido" value={formData.EMP_Apellido} onChange={handleChange} required />
        <input type="email" name="EMP_Correo" placeholder="Correo" value={formData.EMP_Correo} onChange={handleChange} required />
        <input type="text" name="EMP_Telefono" placeholder="Teléfono" value={formData.EMP_Telefono} onChange={handleChange} required />
        <input type="text" name="EMP_Direccion" placeholder="Dirección" value={formData.EMP_Direccion} onChange={handleChange} required />
        <button type="submit">Agregar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </form>
    </div>
  );
}

export default AddEmpleado;
