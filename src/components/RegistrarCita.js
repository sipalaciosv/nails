"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";

// Cargar React-Select dinámicamente para evitar problemas de SSR
const Select = dynamic(() => import("react-select"), { ssr: false });

export default function RegistrarCita({ clientes, onCitaAgregada }) {
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [fecha, setFecha] = useState("");
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

    try {
      const nuevaCita = {
        idCliente: selectedCliente.value,
        fecha: Timestamp.fromDate(new Date(fecha)),
        servicio,
        precio: parseFloat(precio),
        estado,
        notas,
      };

      const docRef = await addDoc(collection(db, "citas"), nuevaCita);

      onCitaAgregada({ id: docRef.id, ...nuevaCita });

      // Limpiar el formulario
      setSelectedCliente(null);
      setFecha("");
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
        <label htmlFor="fecha" className="form-label">
          Fecha y Hora
        </label>
        <input
          type="datetime-local"
          className="form-control"
          id="fecha"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
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

      <button type="submit" className="btn btn-primary">
        Registrar Cita
      </button>
    </form>
  );
}
