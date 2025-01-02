"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function EditarCita({ cita, onActualizar, onCancelar }) {
  const [estado, setEstado] = useState(cita.estado);

  const handleSave = async () => {
    try {
      const citaRef = doc(db, "citas", cita.id);
      await updateDoc(citaRef, { estado });
  
      onActualizar({ ...cita, estado }); // Actualizar localmente
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
      alert("Hubo un problema al actualizar la cita. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="d-flex gap-2">
      <select
        className="form-select"
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
      >
        <option value="Pendiente">Pendiente</option>
        <option value="Confirmada">Confirmada</option>
        <option value="Cancelada">Cancelada</option>
      </select>
      <button className="btn btn-success btn-sm" onClick={handleSave}>
        Guardar
      </button>
      <button className="btn btn-secondary btn-sm" onClick={onCancelar}>
        Cancelar
      </button>
    </div>
  );
}
