"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import RegistrarCita from "@/components/RegistrarCita";
import ListarCitas from "@/components/ListarCitas";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export default function Citas() {
  const [clientes, setClientes] = useState([]);
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    const fetchClientes = async () => {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const clientesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientes(clientesData);
    };

    const fetchCitas = async () => {
      const querySnapshot = await getDocs(collection(db, "citas"));
      const citasData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCitas(citasData);
    };

    fetchClientes();
    fetchCitas();
  }, []);

  const handleCitaAgregada = (nuevaCita) => {
    setCitas((prev) => [...prev, nuevaCita]);
  };

  const handleCitaActualizada = (citaActualizada) => {
    setCitas((prev) =>
      prev.map((cita) => (cita.id === citaActualizada.id ? citaActualizada : cita))
    );
  };

  return (
    <div>
      <Navbar />
      <div className="container py-5">
        <h1 className="text-center mb-4">Gestión de Citas</h1>
        <div className="row">
          <div className="col-md-6">
            <RegistrarCita
              clientes={clientes}
              onCitaAgregada={handleCitaAgregada}
            />
          </div>
          <div className="col-md-6">
            <ListarCitas
              citas={citas}
              clientes={clientes}
              onCitaActualizada={handleCitaActualizada}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
