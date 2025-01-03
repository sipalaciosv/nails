"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function EditarCliente({ cliente, onClienteEditado }) {
  const [nombre, setNombre] = useState(cliente.nombre);
  const [whatsapp, setWhatsapp] = useState(cliente.whatsapp || "+569");
  const [notas, setNotas] = useState(cliente.notas || "");
  const [instagram, setInstagram] = useState(cliente.instagram || "https://www.instagram.com/");
  const [facebook, setFacebook] = useState(cliente.facebook || "https://www.facebook.com/");

  const handleGuardar = async (e) => {
    e.preventDefault();

    // Validar campos de Instagram y Facebook
    const instagramFinal =
      instagram === "https://www.instagram.com/" ? "" : instagram;
    const facebookFinal =
      facebook === "https://www.facebook.com/" ? "" : facebook;

    // Validar número de WhatsApp
    const whatsappFinal =
      whatsapp.length === 12 && whatsapp.startsWith("+569")
        ? whatsapp
        : ""; // Guardar vacío si no es válido

    try {
      const clienteRef = doc(db, "clientes", cliente.id);
      await updateDoc(clienteRef, {
        nombre,
        whatsapp: whatsappFinal,
        notas,
        instagram: instagramFinal,
        facebook: facebookFinal,
      });

      onClienteEditado({
        id: cliente.id,
        nombre,
        whatsapp: whatsappFinal,
        notas,
        instagram: instagramFinal,
        facebook: facebookFinal,
      });
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
          required
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
        <label htmlFor="instagram" className="form-label">
          Instagram
        </label>
        <input
          type="text"
          className="form-control"
          id="instagram"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="facebook" className="form-label">
          Facebook
        </label>
        <input
          type="text"
          className="form-control"
          id="facebook"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
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
