"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";

// Cargar React-Select dinámicamente para evitar problemas de SSR
const Select = dynamic(() => import("react-select"), { ssr: false });

export default function RegistrarCita({ clientes, onCitaAgregada }) {
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState(""); // Nuevo campo para la hora de fin
  const [servicio, setServicio] = useState("");
  const [precio, setPrecio] = useState("");
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

    if (!fechaInicio || !fechaFin) {
      alert("Debes ingresar tanto la fecha de inicio como la fecha de fin.");
      return;
    }

    // Convertir las fechas ingresadas a objetos Date
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (fin <= inicio) {
      alert("La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }

    // Calcular duración en milisegundos
    const duracionMilisegundos = fin.getTime() - inicio.getTime();

    try {
      // Validar conflictos de citas
      const querySnapshot = await getDocs(collection(db, "citas"));
      const citasExistentes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().fecha.toDate(),
      }));

      const conflicto = citasExistentes.some((cita) => {
        const citaHoraInicio = cita.fecha.getTime();
        const citaHoraFin = citaHoraInicio + cita.duracionMilisegundos;

        // Verificar si los rangos de tiempo se solapan
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

      // Registrar la cita si no hay conflictos
      const nuevaCita = {
        idCliente: selectedCliente.value,
        fecha: Timestamp.fromDate(inicio),
        duracionMilisegundos,
        servicio,
        precio: parseFloat(precio),
        estado,
        notas,
      };

      const docRef = await addDoc(collection(db, "citas"), nuevaCita);

      onCitaAgregada({ id: docRef.id, ...nuevaCita });

      // Limpiar el formulario
      setSelectedCliente(null);
      setFechaInicio("");
      setFechaFin(""); // Limpiar fecha fin
      setServicio("");
      setPrecio("");
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
