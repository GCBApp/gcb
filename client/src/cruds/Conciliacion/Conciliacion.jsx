import { useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function Conciliacion() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ /* campos de la tabla */ });
  const [editId, setEditId] = useState(null);

  const fetchItems = async () => {
    const res = await fetch(`${API_URL}/api/conciliacion`);
    setItems(await res.json());
  };

  useEffect(() => { fetchItems(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (editId) {
      await fetch(`${API_URL}/api/conciliacion/${editId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
      });
    } else {
      await fetch(`${API_URL}/api/conciliacion`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
      });
    }
    setForm({ /* campos vacíos */ });
    setEditId(null);
    fetchItems();
  };

  const handleEdit = item => {
    setForm({ ...item });
    setEditId(item.ID_CAMPO_PK);
  };

  const handleDelete = async id => {
    await fetch(`${API_URL}/api/conciliacion/${id}`, { method: "DELETE" });
    fetchItems();
  };

  return (
    <div>
      <h2>Conciliaciones</h2>
      <form onSubmit={handleSubmit}>
        {/* Inputs para cada campo */}
        <button type="submit">{editId ? "Actualizar" : "Agregar"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ /* campos vacíos */ }); }}>Cancelar</button>}
      </form>
      <table>
        <thead>
          <tr>
            {/* Encabezados */}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.ID_CAMPO_PK}>
              {/* Celdas */}
              <td>
                <button onClick={() => handleEdit(item)}>Editar</button>
                <button onClick={() => handleDelete(item.ID_CAMPO_PK)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Conciliacion;
