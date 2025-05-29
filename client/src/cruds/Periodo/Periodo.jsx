import { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Periodo() {
  const [periodos, setPeriodos] = useState([]);
  const [form, setForm] = useState({ PER_Periodo: "", PER_Fecha_inicio: "", PER_Fecha_final: "", PER_Estado: "" });
  const [editId, setEditId] = useState(null);

  const fetchPeriodos = async () => {
    const res = await fetch(`${API_URL}/api/periodo`);
    setPeriodos(await res.json());
  };

  useEffect(() => { fetchPeriodos(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (editId) {
      await fetch(`${API_URL}/api/periodo/${editId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
      });
    } else {
      await fetch(`${API_URL}/api/periodo`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
      });
    }
    setForm({ PER_Periodo: "", PER_Fecha_inicio: "", PER_Fecha_final: "", PER_Estado: "" });
    setEditId(null);
    fetchPeriodos();
  };

  const handleEdit = periodo => {
    setForm({ ...periodo });
    setEditId(periodo.PER_Periodo);
  };

  const handleDelete = async id => {
    await fetch(`${API_URL}/api/periodo/${id}`, { method: "DELETE" });
    fetchPeriodos();
  };

  return (
    <div>
      <h2>Periodos</h2>
      <form onSubmit={handleSubmit}>
        <input name="PER_Periodo" value={form.PER_Periodo} onChange={handleChange} placeholder="ID" required />
        <input name="PER_Fecha_inicio" value={form.PER_Fecha_inicio} onChange={handleChange} type="date" required />
        <input name="PER_Fecha_final" value={form.PER_Fecha_final} onChange={handleChange} type="date" required />
        <input name="PER_Estado" value={form.PER_Estado} onChange={handleChange} placeholder="Estado" required />
        <button type="submit">{editId ? "Actualizar" : "Agregar"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ PER_Periodo: "", PER_Fecha_inicio: "", PER_Fecha_final: "", PER_Estado: "" }); }}>Cancelar</button>}
      </form>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Inicio</th><th>Final</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {periodos.map(periodo => (
            <tr key={periodo.PER_Periodo}>
              <td>{periodo.PER_Periodo}</td>
              <td>{periodo.PER_Fecha_inicio}</td>
              <td>{periodo.PER_Fecha_final}</td>
              <td>{periodo.PER_Estado}</td>
              <td>
                <button onClick={() => handleEdit(periodo)}>Editar</button>
                <button onClick={() => handleDelete(periodo.PER_Periodo)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Periodo;
