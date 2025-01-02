"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Toast, ToastContainer } from "react-bootstrap";

export default function RegistrarCliente({ onClienteAgregado }) {
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("+569");
  const [notas, setNotas] = useState("");
  const [toastVisible, setToastVisible] = useState(false); // Controlar la visibilidad del toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success"); // "success" o "danger"

  const handleAddCliente = async (e) => {
    e.preventDefault();
    // Validar que el número de WhatsApp tenga exactamente 12 caracteres (+569 + 8 dígitos)
    if (whatsapp.length !== 12) {
      setToastMessage("El número de WhatsApp debe tener 8 dígitos después de +569.");
      setToastVariant("danger");
      setToastVisible(true);
      return;
    }
    if (!nombre || !whatsapp) {
      setToastMessage("Por favor, llena los campos de Nombre y WhatsApp.");
      setToastVariant("danger");
      setToastVisible(true);
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "clientes"), {
        nombre,
        whatsapp,
        notas,
      });

      setToastMessage("Cliente agregado exitosamente!");
      setToastVariant("success");
      setToastVisible(true);

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
      setToastMessage("Hubo un error al agregar el cliente.");
      setToastVariant("danger");
      setToastVisible(true);
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

      {/* Toast para notificaciones */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
         className={toastVariant === "success" ? "custom-toast-success" : "custom-toast-danger"}
          show={toastVisible}
          onClose={() => setToastVisible(false)}
          delay={3000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Notificación</strong>
            <small>Justo ahora</small>
          </Toast.Header>
          <Toast.Body >{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
