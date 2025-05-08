import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AddCompensacion({ onCancel, onSuccess, initialData = {}, globalToast }) {
  const [formData, setFormData] = useState({
    COM_Compensacion: "",
    COM_Descripción: "",
    COM_Fecha: new Date().toISOString().split("T")[0],
    COM_Tipo: "Automática",
    COM_Valor: "",
    ...initialData,
  });

  useEffect(() => {
    const fetchNextCompensacionId = async () => {
      try {
        const res = await fetch(`${API_URL}/api/compensacion/next-id`);
        if (res.ok) {
          const { nextId } = await res.json();
          setFormData((prev) => ({ ...prev, COM_Compensacion: nextId }));
        } else {
          console.error("Error al obtener el siguiente ID de compensación.");
        }
      } catch (err) {
        console.error("Error al obtener el siguiente ID de compensación:", err);
      }
    };

    if (!initialData.COM_Compensacion) {
      fetchNextCompensacionId();
    }
  }, [initialData.COM_Compensacion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };

      console.log("Enviando datos de la compensación al backend:", payload); // Log para depuración

      const res = await fetch(`${API_URL}/api/compensacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Compensación creada exitosamente:", data);

        // Cerrar el formulario inmediatamente
        onCancel();

        // Notificar al componente padre para actualizar la tabla
        //onSuccess(data.compensacion);

        // Mostrar el Toast global después de la actualización
        if (globalToast.current) {
          globalToast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Compensación creada exitosamente.",
            life: 3000,
          });
        }
      } else {
        const errorText = await res.text();
        console.error("Error al crear la compensación:", errorText);

        // Mostrar el Toast de error global
        if (globalToast.current) {
          globalToast.current.show({
            severity: "error",
            summary: "Error",
            detail: `Error al crear la compensación: ${errorText}`,
            life: 3000,
          });
        }

        // Cerrar el formulario en caso de error
        onCancel();
      }
    } catch (err) {
      console.error("Error al enviar la compensación:", err.message);
      console.error("Detalles del error:", err);

      // Mostrar el Toast de error global
      if (globalToast.current) {
        globalToast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Error al enviar la compensación. Por favor, intente nuevamente.",
          life: 3000,
        });
      }

      // Cerrar el formulario en caso de error
      onCancel();
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={formContainerStyle}>
        <h3 style={headerStyle}>Nueva Compensación</h3>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>ID de Compensación:</label>
            <input
              type="text"
              name="COM_Compensacion"
              value={formData.COM_Compensacion}
              style={{ ...inputStyle, ...readOnlyStyle }}
              readOnly
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Descripción:</label>
            <input
              type="text"
              name="COM_Descripción"
              value={formData.COM_Descripción}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Fecha:</label>
            <input
              type="date"
              name="COM_Fecha"
              value={formData.COM_Fecha}
              style={{ ...inputStyle, ...readOnlyStyle }}
              readOnly
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Tipo:</label>
            <input
              type="text"
              name="COM_Tipo"
              value={formData.COM_Tipo}
              style={{ ...inputStyle, ...readOnlyStyle }}
              readOnly
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Valor:</label>
            <input
              type="number"
              name="COM_Valor"
              value={formData.COM_Valor}
              style={{ ...inputStyle, ...readOnlyStyle }}
              readOnly
            />
          </div>
          <div style={buttonContainerStyle}>
            <button type="button" onClick={onCancel} style={cancelButtonStyle}>
              Cancelar
            </button>
            <button type="submit" style={buttonStyle}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const formContainerStyle = {
  backgroundColor: "#fff",
  padding: "16px",
  borderRadius: "8px",
  width: "320px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const labelStyle = {
  fontSize: "14px",
  color: "#555",
};

const inputStyle = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "14px",
};

const readOnlyStyle = {
  backgroundColor: "#f9f9f9", // Fondo más claro
  color: "#888", // Texto más oscuro
  cursor: "not-allowed", // Cursor no permitido
};

const buttonContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
};

const buttonStyle = {
  padding: "10px 20px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
  backgroundColor: "#1B263B",
  color: "#fff",
  transition: "background-color 0.3s",
};

const cancelButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#778DA9",
};

const headerStyle = {
  textAlign: "center",
  color: "#333",
  marginBottom: "20px",
};

export default AddCompensacion;
