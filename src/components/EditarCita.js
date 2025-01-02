"use client";

import { useState } from "react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";

export default function EditarCita({ cita, onActualizar, onCancelar }) {
  const [fechaInicio, setFechaInicio] = useState(
    cita.fecha.toDate().toISOString().slice(0, 16)
  );
  const [fechaFin, setFechaFin] = useState(
    new Date(cita.fecha.toDate().getTime() + cita.duracionMilisegundos)
      .toISOString()
      .slice(0, 16)
  );
  const [servicio, setServicio] = useState(cita.servicio);
  const [precio, setPrecio] = useState(cita.precio);
  const [estado, setEstado] = useState(cita.estado);

  const handleSave = async (e) => {
    e.preventDefault();

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (fin <= inicio) {
      alert("La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }

    const duracionMilisegundos = fin.getTime() - inicio.getTime();

    try {
      const citaRef = doc(db, "citas", cita.id);

      await updateDoc(citaRef, {
        fecha: Timestamp.fromDate(inicio),
        duracionMilisegundos,
        servicio,
        precio: parseFloat(precio),
        estado,
      });

      onActualizar({
        ...cita,
        fecha: Timestamp.fromDate(inicio),
        duracionMilisegundos,
        servicio,
        precio: parseFloat(precio),
        estado,
      });
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <div className="mb-3">
        <label htmlFor="fechaInicio" className="form-label">
          Fecha y Hora de Inicio
        </label>
        <input
          type="datetime-local"
          className="form-control"
          id="fechaInicio"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="fechaFin" className="form-label">
          Fecha y Hora de Fin
        </label>
        <input
          type="datetime-local"
          className="form-control"
          id="fechaFin"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="servicio" className="form-label">
          Servicio
        </label>
        <input
          type="text"
          className="form-control"
          id="servicio"
          value={servicio}
          onChange={(e) => setServicio(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="precio" className="form-label">
          Precio
        </label>
        <input
          type="number"
          className="form-control"
          id="precio"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="estado" className="form-label">
          Estado
        </label>
        <select
          className="form-select"
          id="estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          required
        >
          <option value="Pendiente">Pendiente</option>
          <option value="Confirmada">Confirmada</option>
          <option value="Cancelada">Cancelada</option>
        </select>
      </div>

      <div className="d-flex justify-content-between">
        <button type="submit" className="btn-crear">
          Guardar Cambios
        </button>
        <button
          type="button"
          className="btn-secondary-custom"
          onClick={onCancelar}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
