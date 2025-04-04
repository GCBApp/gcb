function ConfirmDeleteMovimiento({ message, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          color: "#000",
          border: "1px solid #ccc",
        }}
      >
        <p style={{ fontWeight: "bold", marginBottom: "20px" }}>{message}</p>
        <button
          onClick={onConfirm}
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
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
          onClick={onCancel}
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
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

export default ConfirmDeleteMovimiento;