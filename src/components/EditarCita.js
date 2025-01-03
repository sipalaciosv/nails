"use client";

import { useState } from "react";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";

export default function EditarCita({ cita, onActualizar, onCancelar }) {
  const [fecha, setFecha] = useState(
    cita.fecha.toDate().toISOString().slice(0, 10) // Solo la fecha (YYYY-MM-DD)
  );
  const [horaInicio, setHoraInicio] = useState(
    cita.fecha.toDate().toISOString().slice(11, 16) // Solo la hora de inicio (HH:mm)
  );
  const [horaFin, setHoraFin] = useState(
    new Date(cita.fecha.toDate().getTime() + cita.duracionMilisegundos)
      .toISOString()
      .slice(11, 16) // Solo la hora de fin (HH:mm)
  );
  const [servicio, setServicio] = useState(cita.servicio);
  const [precio, setPrecio] = useState(cita.precio);
  const [abono, setAbono] = useState(cita.abono || ""); // Campo de abono
  const [estado, setEstado] = useState(cita.estado);

  const handleSave = async (e) => {
    e.preventDefault();

    // Combinar la fecha seleccionada con las horas de inicio y fin
    const inicio = new Date(`${fecha}T${horaInicio}`);
    const fin = new Date(`${fecha}T${horaFin}`);

    if (fin <= inicio) {
      alert("La hora de fin debe ser posterior a la hora de inicio.");
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
        abono: abono ? parseFloat(abono) : 0, // Guardar abono como 0 si está vacío
        estado,
      });

      onActualizar({
        ...cita,
        fecha: Timestamp.fromDate(inicio),
        duracionMilisegundos,
        servicio,
        precio: parseFloat(precio),
        abono: abono ? parseFloat(abono) : 0,
        estado,
      });
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
    }
  };

  return (
    <form onSubmit={handleSave}>
      <div className="mb-3">
        <label htmlFor="fecha" className="form-label">
          Fecha
        </label>
        <input
          type="date"
          className="form-control"
          id="fecha"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="horaInicio" className="form-label">
          Hora de Inicio
        </label>
        <input
          type="time"
          className="form-control"
          id="horaInicio"
          value={horaInicio}
          onChange={(e) => setHoraInicio(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="horaFin" className="form-label">
          Hora de Fin
        </label>
        <input
          type="time"
          className="form-control"
          id="horaFin"
          value={horaFin}
          onChange={(e) => setHoraFin(e.target.value)}
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
        <label htmlFor="abono" className="form-label">
          Abono
        </label>
        <input
          type="number"
          className="form-control"
          id="abono"
          value={abono}
          onChange={(e) => setAbono(e.target.value)}
          min="0"
          step="0.01"
        />
        <small className="text-muted">
          Deja este campo vacío si no hubo abono.
        </small>
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
