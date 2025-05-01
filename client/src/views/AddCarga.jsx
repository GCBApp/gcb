import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AddCarga({ onCancel, onSuccess }) {
  const [cuentasBancarias, setCuentasBancarias] = useState([]);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // Opciones de usuarios
  const [formData, setFormData] = useState({
    MOV_Movimiento: "",
    MOV_id: "",
    MON_Moneda: "",
    TM_Tipomovimiento: "",
    CUB_Cuentabancaria: "",
    MOV_Descripcion: "",
    MOV_Fecha_Mov: "",
    MOV_Valor: "",
    US_Usuario: "", // Usuario seleccionado
    MOV_Tipo: "DEBE",
  });

  // Obtener opciones de CuentaBancaria, TipoMovimiento, Moneda y Usuarios
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const cuentasRes = await fetch(`${API_URL}/api/cuentasBancarias`);
        const tiposRes = await fetch(`${API_URL}/api/tipoMovimiento`);
        const monedasRes = await fetch(`${API_URL}/api/moneda`);
        const usuariosRes = await fetch(`${API_URL}/api/usuario`); // Endpoint para obtener usuarios
        setCuentasBancarias(await cuentasRes.json());
        setTiposMovimiento(await tiposRes.json());
        setMonedas(await monedasRes.json());
        setUsuarios(await usuariosRes.json());
      } catch (err) {
        console.error("Error al cargar opciones:", err);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const processedValue =
      formData.MOV_Tipo === "HABER" ? -Math.abs(formData.MOV_Valor) : Math.abs(formData.MOV_Valor);


    try {
        const res = await fetch(`${API_URL}/api/movimiento`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({...formData, 
            MOV_Valor: processedValue,}),
        });
    
        if (res.ok) {
          console.log("Movimiento creado exitosamente.");
          onSuccess();
        } else {
          const errorText = await res.text();
          console.error("Error al crear la carga:", errorText);
          alert(`Error al crear la carga: ${errorText}`);
        }
      } catch (err) {
        console.error("Error al enviar la carga:", err);
        alert("Error al enviar la carga. Por favor, intente nuevamente.");
      }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Nueva Carga</h3>
      <div>
        <label>ID de Movimiento:</label>
        <input
          type="text"
          name="MOV_Movimiento"
          placeholder="ID Movimiento (Llave primaria)"
          value={formData.MOV_Movimiento}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Referencia de Movimiento:</label>
        <input
          type="text"
          name="MOV_id"
          placeholder="Referencia"
          value={formData.MOV_id}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Descripción:</label>
        <input
          type="text"
          name="MOV_Descripcion"
          placeholder="Descripción"
          value={formData.MOV_Descripcion}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Cuenta Bancaria:</label>
        <select
          name="CUB_Cuentabancaria"
          value={formData.CUB_Cuentabancaria}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione una cuenta</option>
          {cuentasBancarias.map((cuenta) => (
            <option key={cuenta.CUB_Cuentabancaria} value={cuenta.CUB_Cuentabancaria}>
              {cuenta.CUB_Nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Tipo Movimiento:</label>
        <select
          name="TM_Tipomovimiento"
          value={formData.TM_Tipomovimiento}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un tipo</option>
          {tiposMovimiento.map((tipo) => (
            <option key={tipo.TM_Tipomovimiento} value={tipo.TM_Tipomovimiento}>
              {tipo.TM_descripcion}
            </option>
          ))}
        </select>
      </div>
      <div>
  <label>Moneda:</label>
  <select
    name="MON_Moneda"
    value={formData.MON_Moneda}
    onChange={handleChange}
    required
  >
    <option value="">Seleccione una moneda</option>
    {monedas.map((moneda) => (
      <option key={moneda.MON_Moneda} value={moneda.MON_moneda}>
        {moneda.MON_nombre} {/* Mostrar el nombre de la moneda */}
      </option>
    ))}
  </select>
</div>
      <div>
        <label>Usuario:</label>
        <select
          name="US_Usuario"
          value={formData.US_Usuario}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un usuario</option>
          {usuarios.map((usuario) => (
            <option key={usuario.US_Usuario} value={usuario.US_usuario}>
              {usuario.US_nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Fecha Movimiento:</label>
        <input
          type="date"
          name="MOV_Fecha_Mov"
          value={formData.MOV_Fecha_Mov}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Valor:</label>
        <input
          type="number"
          name="MOV_Valor"
          value={formData.MOV_Valor}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Tipo de Valor:</label>
        <select
          name="MOV_Tipo"
          value={formData.MOV_Tipo}
          onChange={handleChange}
          required
        >
          <option value="DEBE">DEBE</option>
          <option value="HABER">HABER</option>
        </select>
      </div>
      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
}

export default AddCarga;