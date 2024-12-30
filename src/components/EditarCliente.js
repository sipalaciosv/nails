"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function EditarCliente({ cliente, onClienteEditado }) {
  const [nombre, setNombre] = useState(cliente.nombre);
  const [whatsapp, setWhatsapp] = useState(cliente.whatsapp);
  const [notas, setNotas] = useState(cliente.notas);

  const handleGuardar = async (e) => {
    e.preventDefault();

    try {
      const clienteRef = doc(db, "clientes", cliente.id);
      await updateDoc(clienteRef, { nombre, whatsapp, notas });
      onClienteEditado({ id: cliente.id, nombre, whatsapp, notas });
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
    }
  };

  return (
    <form onSubmit={handleGuardar}>
      <div className="mb-3">
        <label htmlFor="nombre" className="form-label">
          Nombre
        </label>
        <input
          type="text"
          className="form-control"
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="whatsapp" className="form-label">
          WhatsApp
        </label>
        <input
          type="text"
          className="form-control"
          id="whatsapp"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
        />
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
      <button type="submit" className="btn btn-success">
        Guardar Cambios
      </button>
    </form>
  );
}
