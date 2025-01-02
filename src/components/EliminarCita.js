"use client";

import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function EliminarCita({ idCita, onEliminar }) {
  const handleDelete = async () => {
    try {
      const citaRef = doc(db, "citas", idCita);
      await deleteDoc(citaRef);

      onEliminar(idCita);
    } catch (error) {
      console.error("Error al eliminar la cita:", error);
    }
  };

  return (
    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
      Borrar
    </button>
  );
}
