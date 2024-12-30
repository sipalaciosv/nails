"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function RegistrarCliente({ onClienteAgregado }) {
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notas, setNotas] = useState("");

  const handleAddCliente = async (e) => {
    e.preventDefault();

    if (!nombre || !whatsapp) {
      alert("Por favor, llena los campos de Nombre y WhatsApp.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "clientes"), {
        nombre,
        whatsapp,
        notas,
      });

      alert("Cliente agregado exitosamente!");

      onClienteAgregado({
        id: docRef.id,
        nombre,
        whatsapp,
        notas,
      });

      setNombre("");
      setWhatsapp("");
      setNotas("");
    } catch (error) {
      console.error("Error agregando cliente: ", error);
    }
  };

  return (
    <form onSubmit={handleAddCliente} className="mb-4">
      <div className="row g-3">
        <div className="col-md-4">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="col-md-4">
          <input
            type="text"
            placeholder="WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div className="col-md-4">
          <textarea
            placeholder="Notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="form-control"
          ></textarea>
        </div>
      </div>
      <button type="submit" className="btn-primary-custom mt-3">
        Agregar Cliente
      </button>
    </form>
  );
}
