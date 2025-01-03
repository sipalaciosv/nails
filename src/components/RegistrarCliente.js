"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Toast, ToastContainer } from "react-bootstrap";

export default function RegistrarCliente({ onClienteAgregado }) {
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("+569");
  const [notas, setNotas] = useState("");
  const [instagram, setInstagram] = useState("https://www.instagram.com/");
  const [facebook, setFacebook] = useState("https://www.facebook.com/");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  const handleAddCliente = async (e) => {
    e.preventDefault();

    // Validar si los campos de Instagram o Facebook no tienen un usuario
    const instagramFinal =
      instagram === "https://www.instagram.com/" ? "" : instagram;
    const facebookFinal =
      facebook === "https://www.facebook.com/" ? "" : facebook;

    // Validar si el número de WhatsApp tiene un formato válido
    const whatsappFinal =
      whatsapp.length === 12 && whatsapp.startsWith("+569")
        ? whatsapp
        : ""; // Guardar vacío si no es válido

    try {
      const docRef = await addDoc(collection(db, "clientes"), {
        nombre,
        whatsapp: whatsappFinal,
        notas,
        instagram: instagramFinal,
        facebook: facebookFinal,
      });

      setToastMessage("Cliente agregado exitosamente!");
      setToastVariant("success");
      setToastVisible(true);

      onClienteAgregado({
        id: docRef.id,
        nombre,
        whatsapp: whatsappFinal,
        notas,
        instagram: instagramFinal,
        facebook: facebookFinal,
      });

      // Limpiar campos después de guardar
      setNombre("");
      setWhatsapp("+569");
      setNotas("");
      setInstagram("https://www.instagram.com/");
      setFacebook("https://www.facebook.com/");
    } catch (error) {
      console.error("Error agregando cliente: ", error);
      setToastMessage("Hubo un error al agregar el cliente.");
      setToastVariant("danger");
      setToastVisible(true);
    }
  };

  return (
    <>
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
            onChange={(e) => setWhatsapp(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Instagram</label>
          <input
            type="text"
            placeholder="https://www.instagram.com/usuario/"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label>Facebook</label>
          <input
            type="text"
            placeholder="https://www.facebook.com/usuario/"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            className="form-control"
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

      <ToastContainer position="top-end" className="p-3">
        <Toast
          className={
            toastVariant === "success"
              ? "custom-toast-success"
              : "custom-toast-danger"
          }
          show={toastVisible}
          onClose={() => setToastVisible(false)}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Notificación</strong>
            <small>Justo ahora</small>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
