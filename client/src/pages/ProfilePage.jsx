import React, { useEffect, useState } from "react";

function Profile() {
  const [empleado, setEmpleado] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editData, setEditData] = useState({
    TU_descripcion: "",
    EMP_Correo: "",
    EMP_Telefono: "",
    EMP_Direccion: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const empleadoData = localStorage.getItem("empleado") || localStorage.getItem("user");
    if (empleadoData) {
      const emp = JSON.parse(empleadoData);
      setEmpleado(emp);
      setEditData({
        TU_descripcion: emp.TU_descripcion || "",
        EMP_Correo: emp.EMP_Correo || "",
        EMP_Telefono: emp.EMP_Telefono || "",
        EMP_Direccion: emp.EMP_Direccion || ""
      });
    }
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:3000/api/empleado/${empleado.EMP_Empleado}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...empleado,
            ...editData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el perfil en la base de datos");
      }

      const updatedEmpleado = { ...empleado, ...editData };
      setEmpleado(updatedEmpleado);
      localStorage.setItem("empleado", JSON.stringify(updatedEmpleado));
      setShowEdit(false);
    } catch (error) {
      alert("No se pudo actualizar el perfil: " + error.message);
    }
  };

  // --- Cambiar contraseña ---
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Todos los campos son obligatorios.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    try {
      // Llama a tu API para validar y actualizar la contraseña
      const response = await fetch(
        `http://localhost:3000/api/empleado/${empleado.EMP_Empleado}/cambiar-contrasena`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            actual: passwordData.currentPassword,
            nueva: passwordData.newPassword,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al cambiar la contraseña");
      }

      setPasswordSuccess("Contraseña actualizada correctamente.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (error) {
      setPasswordError(error.message);
    }
  };

  if (!empleado) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2>Perfil</h2>
          <p>No hay información de empleado disponible.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* ...datos del perfil... */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
          <img
            src={`/perfiles/${(empleado.EMP_Empleado || "").toLowerCase().replace(/\s/g, "")}.png`}
                      alt={empleado.EMP_Empleado}                      
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              objectFit: "cover",
              marginRight: 24,
              border: "3px solid #415A77",
              background: "#E0E1DD"
            }}
            onError={e => { e.target.onerror = null; e.target.src = "/perfiles/default.png"; }}
          />
          <div>
            <h2 style={{ margin: 0 }}>{empleado.EMP_Nombre} {empleado.EMP_Apellido}</h2>
            <p style={{ color: "#415A77", margin: 0, fontWeight: 500 }}>
              {empleado.TU_descripcion}
            </p>
            <p style={{ color: "#778DA9", margin: 0 }}>{empleado.EMP_Usuario}</p>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Rol del Empleado:</strong>
          <div style={infoBoxStyle}>{empleado.TU_descripcion}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Correo:</strong>
          <div style={infoBoxStyle}>{empleado.EMP_Correo}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Teléfono:</strong>
          <div style={infoBoxStyle}>{empleado.EMP_Telefono}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>Dirección:</strong>
          <div style={infoBoxStyle}>{empleado.EMP_Direccion}</div>
        </div>
        <button
          style={{
            background: "#415A77",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 20px",
            cursor: "pointer",
            marginTop: 12,
            marginRight: 8
          }}
          onClick={() => setShowEdit(true)}
        >
          Editar Perfil
        </button>
        <button
          style={{
            background: "#778DA9",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 20px",
            cursor: "pointer",
            marginTop: 12
          }}
          onClick={() => setShowPasswordModal(true)}
        >
          Cambiar Contraseña
        </button>
      </div>

      {/* Ventana modal para editar perfil */}
      {showEdit && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Editar Perfil</h3>
            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label>Rol del Empleado</label>
                <input
                  type="text"
                  name="TU_descripcion"
                  value={editData.TU_descripcion}
                  onChange={handleEditChange}
                  style={inputStyle}
                  readOnly
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Correo</label>
                <input
                  type="email"
                  name="EMP_Correo"
                  value={editData.EMP_Correo}
                  onChange={handleEditChange}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Teléfono</label>
                <input
                  type="text"
                  name="EMP_Telefono"
                  value={editData.EMP_Telefono}
                  onChange={handleEditChange}
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Dirección</label>
                <input
                  type="text"
                  name="EMP_Direccion"
                  value={editData.EMP_Direccion}
                  onChange={handleEditChange}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  style={{
                    background: "#E0E1DD",
                    color: "#415A77",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 16px",
                    cursor: "pointer"
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#415A77",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 16px",
                    cursor: "pointer"
                  }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ventana modal para cambiar contraseña */}
      {showPasswordModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Cambiar Contraseña</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label>Contraseña Actual</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  style={inputStyle}
                  autoComplete="current-password"
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label>Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>
              {passwordError && (
                <div style={{ color: "red", marginBottom: 8 }}>{passwordError}</div>
              )}
              {passwordSuccess && (
                <div style={{ color: "green", marginBottom: 8 }}>{passwordSuccess}</div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    background: "#E0E1DD",
                    color: "#415A77",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 16px",
                    cursor: "pointer"
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#778DA9",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 16px",
                    cursor: "pointer"
                  }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0D1B2A 0%, #415A77 100%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "40px 0"
};

const cardStyle = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
  padding: "40px 32px",
  minWidth: 350,
  maxWidth: 400,
  width: "100%",
  textAlign: "left"
};

const infoBoxStyle = {
  background: "#E0E1DD",
  borderRadius: "6px",
  padding: "8px 12px",
  marginTop: "4px",
  fontSize: "16px"
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(13,27,42,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
};

const modalStyle = {
  background: "#fff",
  borderRadius: 12,
  padding: "32px 24px",
  minWidth: 320,
  maxWidth: 360,
  width: "100%",
  boxShadow: "0 4px 24px rgba(0,0,0,0.18)"
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: 4,
  border: "1px solid #ccc",
  marginTop: 4
};

export default Profile;
