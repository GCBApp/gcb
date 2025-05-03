import express from "express";

const router = express.Router();

// Ruta para descargar el reporte de cheques
router.get("/", (req, res) => {
  const { startDate, endDate, usuarioId } = req.query;

  // Generar el contenido del reporte
  const reporte = `Reporte de Cheques\nUsuario: ${usuarioId}\nDesde: ${startDate}\nHasta: ${endDate}`;

  // Configurar las cabeceras para la descarga del archivo
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", "attachment; filename=reporte_cheques.txt");

  // Enviar el contenido del reporte como respuesta
  res.send(reporte);
});

export default router;