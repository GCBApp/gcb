import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function ProcessCompensacion({ onCancel, onSuccess }) {
  const [compensacionData, setCompensacionData] = useState({
    COM_Compensacion: "",
    COM_Descripción: "",
    COM_Fecha: new Date().toISOString().split('T')[0],
    COM_Tipo: "",
    COM_Valor: 0
  });
  
  const [movimientos, setMovimientos] = useState([]);
  const [selectedMovimientos, setSelectedMovimientos] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Cargar todos los movimientos disponibles
  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/movimiento`);
        if (res.ok) {
          const data = await res.json();
          setMovimientos(data);
        } else {
          setErrorMessage("Error al cargar los movimientos");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar movimientos:", err);
        setErrorMessage("Error de conexión al cargar los movimientos");
        setLoading(false);
      }
    };
    
    fetchMovimientos();
  }, []);
  
  // Manejar cambios en el formulario de compensación
  const handleCompensacionChange = (e) => {
    setCompensacionData({
      ...compensacionData,
      [e.target.name]: e.target.value
    });
  };
  
  // Modifica la función handleMovimientoSelection
  const handleMovimientoSelection = (movimientoId) => {
    const cleanId = movimientoId.trim();
    // Usar .some con trim para comparar sin espacios
    const isSelected = selectedMovimientos.some(id => id.trim() === cleanId);
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedMovimientos.filter(id => id.trim() !== cleanId);
    } else {
      newSelection = [...selectedMovimientos, cleanId];
    }
    
    setSelectedMovimientos(newSelection);
    
    // Actualizar el valor total de la compensación
    const totalValue = calculateTotalValue(newSelection);
    setCompensacionData({
      ...compensacionData,
      COM_Valor: totalValue
    });
  };
  
  // Modifica la función calculateTotalValue
  const calculateTotalValue = (selectedIds) => {
    return selectedIds.reduce((total, id) => {
      // Buscar por ID recortando espacios
      const mov = movimientos.find(m => m.MOV_Movimiento.trim() === id.trim());
      return total + (mov ? parseFloat(mov.MOV_Valor || 0) : 0);
    }, 0);
  };
  
  // Modifica la función handleSubmit 
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedMovimientos.length === 0) {
      setErrorMessage("Debe seleccionar al menos un movimiento para compensar");
      return;
    }
    
    // Extraer el valor numérico de la compensación
    const numericCompensacionId = compensacionData.COM_Compensacion.replace(/\D/g, '');
    
    try {
      console.log("Enviando datos:", {
        compensacionData: {
          ...compensacionData,
          // Asegurarnos que este campo sea un valor numérico o string según su uso
          COM_Compensacion: compensacionData.COM_Compensacion
        },
        movimientosIds: selectedMovimientos
      });
      
      const res = await fetch(`${API_URL}/api/compensacion/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compensacionData,
          movimientosIds: selectedMovimientos
        })
      });
      
      if (res.ok) {
        onSuccess();
      } else {
        const errorData = await res.text();
        console.error("Error respuesta:", errorData);
        setErrorMessage(`Error al procesar la compensación: ${errorData}`);
      }
    } catch (err) {
      console.error("Error al procesar la compensación:", err);
      setErrorMessage("Error de conexión al procesar la compensación");
    }
  };
  
  // Formatear la fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };
  
  if (loading) {
    return <div>Cargando movimientos disponibles...</div>;
  }
  
  return (
    <div>
      <h2>Procesar Compensación</h2>
      {errorMessage && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <strong>{errorMessage}</strong>
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div>
          <label>Referencia de Compensación:</label>
          <input
            type="text"
            name="COM_Compensacion"
            value={compensacionData.COM_Compensacion}
            onChange={handleCompensacionChange}
            required
          />
        </div>
        
        <div>
          <label>Descripción:</label>
          <input
            type="text"
            name="COM_Descripción"
            value={compensacionData.COM_Descripción}
            onChange={handleCompensacionChange}
            required
          />
        </div>
        
        <div>
          <label>Fecha:</label>
          <input
            type="date"
            name="COM_Fecha"
            value={compensacionData.COM_Fecha}
            onChange={handleCompensacionChange}
            required
          />
        </div>
        
        <div>
          <label>Tipo:</label>
          <input
            type="text"
            name="COM_Tipo"
            value={compensacionData.COM_Tipo}
            onChange={handleCompensacionChange}
            required
          />
        </div>
        
        <div>
          <label>Valor Total:</label>
          <input
            type="number"
            name="COM_Valor"
            value={compensacionData.COM_Valor}
            readOnly
          />
        </div>
        
        <h3>Seleccionar Movimientos para Compensar</h3>
        <table border="1" style={{ width: "100%", marginTop: "20px", textAlign: "left" }}>
          <thead>
            <tr>
              <th>Seleccionar</th>
              <th>ID</th>
              <th>Descripción</th>
              <th>Valor</th>
              <th>Fecha</th>
              <th>Cuenta</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((item) => (
              <tr key={item.MOV_Movimiento}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedMovimientos.some(id => id.trim() === item.MOV_Movimiento.trim())}
                    onChange={() => handleMovimientoSelection(item.MOV_Movimiento)}
                  />
                </td>
                <td>{item.MOV_Movimiento}</td>
                <td>{item.MOV_Descripcion}</td>
                <td>{item.MOV_Valor}</td>
                <td>{formatDate(item.MOV_Fecha_Mov)}</td>
                <td>{item.CUB_NombreCompleto || item.CUB_Cuentabancaria}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ marginTop: "20px" }}>
          <button type="submit">Procesar Compensación</button>
          <button type="button" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default ProcessCompensacion;