"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import RegistrarCita from "@/components/RegistrarCita";
import ListarCitas from "@/components/ListarCitas";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useBackground } from "@/context/BackgroundContext";
export default function Citas() {
  const { background, cambiarFondo } = useBackground();
  const [clientes, setClientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const fetchCitas = async () => {
    const querySnapshot = await getDocs(collection(db, "citas"));
    const citasData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCitas(citasData);
  };

  const fetchClientes = async () => {
    const querySnapshot = await getDocs(collection(db, "clientes"));
    const clientesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setClientes(clientesData);
  };
  useEffect(() => {
    fetchClientes();
    fetchCitas();
  }, []);

  const handleCitaAgregada = (nuevaCita) => {
    setCitas((prev) => [...prev, nuevaCita]);
  };

  const handleCitaActualizada = async (citaActualizada) => {
    // Actualizar localmente primero
    setCitas((prev) =>
      prev.map((cita) => (cita.id === citaActualizada.id ? citaActualizada : cita))
    );

    // Sincronizar con Firebase en segundo plano
    await fetchCitas(); // Llama a fetchCitas directamente
  };

  return (
    <div  className="full-screen"
    style={{
      backgroundImage: `url(${background})`,
    }}>
      <Navbar cambiarFondo={cambiarFondo}/>
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
