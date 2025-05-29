import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

function ConfirmDeleteMovimiento({ message, onConfirm, onCancel }) {
  return (
    <Dialog
      header="Confirmar eliminación"
      visible
      style={{ width: "350px" }}
      modal
      onHide={onCancel}
      footer={
        <div>
          <Button
            label="Cancelar"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onCancel}
          />
          <Button
            label="Eliminar"
            icon="pi pi-trash"
            className="p-button-danger"
            onClick={onConfirm}
          />
        </div>
      }
    >
      <span>
        <i
          className="pi pi-exclamation-triangle"
          style={{ color: "#d32f2f", marginRight: 8 }}
        />
        {message}
      </span>
    </Dialog>
  );
}

export default ConfirmDeleteMovimiento;