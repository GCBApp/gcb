function ConfirmDelete({ message, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff", // Fondo del cuadro
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          color: "#000", // Color de la fuente
          border: "1px solid #ccc", // Borde del cuadro
        }}
      >
        <p style={{ fontWeight: "bold", marginBottom: "20px" }}>{message}</p>
        <button
          onClick={() => {
            console.log("Confirmar clic"); // Verificar que el botón Confirmar está funcionando
            onConfirm();
          }}
          style={{
            backgroundColor: "#d4edda", // Fondo del botón Confirmar (verde claro)
            color: "#155724", // Color de la fuente del botón Confirmar (verde oscuro)
            border: "1px solid #c3e6cb",
            padding: "10px 20px",
            borderRadius: "5px",
            marginRight: "10px",
            cursor: "pointer",
          }}
        >
          Confirmar
        </button>
        <button
          onClick={() => {
            console.log("Cancelar clic"); // Verificar que el botón Cancelar está funcionando
            onCancel();
          }}
          style={{
            backgroundColor: "#f8d7da", // Fondo del botón Cancelar (rojo claro)
            color: "#721c24", // Color de la fuente del botón Cancelar (rojo oscuro)
            border: "1px solid #f5c6cb",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default ConfirmDelete;
