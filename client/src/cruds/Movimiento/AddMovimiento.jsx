import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AddMovimiento({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    MOV_id: "",
    MOV_Descripcion: "",
    MOV_Valor: "",
    MOV_Fecha_Mov: new Date().toISOString().split('T')[0],
    MOV_Fecha_Registro: new Date().toISOString().split('T')[0],
    US_Usuario: "",
    MON_Moneda: "",
    TM_Tipomovimiento: "",
    CUB_Cuentabancaria: ""
  });
  
  const [errorMessage, setErrorMessage] = useState("");
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [cuentasBancarias, setCuentasBancarias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos relacionados
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        setLoading(true);
        
        // Obtener tipos de movimiento
        const resTipos = await fetch(`${API_URL}/api/tipoMovimiento`);
        const dataTipos = await resTipos.json();
        setTiposMovimiento(dataTipos);
        
        // Obtener cuentas bancarias
        const resCuentas = await fetch(`${API_URL}/api/cuentasBancarias`);
        const dataCuentas = await resCuentas.json();
        setCuentasBancarias(dataCuentas);
        
        // Obtener usuarios
        const resUsuarios = await fetch(`${API_URL}/api/usuario`);
        const dataUsuarios = await resUsuarios.json();
        setUsuarios(dataUsuarios);
        
        // Obtener monedas
        const resMonedas = await fetch(`${API_URL}/api/moneda`);
        const dataMonedas = await resMonedas.json();
        setMonedas(dataMonedas);
        
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos relacionados:", err);
        setErrorMessage("Error al cargar datos necesarios. Por favor, recargue la página.");
        setLoading(false);
      }
    };

    fetchRelatedData();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/movimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess(); // Regresar a la tabla
      } else {
        const errorText = await res.text();
        setErrorMessage(errorText);
      }
    } catch (err) {
      console.error("Error al crear el movimiento:", err);
      setErrorMessage("Ocurrió un error al intentar agregar el registro.");
    }
  };

  if (loading) {
    return <div>Cargando datos necesarios...</div>;
  }

  return (
    <div>
      <h2>Agregar Movimiento</h2>
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <strong>{errorMessage}</strong>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}>
        <div>
          <label>Referencia:</label>
          <input
            type="text"
            name="MOV_id"
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
            value={formData.MOV_Descripcion}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Valor:</label>
          <input
            type="number"
            step="0.01"
            name="MOV_Valor"
            value={formData.MOV_Valor}
            onChange={handleChange}
            required
          />
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
          <label>Tipo de Movimiento:</label>
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
                {cuenta.CUB_Numero || cuenta.CUB_Número} - {cuenta.CUB_Nombre}
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
          >
            <option value="">Seleccione una moneda</option>
            {monedas.map((moneda) => (
              <option key={moneda.MON_Moneda} value={moneda.MON_Moneda}>
                {moneda.MON_Nombre}
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
          >
            <option value="">Seleccione un usuario</option>
            {usuarios.map((usuario) => (
              <option key={usuario.US_Usuario} value={usuario.US_Usuario}>
                {usuario.US_Nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
          <button type="submit">Agregar</button>
          <button type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default AddMovimiento;