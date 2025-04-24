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

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Objeto para almacenar todos los datos crudos para diagnóstico
        const rawData = {};
        
        try {
          // Obtener tipos de movimiento
          console.log("Obteniendo tipos de movimiento...");
          const resTipos = await fetch(`${API_URL}/api/tipoMovimiento`);
          if (!resTipos.ok) throw new Error(`Error al obtener tipos de movimiento: ${resTipos.status}`);
          
          const dataTipos = await resTipos.json();
          rawData.tiposMovimiento = dataTipos;
          console.log("Tipos de movimiento obtenidos:", dataTipos);
          
          // Procesar tipos de movimiento para agregar parte numérica
          const tiposMovimientoProcesados = dataTipos.map(tm => {
            // Verificar que el formato del ID sea el esperado
            if (!tm.TM_Tipomovimiento || typeof tm.TM_Tipomovimiento !== 'string') {
              console.warn("Tipo de movimiento con ID inválido:", tm);
              return { ...tm, numericId: null };
            }
            
            const numericId = tm.TM_Tipomovimiento.match(/\d+/);
            return {
              ...tm,
              numericId: numericId ? parseInt(numericId[0]) : null
            };
          }).filter(tm => tm.numericId !== null);
          
          setTiposMovimiento(tiposMovimientoProcesados);
        } catch (err) {
          console.error("Error procesando tipos de movimiento:", err);
          setErrorMessage(`Error al cargar tipos de movimiento: ${err.message}`);
          setLoading(false);
          return; // Detener la carga si falla
        }
        
        try {
          // Obtener cuentas bancarias
          console.log("Obteniendo cuentas bancarias...");
          const resCuentas = await fetch(`${API_URL}/api/cuentasBancarias`);
          if (!resCuentas.ok) throw new Error(`Error al obtener cuentas bancarias: ${resCuentas.status}`);
          
          const dataCuentas = await resCuentas.json();
          rawData.cuentasBancarias = dataCuentas;
          console.log("Cuentas bancarias de la BD:", dataCuentas);
          
          // Procesar cuentas bancarias para agregar parte numérica
          const cuentasBancariasProcesadas = dataCuentas.map(cb => {
            if (!cb.CUB_Cuentabancaria || typeof cb.CUB_Cuentabancaria !== 'string') {
              console.warn("Cuenta bancaria con ID inválido:", cb);
              return { ...cb, numericId: null };
            }
            
            const numericId = cb.CUB_Cuentabancaria.match(/\d+/);
            return {
              ...cb,
              numericId: numericId ? parseInt(numericId[0]) : null
            };
          }).filter(cb => cb.numericId !== null);
          
          setCuentasBancarias(cuentasBancariasProcesadas);
        } catch (err) {
          console.error("Error procesando cuentas bancarias:", err);
          setErrorMessage(`Error al cargar cuentas bancarias: ${err.message}`);
          setLoading(false);
          return;
        }
        
        try {
          // Obtener monedas
          console.log("Obteniendo monedas...");
          const resMonedas = await fetch(`${API_URL}/api/moneda`);
          if (!resMonedas.ok) throw new Error(`Error al obtener monedas: ${resMonedas.status}`);
          
          const dataMonedas = await resMonedas.json();
          rawData.monedas = dataMonedas;
          console.log("Monedas de la BD:", dataMonedas);
          
          // Procesar monedas para agregar parte numérica
          const monedasProcesadas = dataMonedas.map(m => {
            if (!m.MON_moneda || typeof m.MON_moneda !== 'string') {
              console.warn("Moneda con ID inválido:", m);
              return { ...m, numericId: null };
            }
            
            const numericId = m.MON_moneda.match(/\d+/);
            return {
              ...m,
              numericId: numericId ? parseInt(numericId[0]) : null
            };
          }).filter(m => m.numericId !== null);
          
          setMonedas(monedasProcesadas);
        } catch (err) {
          console.error("Error procesando monedas:", err);
          setErrorMessage(`Error al cargar monedas: ${err.message}`);
          setLoading(false);
          return;
        }
        
        try {
          // Obtener usuarios
          console.log("Obteniendo usuarios...");
          const resUsuarios = await fetch(`${API_URL}/api/usuario`);
          if (!resUsuarios.ok) throw new Error(`Error al obtener usuarios: ${resUsuarios.status}`);
          
          const dataUsuarios = await resUsuarios.json();
          rawData.usuarios = dataUsuarios;
          console.log("Usuarios de la BD:", dataUsuarios);
          
          // Filtrar usuarios válidos y añadir propiedad numérica
          const usuariosValidos = dataUsuarios.filter(u => u.US_usuario).map(u => {
            if (typeof u.US_usuario !== 'string') {
              console.warn("Usuario con ID inválido:", u);
              return { ...u, numericId: null };
            }
            
            const numericId = u.US_usuario.match(/\d+/);
            return {
              ...u,
              numericId: numericId ? parseInt(numericId[0]) : null
            };
          }).filter(u => u.numericId !== null);
          
          setUsuarios(usuariosValidos);
        } catch (err) {
          console.error("Error procesando usuarios:", err);
          setErrorMessage(`Error al cargar usuarios: ${err.message}`);
          setLoading(false);
          return;
        }
        
        // Si llegamos hasta aquí, todo se cargó correctamente
        console.log("Todos los datos cargados correctamente:", rawData);
        setLoading(false);
      } catch (err) {
        console.error("Error general al cargar datos relacionados:", err);
        setErrorMessage("Error al cargar los datos. Por favor, intente nuevamente.");
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // El resto del componente permanece igual
  
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

      console.log("Datos a enviar:", dataToSend);
      
      const res = await fetch(`${API_URL}/api/movimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (res.ok) {
        onSuccess(); // Regresar a la tabla
      } else {
        const errorData = await res.text();
        console.error("Error respuesta del servidor:", errorData);
        setErrorMessage(errorData);
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
                {moneda.MON_nombre} ({moneda.MON_moneda})
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
            {usuarios && usuarios.length > 0 ? (
              usuarios.map((usuario) => (
                <option key={usuario.US_usuario} value={usuario.numericId}>
                  {usuario.US_nombre} ({usuario.US_usuario})
                </option>
              ))
            ) : (
              <option disabled>No hay usuarios disponibles</option>
            )}
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