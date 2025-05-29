import { useState, useEffect } from "react";
import { Card } from "primereact/card";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AddCuentaBancaria({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    CUB_Nombre: "",
    TCP_Tipo_cuenta: "",
    BAN_banco: "",
    MON_moneda: "",
    CUB_Numero: "",
    CUB_saldo: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [tiposCuenta, setTiposCuenta] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [monedas, setMonedas] = useState([]);

  useEffect(() => {
    const fetchTiposCuenta = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tipoCuentaBancaria`);
        const data = await res.json();
        setTiposCuenta(Array.isArray(data) ? data : []);
      } catch (err) {
        setTiposCuenta([]);
      }
    };
    const fetchBancos = async () => {
      try {
        const res = await fetch(`${API_URL}/api/bancos`);
        const data = await res.json();
        setBancos(Array.isArray(data) ? data : []);
      } catch (err) {
        setBancos([]);
      }
    };
    const fetchMonedas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/moneda`);
        const data = await res.json();
        setMonedas(Array.isArray(data) ? data : []);
      } catch (err) {
        setMonedas([]);
      }
    };
    fetchTiposCuenta();
    fetchBancos();
    fetchMonedas();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.CUB_Nombre ||
      !formData.TCP_Tipo_cuenta ||
      !formData.BAN_banco ||
      !formData.MON_moneda ||
      !formData.CUB_Numero ||
      formData.CUB_saldo === ""
    ) {
      setErrorMessage("Todos los campos son obligatorios.");
      return;
    }
    if (isNaN(Number(formData.CUB_Numero))) {
      setErrorMessage("El número de cuenta debe ser un número válido.");
      return;
    }
    if (isNaN(Number(formData.CUB_saldo))) {
      setErrorMessage("El saldo debe ser un número válido.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/cuentasBancarias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          CUB_Numero: Number(formData.CUB_Numero), // <-- Enviar como número
          CUB_saldo: Number(formData.CUB_saldo),
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const errorText = await res.text();
        setErrorMessage(errorText);
        console.error("Datos enviados:", formData);
      }
    } catch (err) {
      setErrorMessage("Ocurrió un error al intentar agregar el registro.");
      console.error("Error en fetch:", err, "Datos enviados:", formData);
    }
  };

  
}

export default AddCuentaBancaria;
