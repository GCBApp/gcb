import React from "react";

function ConfirmDeleteAccount({ message, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(13,27,42,0.85)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        fontFamily: "'Open Sans', sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "36px 32px 28px 32px",
          borderRadius: 18,
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          color: "#1B263B",
          border: "1.5px solid #415A77",
          minWidth: 320,
          maxWidth: 400,
        }}
      >
        <p
          style={{
            fontWeight: 700,
            fontSize: 22,
            marginBottom: 24,
            letterSpacing: 0.5,
          }}
        >
          {message}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <button
            onClick={onConfirm}
            style={{
              background: "#21B573",
              color: "#fff",
              border: "none",
              padding: "10px 28px",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(33,181,115,0.08)",
              transition: "background 0.2s",
            }}
          >
            Confirmar
          </button>
          <button
            onClick={onCancel}
            style={{
              background: "#D90429",
              color: "#fff",
              border: "none",
              padding: "10px 28px",
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(217,4,41,0.08)",
              transition: "background 0.2s",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteAccount;
