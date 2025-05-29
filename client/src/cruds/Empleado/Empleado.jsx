import { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Empleado() {
  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState({
    EMP_Empleado: "", EMP_Usuario: "", EMP_Contraseña: "", TU_tipousuario: "",
    EMP_Nombre: "", EMP_Apellido: "", EMP_Correo: "", EMP_Telefono: "", EMP_Direccion: ""
  });
  const [editId, setEditId] = useState(null);

  const fetchEmpleados = async () => {
    const res = await fetch(`${API_URL}/api/empleado`);
    setEmpleados(await res.json());
  };

  useEffect(() => { fetchEmpleados(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (editId) {
      await fetch(`${API_URL}/api/empleado/${editId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
      });
    } else {
      await fetch(`${API_URL}/api/empleado`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
      });
    }
    setForm({
      EMP_Empleado: "", EMP_Usuario: "", EMP_Contraseña: "", TU_tipousuario: "",
      EMP_Nombre: "", EMP_Apellido: "", EMP_Correo: "", EMP_Telefono: "", EMP_Direccion: ""
    });
    setEditId(null);
    fetchEmpleados();
  };

  const handleEdit = empleado => {
    setForm({ ...empleado });
    setEditId(empleado.EMP_Empleado);
  };

  const handleDelete = async id => {
    await fetch(`${API_URL}/api/empleado/${id}`, { method: "DELETE" });
    fetchEmpleados();
  };

  return (
    <div>
      <h2>Empleados</h2>
      <form onSubmit={handleSubmit}>
        <input name="EMP_Empleado" value={form.EMP_Empleado} onChange={handleChange} placeholder="ID" required />
        <input name="EMP_Usuario" value={form.EMP_Usuario} onChange={handleChange} placeholder="Usuario" required />
        <input name="EMP_Contraseña" value={form.EMP_Contraseña} onChange={handleChange} placeholder="Contraseña" required />
        <input name="TU_tipousuario" value={form.TU_tipousuario} onChange={handleChange} placeholder="Tipo Usuario" required />
        <input name="EMP_Nombre" value={form.EMP_Nombre} onChange={handleChange} placeholder="Nombre" required />
        <input name="EMP_Apellido" value={form.EMP_Apellido} onChange={handleChange} placeholder="Apellido" required />
        <input name="EMP_Correo" value={form.EMP_Correo} onChange={handleChange} placeholder="Correo" required />
        <input name="EMP_Telefono" value={form.EMP_Telefono} onChange={handleChange} placeholder="Teléfono" required />
        <input name="EMP_Direccion" value={form.EMP_Direccion} onChange={handleChange} placeholder="Dirección" required />
        <button type="submit">{editId ? "Actualizar" : "Agregar"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({
          EMP_Empleado: "", EMP_Usuario: "", EMP_Contraseña: "", TU_tipousuario: "",
          EMP_Nombre: "", EMP_Apellido: "", EMP_Correo: "", EMP_Telefono: "", EMP_Direccion: ""
        }); }}>Cancelar</button>}
      </form>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Usuario</th><th>Tipo</th><th>Nombre</th><th>Apellido</th><th>Correo</th><th>Teléfono</th><th>Dirección</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map(emp => (
            <tr key={emp.EMP_Empleado}>
              <td>{emp.EMP_Empleado}</td>
              <td>{emp.EMP_Usuario}</td>
              <td>{emp.TU_tipousuario}</td>
              <td>{emp.EMP_Nombre}</td>
              <td>{emp.EMP_Apellido}</td>
              <td>{emp.EMP_Correo}</td>
              <td>{emp.EMP_Telefono}</td>
              <td>{emp.EMP_Direccion}</td>
              <td>
                <button onClick={() => handleEdit(emp)}>Editar</button>
                <button onClick={() => handleDelete(emp.EMP_Empleado)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Empleado;
