import React from "react";
import axios from "axios";

const ReporteCheques = () => {
  const handleDownload = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/reportecheques", {
        params: {
          startDate: "2023-01-01", // Cambia estas fechas según sea necesario
          endDate: "2023-12-31",
          usuarioId: "12345", // Cambia el ID del usuario según sea necesario
        },
        responseType: "blob", // Para manejar archivos binarios
      });

      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("descargar", "reporte_cheques.txt");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar el reporte de cheques:", error); 
    }
  };

  return (
    <div>
      <h1>Reporte de Cheques</h1>
      <p>Aquí puedes descargar el reporte de cheques.</p>
      <button onClick={handleDownload}>Descargar Reporte</button>
    </div>
  );
};

export default ReporteCheques;