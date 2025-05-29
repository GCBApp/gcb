import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EditCuentaBancaria from "../cruds/CuentasBancarias/EditCuentaBancaria";

function EditAccount() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCuenta = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
          }/api/cuentasBancarias/${id}`
        );
        if (!res.ok) throw new Error("No se pudo obtener la cuenta");
        const data = await res.json();
        setInitialData(data);
      } catch (err) {
        setInitialData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCuenta();
  }, [id]);

  if (loading)
    return <div style={overlayStyle}>Cargando...</div>;
  if (!initialData)
    return <div style={overlayStyle}>No se encontró la cuenta.</div>;

  return (
    <div style={overlayStyle}>
      <div style={formContainerStyle}>
        <h3 style={headerStyle}>Editar Cuenta Bancaria</h3>
        <EditCuentaBancaria
          initialData={initialData}
          onCancel={() => navigate("/accounts")}
          onSuccess={() => navigate("/accounts")}
        />
        <InputNumber
          id="CUB_saldo"
          name="CUB_saldo"
          value={initialData.CUB_saldo}
          mode="decimal"
          min={0}
          step={0.01}
          showButtons
          placeholder="Saldo inicial"
          style={{ width: "100%" }}
          inputStyle={{ width: "100%" }}
          disabled // <-- SOLO LECTURA
        />
      </div>
    </div>
  );
}

const overlayStyle = {
  minHeight: "100vh",
  width: "100vw",
  background:
    "linear-gradient(rgba(13,27,42,0.85), rgba(13,27,42,0.85)), url('https://png.pngtree.com/thumb_back/fh260/background/20220616/pngtree-calculator-and-charts-bank-account-savings-perks-photo-image_31662364.jpg') center/cover no-repeat",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

const formContainerStyle = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
  padding: "32px 32px 24px 32px",
  minWidth: 350,
  maxWidth: 420,
  width: "100%",
  margin: "40px 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const headerStyle = {
  color: "#1B263B",
  fontWeight: 700,
  fontSize: 28,
  marginBottom: 24,
  textAlign: "center",
  letterSpacing: 1,
};

export default EditAccount;
