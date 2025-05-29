import { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function TipoCuentaBancaria() {
  const [tipos, setTipos] = useState([]);
  const [form, setForm] = useState({ TCP_Tipo_cuenta: "", TCP_Descripcion: "" });
  const [editId, setEditId] = useState(null);

  const fetchTipos = async () => {
    const res = await fetch(`${API_URL}/api/tipoCuentaBancaria`);
    setTipos(await res.json());
  };

  useEffect(() => { fetchTipos(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (editId) {
      await fetch(`${API_URL}/api/tipoCuentaBancaria/${editId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
      });
    } else {
      await fetch(`${API_URL}/api/tipoCuentaBancaria`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
      });
    }
    setForm({ TCP_Tipo_cuenta: "", TCP_Descripcion: "" });
    setEditId(null);
    fetchTipos();
  };

  const handleEdit = tipo => {
    setForm({ TCP_Tipo_cuenta: tipo.TCP_Tipo_cuenta, TCP_Descripcion: tipo.TCP_Descripcion });
    setEditId(tipo.TCP_Tipo_cuenta);
  };

  const handleDelete = async id => {
    await fetch(`${API_URL}/api/tipoCuentaBancaria/${id}`, { method: "DELETE" });
    fetchTipos();
  };

  return (
    <div>
      <h2>Tipos de Cuenta Bancaria</h2>
      <form onSubmit={handleSubmit}>
        <input name="TCP_Tipo_cuenta" value={form.TCP_Tipo_cuenta} onChange={handleChange} placeholder="ID" required />
        <input name="TCP_Descripcion" value={form.TCP_Descripcion} onChange={handleChange} placeholder="Descripción" required />
        <button type="submit">{editId ? "Actualizar" : "Agregar"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ TCP_Tipo_cuenta: "", TCP_Descripcion: "" }); }}>Cancelar</button>}
      </form>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Descripción</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tipos.map(tipo => (
            <tr key={tipo.TCP_Tipo_cuenta}>
              <td>{tipo.TCP_Tipo_cuenta}</td>
              <td>{tipo.TCP_Descripcion}</td>
              <td>
                <button onClick={() => handleEdit(tipo)}>Editar</button>
                <button onClick={() => handleDelete(tipo.TCP_Tipo_cuenta)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default TipoCuentaBancaria;
