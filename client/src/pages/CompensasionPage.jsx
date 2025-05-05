import React, { useState, useEffect, useRef } from "react";
import ProcessCompensacion from "../cruds/Compensacion/ProcessCompensacion";
import { Toast } from "primereact/toast"; // Asegúrate de tener PrimeReact importado
import Papa from "papaparse"; // Importar PapaParser

const CompensasionPage = () => {
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const toast = useRef(null);

  // Importar la fuente Open Sans
  useEffect(() => {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap';
    document.head.appendChild(linkElement);
    
    return () => {
      if (document.head.contains(linkElement)) {
        document.head.removeChild(linkElement);
      }
    };
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    toast.current.show({ severity: "info", summary: "Cargando", detail: "Procesando archivo CSV...", life: 4000 });

    Papa.parse(file, {
      header: true,
      delimiter: ";", // Importante: usar punto y coma como delimitador
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        console.log("Datos CSV cargados:", data);
        
        try {
          let successCount = 0;
          let errorCount = 0;
          
          // Procesar cada fila como una compensación separada
          for (const row of data) {
            // Extraer datos de la compensación
            const compensacionData = {
              COM_Compensacion: row["ID Compensacion"],
              COM_Descripción: row["Descripcion"],
              COM_Fecha: formatDateForBackend(row["Fecha"]),
              COM_Tipo: row["Tipo"],
              COM_Valor: 0 // Se calculará en base a los movimientos
            };
            
            // Extraer los IDs de movimientos (todas las columnas que comienzan con "Movimiento")
            const movimientosIds = Object.keys(row)
              .filter(key => key.startsWith("Movimiento"))
              .map(key => row[key])
              .filter(id => id && id.trim() !== "");
            
            if (movimientosIds.length === 0) {
              console.warn(`Compensación ${compensacionData.COM_Compensacion} no tiene movimientos`);
              errorCount++;
              continue;
            }
            
            console.log("Enviando al backend:", { compensacionData, movimientosIds });
            
            // Enviar al backend
            const res = await fetch(`${API_URL}/api/compensacion/process`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ compensacionData, movimientosIds })
            });
            
            const responseText = await res.text();
            console.log(`Respuesta del servidor para ${compensacionData.COM_Compensacion}:`, responseText);
            
            if (!res.ok) {
              console.error(`Error al procesar compensación: ${responseText}`);
              toast.current.show({ 
                severity: "error", 
                summary: "Error", 
                detail: `Error en compensación ${compensacionData.COM_Compensacion}: ${responseText}`, 
                life: 5000 
              });
              errorCount++;
            } else {
              successCount++;
            }
          }
          
          // Mostrar resumen
          if (successCount > 0) {
            toast.current.show({ 
              severity: "success", 
              summary: "Éxito", 
              detail: `${successCount} compensaciones procesadas correctamente${errorCount > 0 ? `, ${errorCount} fallidas` : ''}`, 
              life: 5000 
            });
          } else if (errorCount > 0) {
            toast.current.show({ 
              severity: "error", 
              summary: "Error", 
              detail: `Ninguna compensación fue procesada. ${errorCount} fallidas.`, 
              life: 5000 
            });
          }
          
        } catch (err) {
          console.error("Error al procesar compensaciones:", err);
          toast.current.show({ 
            severity: "error", 
            summary: "Error", 
            detail: "Error al procesar el archivo", 
            life: 5000 
          });
        } finally {
          setIsUploading(false);
        }
      },
      error: (err) => {
        console.error("Error al parsear CSV:", err);
        toast.current.show({ 
          severity: "error", 
          summary: "Error", 
          detail: "Error al leer el archivo CSV", 
          life: 5000 
        });
        setIsUploading(false);
      }
    });
  };
  
  // Función para convertir fecha del formato DD/MM/YYYY al formato YYYY-MM-DD
  const formatDateForBackend = (dateStr) => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date().toISOString().split('T')[0];
    
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  };

  return (
    <section style={pageStyle}>
      <Toast ref={toast} />
      <div style={containerStyle}>
        {/* Encabezado con borde lateral */}
        <div style={headerContainerStyle}>
          <h1 style={headerTextStyle}>Compensación</h1>
        </div>
        
        {/* Mensaje de éxito */}
        {successMessage && (
          <div style={successMessageStyle}>
            {successMessage}
          </div>
        )}
        
        {/* Botones de acción */}
        <div style={actionContainerStyle}>
          <button 
            onClick={() => setShowProcessForm(true)}
            style={buttonStyle}
            onMouseOver={(e) => e.target.style.backgroundColor = "#162B44"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#0D1B2A"}
          >
            Crear Nueva Compensación
          </button>
          
          <label htmlFor="csvUpload" style={csvButtonStyle}>
            <i className="pi pi-upload" style={{marginRight: "8px"}}></i>
            Cargar desde CSV
          </label>
          <input
            id="csvUpload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          
          <a
            href="/compensacion-plantilla.csv"
            download="compensacion-plantilla.csv"
            style={templateButtonStyle}
          >
            <i className="pi pi-download" style={{marginRight: "8px"}}></i>
            Descargar plantilla
          </a>
        </div>
        
        {/* Contenido condicional */}
        {showProcessForm ? (
          <ProcessCompensacion 
            onCancel={() => setShowProcessForm(false)}
            onSuccess={() => {
              setShowProcessForm(false);
              setSuccessMessage("Compensación procesada correctamente");
              setTimeout(() => setSuccessMessage(""), 3000);
            }}
          />
        ) : (
          <div style={cardStyle}>
            <h2 style={subHeaderStyle}>Procesamiento de Compensaciones</h2>
            <p style={paragraphStyle}>
              Una compensación le permite agrupar múltiples movimientos bajo un identificador común.
              Este proceso marca los movimientos como compensados y facilita su seguimiento.
              Puede crear compensaciones individualmente o cargarlas masivamente mediante un archivo CSV.
            </p>
            
            {isUploading && (
              <div style={spinnerStyle}>
                <i className="pi pi-spin pi-spinner" style={{fontSize: '2rem'}}></i>
                <span style={{marginLeft: '10px'}}>Procesando compensaciones...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

// Estilos actuales...

// Estilos adicionales
const actionContainerStyle = {
  display: "flex",
  gap: "15px",
  marginBottom: "20px",
  flexWrap: "wrap"
};

const csvButtonStyle = {
  backgroundColor: "#415A77",
  color: "white",
  padding: "12px 20px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  transition: "background-color 0.2s ease",
  fontFamily: "'Open Sans', sans-serif"
};

const templateButtonStyle = {
  backgroundColor: "#778DA9",
  color: "white",
  padding: "12px 20px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  transition: "background-color 0.2s ease",
  fontFamily: "'Open Sans', sans-serif"
};

const spinnerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  color: "#415A77"
};

// Mantén los estilos existentes...
const pageStyle = {
  display: "flex",
  justifyContent: "center",
  padding: "25px",
  fontFamily: "'Open Sans', sans-serif",
  backgroundColor: "#f5f5f5",
  minHeight: "calc(100vh - 120px)"
};

const containerStyle = {
  width: "100%",
  maxWidth: "1000px"
};

const headerContainerStyle = {
  borderLeft: "5px solid #0D1B2A",
  backgroundColor: "white",
  padding: "15px 20px",
  marginBottom: "20px",
  borderRadius: "0 8px 8px 0",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
};

const headerTextStyle = {
  fontSize: "24px",
  fontWeight: "600",
  margin: 0,
  color: "#333"
};

const successMessageStyle = {
  backgroundColor: "#d4edda",
  color: "#155724",
  padding: "12px 15px",
  borderRadius: "5px",
  marginBottom: "20px",
  fontSize: "15px",
  fontWeight: "500"
};

const cardStyle = {
  backgroundColor: "white",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  padding: "25px",
  marginBottom: "20px"
};

const subHeaderStyle = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#333",
  marginBottom: "15px"
};

const paragraphStyle = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#555",
  marginBottom: "25px"
};

const buttonStyle = {
  backgroundColor: "#0D1B2A",
  color: "white",
  padding: "12px 20px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "600",
  transition: "background-color 0.2s ease",
  fontFamily: "'Open Sans', sans-serif"
};

export default CompensasionPage;