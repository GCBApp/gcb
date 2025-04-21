import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AddUsuario({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({ US_usuario: "", TU_tipousuario: "", US_nombre: "", US_correo: "", US_contraseña: "" });
  const [errorMessage, setErrorMessage] = useState("");
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
      const res = await fetch(`${API_URL}/api/usuario`, {
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
      console.error("Error al crear el usuario", err);
      setErrorMessage("Ocurrió un error al intentar agregar el registro.");
    }
  };

  return (
    <div>
      <h2>Agregar Usuario</h2>
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <strong>{errorMessage}</strong>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text" // Cambiado de "number" a "text" para reflejar Char(10)
          name="US_usuario"
          placeholder="ID Usuario"
          value={formData.US_usuario}
          onChange={handleChange}
          required
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
          type="text" // Aquí se configura el campo para ocultar los caracteres
          name="US_contraseña"
          placeholder="Contraseña"
          value={formData.US_contraseña}
          onChange={handleChange}
        />
        <button type="submit">Agregar</button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default AddUsuario;
