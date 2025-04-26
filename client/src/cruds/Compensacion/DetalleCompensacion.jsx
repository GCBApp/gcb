import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function DetalleCompensacion({ compensacionId, onClose }) {
  const [compensacion, setCompensacion] = useState(null);
  const [movimientosAsociados, setMovimientosAsociados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompensacionDetails = async () => {
      try {
        // Obtener datos de la compensación
        const compRes = await fetch(`${API_URL}/api/compensacion/${compensacionId}`);
        if (!compRes.ok) {
          setError("Error al obtener detalles de la compensación");
          setLoading(false);
          return;
        }
        const compData = await compRes.json();
        setCompensacion(compData);

        // Obtener movimientos asociados a través de la tabla ESTADO
        const estadosRes = await fetch(`${API_URL}/api/estado`);
        if (!estadosRes.ok) {
          setError("Error al obtener estados relacionados");
          setLoading(false);
          return;
        }
        const estadosData = await estadosRes.json();
        
        // Filtrar estados que están asociados a esta compensación
        const estadosRelacionados = estadosData.filter(est => 
          est.COM_Compensacion === compensacionId
        );
        
        // Obtener los IDs de movimientos asociados
        const movimientosIds = estadosRelacionados.map(est => est.MOV_movimiento);
        
        // Si hay movimientos asociados, obtener sus detalles
        if (movimientosIds.length > 0) {
          const movimientos = [];
          
          // Para cada ID de movimiento, obtener sus detalles
          for (const movId of movimientosIds) {
            const movRes = await fetch(`${API_URL}/api/movimiento/${movId}`);
            if (movRes.ok) {
              const movData = await movRes.json();
              movimientos.push(movData);
            }
          }
          
          setMovimientosAsociados(movimientos);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar detalles:", err);
        setError("Error de conexión al cargar los detalles");
        setLoading(false);
      }
    };

    fetchCompensacionDetails();
  }, [compensacionId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return <div>Cargando detalles de la compensación...</div>;
  }

  if (error) {
    return (
      <div>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
      <h2>Detalle de Compensación</h2>
      
      {compensacion ? (
        <div>
          <h3>Información de la Compensación</h3>
          <table border="1" style={{ width: "100%", marginTop: "20px", textAlign: "left" }}>
            <tbody>
              <tr>
                <td><strong>ID:</strong></td>
                <td>{compensacion.COM_Compensacion}</td>
              </tr>
              <tr>
                <td><strong>Descripción:</strong></td>
                <td>{compensacion.COM_Descripción}</td>
              </tr>
              <tr>
                <td><strong>Fecha:</strong></td>
                <td>{formatDate(compensacion.COM_Fecha)}</td>
              </tr>
              <tr>
                <td><strong>Tipo:</strong></td>
                <td>{compensacion.COM_Tipo}</td>
              </tr>
              <tr>
                <td><strong>Valor:</strong></td>
                <td>{compensacion.COM_Valor}</td>
              </tr>
            </tbody>
          </table>
          
          <h3>Movimientos Asociados</h3>
          {movimientosAsociados.length > 0 ? (
            <table border="1" style={{ width: "100%", marginTop: "20px", textAlign: "left" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descripción</th>
                  <th>Valor</th>
                  <th>Fecha</th>
                  <th>Cuenta Bancaria</th>
                </tr>
              </thead>
              <tbody>
                {movimientosAsociados.map((mov) => (
                  <tr key={mov.MOV_Movimiento}>
                    <td>{mov.MOV_Movimiento}</td>
                    <td>{mov.MOV_Descripcion}</td>
                    <td>{mov.MOV_Valor}</td>
                    <td>{formatDate(mov.MOV_Fecha_Mov)}</td>
                    <td>{mov.CUB_NombreCompleto || mov.CUB_Cuentabancaria}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay movimientos asociados a esta compensación.</p>
          )}
          
        </div>
      ) : (
        <p>No se encontró información para la compensación seleccionada.</p>
      )}
      
      <div style={{ marginTop: "20px" }}>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

export default DetalleCompensacion;