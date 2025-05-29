import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function EditMovimiento({ initialData, onCancel, onSuccess }) {
  const toast = useRef(null);
  const [cuentas, setCuentas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [formData, setFormData] = useState({ ...initialData });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCuentas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cuentasBancarias`);
        const data = await res.json();
        setCuentas(Array.isArray(data) ? data : []);
      } catch {
        setCuentas([]);
      }
    };
    const fetchTipos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tipoMovimiento`);
        const data = await res.json();
        setTipos(Array.isArray(data) ? data : []);
      } catch {
        setTipos([]);
      }
    };
    fetchCuentas();
    fetchTipos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    setFormData((prev) => ({ ...prev, MOV_Valor: e.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.MOV_Descripcion || !formData.MOV_Valor || !formData.MOV_Tipo || !formData.CUB_Cuentabancaria) {
      toast.current.show({ severity: "warn", summary: "Campos requeridos", detail: "Todos los campos son obligatorios.", life: 3000 });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/movimiento/${formData.MOV_Movimiento}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.current.show({ severity: "success", summary: "Movimiento actualizado", detail: "El movimiento fue actualizado correctamente.", life: 2000 });
        setTimeout(() => onSuccess && onSuccess(), 1200);
      } else {
        const errorText = await res.text();
        toast.current.show({ severity: "error", summary: "Error", detail: errorText, life: 3500 });
      }
    } catch {
      toast.current.show({ severity: "error", summary: "Error", detail: "Error al actualizar el movimiento.", life: 3500 });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fa", padding: "40px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Toast ref={toast} />
      <Card
        title="Editar Movimiento"
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: "0 2px 16px #e0e1dd",
          background: "#fff",
        }}
      >
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="p-field" style={{ marginBottom: 18 }}>
            <label htmlFor="MOV_Descripcion" style={{ fontWeight: 600, color: "#1B263B" }}>Descripción</label>
            <InputText
              id="MOV_Descripcion"
              name="MOV_Descripcion"
              value={formData.MOV_Descripcion}
              onChange={handleChange}
              placeholder="Descripción del movimiento"
              style={{ width: "100%" }}
              autoFocus
            />
          </div>
          <div className="p-field" style={{ marginBottom: 18 }}>
            <label htmlFor="MOV_Valor" style={{ fontWeight: 600, color: "#1B263B" }}>Valor</label>
            <InputNumber
              id="MOV_Valor"
              name="MOV_Valor"
              value={formData.MOV_Valor}
              onValueChange={handleNumberChange}
              mode="decimal"
              min={0}
              step={0.01}
              showButtons
              placeholder="Valor"
              style={{ width: "100%" }}
              inputStyle={{ width: "100%" }}
            />
          </div>
          <div className="p-field" style={{ marginBottom: 18 }}>
            <label htmlFor="MOV_Tipo" style={{ fontWeight: 600, color: "#1B263B" }}>Tipo de Movimiento</label>
            <Dropdown
              id="MOV_Tipo"
              name="MOV_Tipo"
              value={formData.MOV_Tipo}
              options={tipos.map(tipo => ({
                label: tipo.TM_descripcion || tipo.TM_Tipomovimiento,
                value: tipo.TM_Tipomovimiento
              }))}
              onChange={handleChange}
              placeholder="Seleccione tipo de movimiento"
              style={{ width: "100%" }}
              showClear
            />
          </div>
          <div className="p-field" style={{ marginBottom: 18 }}>
            <label htmlFor="CUB_Cuentabancaria" style={{ fontWeight: 600, color: "#1B263B" }}>Cuenta Bancaria</label>
            <Dropdown
              id="CUB_Cuentabancaria"
              name="CUB_Cuentabancaria"
              value={formData.CUB_Cuentabancaria}
              options={cuentas.map(cuenta => ({
                label: cuenta.CUB_Nombre || cuenta.CUB_Cuentabancaria,
                value: cuenta.CUB_Cuentabancaria
              }))}
              onChange={handleChange}
              placeholder="Seleccione una cuenta"
              style={{ width: "100%" }}
              showClear
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 18 }}>
            <Button type="button" label="Cancelar" className="p-button-secondary" onClick={onCancel} disabled={loading} />
            <Button type="submit" label="Guardar" className="p-button-success" loading={loading} />
          </div>
        </form>
      </Card>
    </div>
  );
}

export default EditMovimiento;
