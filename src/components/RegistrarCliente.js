"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function RegistrarCliente({ onClienteAgregado }) {
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("+569");
  const [notas, setNotas] = useState("");

  const handleAddCliente = async (e) => {
    e.preventDefault();
    // Validar que el número de WhatsApp tenga exactamente 12 caracteres (+569 + 8 dígitos)
  if (whatsapp.length !== 12) {
    alert("El número de WhatsApp debe tener 8 dígitos después de +569.");
    return;
  }
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
      setWhatsapp("+569");
      setNotas("");
    } catch (error) {
      console.error("Error agregando cliente: ", error);
    }
  };
  const handleWhatsappChange = (e) => {
    const input = e.target.value;
    // Permitir solo números después de "+569"
    if (/^\+569\d*$/.test(input) || input === "+569") {
      setWhatsapp(input);
    }
  };

  return (
    <form onSubmit={handleAddCliente} className="mb-4">
      <div className="mb-3">
        <label>Nombre</label>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <label>Número Whatsapp</label>
        <input
          type="text"
          placeholder="+56912345678"
          value={whatsapp}
          onChange={handleWhatsappChange}
          className="form-control"
          required
        />
      </div>
      <div className="mb-3">
        <label>Notas</label>
        <textarea
          placeholder="Notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="form-control"
        ></textarea>
      </div>
      <div className="d-flex justify-content-center">
        <button type="submit" className="btn-crear mt-3">
          Agregar Cliente
        </button>
      </div>
    </form>
  );
}

