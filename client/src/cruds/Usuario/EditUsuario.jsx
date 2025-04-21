import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function EditUsuario({ initialData, onCancel, onSuccess }) {
  const [formData, setFormData] = useState(initialData);
  const [tiposUsuario, setTiposUsuario] = useState([]);

  useEffect(() => {
    const fetchTiposUsuario = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tipoUsuario`);
        const data = await res.json();
        setTiposUsuario(data);
      } catch (err) {
        console.error("Error al obtener los tipos de usuario:", err);
      }
    };
    fetchTiposUsuario();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/usuario/${formData.US_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      onSuccess();
    } catch (err) {
      console.error("Error al actualizar el usuario:", err);
    }
  };

  return (
    <div>
      <h2>Editar Usuario</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text" // Cambiado de "number" a "text" para reflejar Char(10)
          name="US_usuario"
          placeholder="ID Usuario"
          value={formData.US_usuario}
          onChange={handleChange}
          required
          disabled
        />
        <select
          name="TU_tipousuario"
          value={formData.TU_tipousuario}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un tipo de usuario</option>
          {tiposUsuario.map((tipo) => (
            <option key={tipo.TU_tipousuario} value={tipo.TU_tipousuario}>
              {tipo.TU_descripcion}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="US_nombre"
          placeholder="Nombre"
          value={formData.US_nombre}
          onChange={handleChange}
        />
        <input
          type="email"
          name="US_correo"
          placeholder="Correo"
          value={formData.US_correo}
          onChange={handleChange}
        />
        <input
          type="text" // Aquí también se configura el campo para ocultar los caracteres
          name="US_contraseña"
          placeholder="Contraseña"
          value={formData.US_contraseña}
          onChange={handleChange}
        />
        <button type="submit">Actualizar</button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default EditUsuario;
