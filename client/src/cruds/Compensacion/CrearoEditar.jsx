// src/components/CompensacionForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const CompensacionForm = () => {
  const [form, setForm] = useState({
    COM_Descripcion: "",
    COM_Fecha: "",
    COM_Tipo: "",
    COM_Valor: ""
  });

  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      axios.get(`http://localhost:3000/api/compensacion/${id}`).then((res) => {
        setForm(res.data);
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
      await axios.put(`http://localhost:3000/api/compensacion/${id}`, form);
    } else {
      await axios.post("http://localhost:3000/api/compensacion", form);
    }
    navigate("/");
  };

  return (
    <div>
      <h2>{isEdit ? "Editar" : "Crear"} Compensación</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Descripción:
          <input name="COM_Descripcion" value={form.COM_Descripcion} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Fecha:
          <input type="date" name="COM_Fecha" value={form.COM_Fecha?.substring(0, 10)} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Tipo:
          <input name="COM_Tipo" value={form.COM_Tipo} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Valor:
          <input type="number" name="COM_Valor" step="0.01" value={form.COM_Valor} onChange={handleChange} required />
        </label>
        <br />
        <button type="submit">{isEdit ? "Actualizar" : "Crear"}</button>
      </form>
    </div>
  );
};

export default CompensacionForm;