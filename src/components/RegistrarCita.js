"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";

// Cargar React-Select dinámicamente para evitar problemas de SSR
const Select = dynamic(() => import("react-select"), { ssr: false });

export default function RegistrarCita({ clientes, onCitaAgregada }) {
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [fecha, setFecha] = useState(""); // Selector de fecha
  const [horaInicio, setHoraInicio] = useState(""); // Hora de inicio
  const [horaFin, setHoraFin] = useState(""); // Hora de fin
  const [servicio, setServicio] = useState("");
  const [precio, setPrecio] = useState("");
  const [abono, setAbono] = useState(""); // Campo de abono directo
  const [estado, setEstado] = useState("Pendiente");
  const [notas, setNotas] = useState("");

  const clienteOptions = clientes.map((cliente) => ({
    value: cliente.id,
    label: `${cliente.nombre} - ${cliente.whatsapp}`,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCliente) {
      alert("Selecciona un cliente");
      return;
    }

    if (!fecha || !horaInicio || !horaFin) {
      alert("Debes ingresar la fecha y el rango de horas.");
      return;
    }

    const inicio = new Date(`${fecha}T${horaInicio}`);
    const fin = new Date(`${fecha}T${horaFin}`);

    if (fin <= inicio) {
      alert("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }

    const duracionMilisegundos = fin.getTime() - inicio.getTime();

    try {
      const querySnapshot = await getDocs(collection(db, "citas"));
      const citasExistentes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().fecha.toDate(),
      }));

      const conflicto = citasExistentes.some((cita) => {
        const citaHoraInicio = cita.fecha.getTime();
        const citaHoraFin = citaHoraInicio + cita.duracionMilisegundos;

        return (
          (inicio.getTime() >= citaHoraInicio && inicio.getTime() < citaHoraFin) ||
          (fin.getTime() > citaHoraInicio && fin.getTime() <= citaHoraFin) ||
          (inicio.getTime() <= citaHoraInicio && fin.getTime() >= citaHoraFin)
        );
      });

      if (conflicto) {
        alert("Ya existe una cita en el rango de tiempo seleccionado.");
        return;
      }

      const nuevaCita = {
        idCliente: selectedCliente.value,
        fecha: Timestamp.fromDate(inicio),
        duracionMilisegundos,
        servicio,
        precio: parseFloat(precio),
        abono: abono ? parseFloat(abono) : 0, // Guardar abono como 0 si está vacío
        estado,
        notas,
      };

      const docRef = await addDoc(collection(db, "citas"), nuevaCita);

      onCitaAgregada({ id: docRef.id, ...nuevaCita });

      // Limpiar el formulario
      setSelectedCliente(null);
      setFecha("");
      setHoraInicio("");
      setHoraFin("");
      setServicio("");
      setPrecio("");
      setAbono(""); // Limpiar el campo de abono
      setEstado("Pendiente");
      setNotas("");
    } catch (error) {
      console.error("Error al registrar la cita:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="cliente" className="form-label">
          Cliente
        </label>
        <Select
          options={clienteOptions}
          value={selectedCliente}
          onChange={setSelectedCliente}
          placeholder="Selecciona un cliente..."
          isClearable
        />
      </div>

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

      <div className="mb-3">
        <label htmlFor="notas" className="form-label">
          Notas
        </label>
        <textarea
          className="form-control"
          id="notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        ></textarea>
      </div>

      <button type="submit" className="btn-crear mt-3">
        Registrar Cita
      </button>
    </form>
  );
}
