import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function EditMovimiento({ initialData, onCancel, onSuccess }) {
  // Manejo de fechas
  const formatDateForInput = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    // Si la fecha ya está en formato ISO o similar, extraer solo YYYY-MM-DD
    if (dateString.includes('T') || dateString.includes('-')) {
      return dateString.split('T')[0];
    }
    // Para otros formatos de fecha, convertir a Date y luego a string YYYY-MM-DD
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
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

  // Extraer ID numérico
  const extractNumericId = (id) => {
    if (id === null || id === undefined) return null;
    if (typeof id === 'number') return id;
    // Extraer solo los dígitos del string
    const match = String(id).match(/\d+/);
    return match ? parseInt(match[0]) : null;
  };
  
  // Cargar datos iniciales del movimiento
  useEffect(() => {
    if (initialData) {
      console.log("Datos iniciales para edición:", initialData);
      
      // Extraer IDs numéricos si tienen prefijos
      const userID = extractNumericId(initialData.US_Usuario);
      const monedaID = extractNumericId(initialData.MON_Moneda);
      const tipoMovID = extractNumericId(initialData.TM_Tipomovimiento);
      const cuentaID = extractNumericId(initialData.CUB_Cuentabancaria);
      
      setFormData({
        MOV_id: initialData.MOV_id?.trim() || "",
        MOV_Descripcion: initialData.MOV_Descripcion || "",
        MOV_Valor: initialData.MOV_Valor || "",
        MOV_Fecha_Mov: formatDateForInput(initialData.MOV_Fecha_Mov),
        MOV_Fecha_Registro: formatDateForInput(initialData.MOV_Fecha_Registro),
        US_Usuario: userID,
        MON_Moneda: monedaID, 
        TM_Tipomovimiento: tipoMovID,
        CUB_Cuentabancaria: cuentaID
      });
    }
  }, [initialData]);

  // Cargar datos relacionados y procesarlos
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        setLoading(true);
        
        // Obtener tipos de movimiento
        const resTipos = await fetch(`${API_URL}/api/tipoMovimiento`);
        const dataTipos = await resTipos.json();
        console.log("Tipos de movimiento:", dataTipos);
        
        // Procesarlos para extraer ID numérico
        const tiposMovimientoProcesados = dataTipos.map(tm => {
          const numericId = extractNumericId(tm.TM_Tipomovimiento);
          return {
            ...tm,
            numericId: numericId
          };
        });
        setTiposMovimiento(tiposMovimientoProcesados);
        
        // Obtener cuentas bancarias
        const resCuentas = await fetch(`${API_URL}/api/cuentasBancarias`);
        const dataCuentas = await resCuentas.json();
        
        // Procesarlas para extraer ID numérico
        const cuentasBancariasProcesadas = dataCuentas.map(cb => {
          const numericId = extractNumericId(cb.CUB_Cuentabancaria);
          return {
            ...cb,
            numericId: numericId
          };
        });
        setCuentasBancarias(cuentasBancariasProcesadas);
        
        // Obtener usuarios
        const resUsuarios = await fetch(`${API_URL}/api/usuario`);
        const dataUsuarios = await resUsuarios.json();
        
        // Procesarlos para extraer ID numérico
        const usuariosProcesados = dataUsuarios.map(u => {
          const numericId = extractNumericId(u.US_Usuario || u.US_usuario);
          return {
            ...u,
            numericId: numericId
          };
        });
        setUsuarios(usuariosProcesados);
        
        // Obtener monedas
        const resMonedas = await fetch(`${API_URL}/api/moneda`);
        const dataMonedas = await resMonedas.json();
        
        // Procesarlas para extraer ID numérico
        const monedasProcesadas = dataMonedas.map(m => {
          const numericId = extractNumericId(m.MON_moneda);
          return {
            ...m,
            numericId: numericId
          };
        });
        setMonedas(monedasProcesadas);
        
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
    const { name, value } = e.target;
    
    // Para los campos que requieren valor numérico, convertir a número
    if ((name === "US_Usuario" || name === "MON_Moneda" || 
         name === "TM_Tipomovimiento" || name === "CUB_Cuentabancaria") && value !== "") {
      const numValue = parseInt(value);
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Crear una copia para poder modificarla
      const dataToSend = { ...formData };
      
      // Asegurarse de que los campos sean números si tienen valor
      const numericFields = ["US_Usuario", "MON_Moneda", "TM_Tipomovimiento", "CUB_Cuentabancaria"];
      
      numericFields.forEach(field => {
        if (dataToSend[field] && typeof dataToSend[field] !== 'number') {
          dataToSend[field] = parseInt(dataToSend[field]);
        }
      });
      
      console.log("Datos a enviar para actualizar:", dataToSend);
      
      const res = await fetch(`${API_URL}/api/movimiento/${initialData.MOV_Movimiento}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (res.ok) {
        onSuccess(); // Regresar a la tabla
      } else {
        const errorText = await res.text();
        console.error("Error al actualizar:", errorText);
        setErrorMessage(errorText);
      }
    } catch (err) {
      console.error("Error al actualizar el movimiento:", err);
      setErrorMessage("Ocurrió un error al intentar actualizar el registro.");
    }
  };

  if (loading) {
    return <div>Cargando datos necesarios...</div>;
  }

  return (
    <div>
      <h2>Editar Movimiento</h2>
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <strong>{errorMessage}</strong>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "500px" }}>
        <div>
          <label>ID: {initialData.MOV_Movimiento}</label>
        </div>
        
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
              <option key={tipo.TM_Tipomovimiento} value={tipo.numericId}>
                {tipo.TM_descripcion} ({tipo.TM_Tipomovimiento})
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
              <option key={cuenta.CUB_Cuentabancaria} value={cuenta.numericId}>
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
              <option key={moneda.MON_moneda} value={moneda.numericId}>
                {moneda.MON_nombre || moneda.MON_Nombre} ({moneda.MON_moneda})
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
              <option key={usuario.US_Usuario || usuario.US_usuario} value={usuario.numericId}>
                {usuario.US_nombre || usuario.US_Nombre} ({usuario.US_Usuario || usuario.US_usuario})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
          <button type="submit">Actualizar</button>
          <button type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default EditMovimiento;