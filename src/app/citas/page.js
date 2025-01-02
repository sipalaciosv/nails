"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import Navbar from "@/components/Navbar";
import RegistrarCita from "@/components/RegistrarCita";
import ListarCitas from "@/components/ListarCitas";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useBackground } from "@/context/BackgroundContext";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Citas() {
  const { background, cambiarFondo } = useBackground();
  const [clientes, setClientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(false); // Usuario autenticado, deja de cargar
        fetchClientes();
        fetchCitas();
      } else {
        router.push("/login"); // Redirige al login si no está autenticado
      }
    });

    return () => unsubscribe(); // Limpia el listener al desmontar
  }, [router]);

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

  const handleCitaAgregada = (nuevaCita) => {
    setCitas((prev) => [...prev, nuevaCita]);
  };

  const handleCitaActualizada = async (citaActualizada) => {
    setCitas((prev) =>
      prev.map((cita) => (cita.id === citaActualizada.id ? citaActualizada : cita))
    );
    await fetchCitas(); // Sincroniza los datos con Firebase
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <div
      className="full-screen"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <Navbar cambiarFondo={cambiarFondo} />
      <div className="container py-5">
        <h1 className="h1-titulo">Gestión de Citas</h1>
        <div className="row">
          <div className="col-md-6 mb-3 mb-md-0">
            <div className="card card-pastel">
              <h3 className="card-title titulo">
                <i className="bi bi-calendar-plus me-2"></i>Registrar Cita
              </h3>
              <RegistrarCita
                clientes={clientes}
                onCitaAgregada={handleCitaAgregada}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="card card-pastel">
              <h3 className="card-title titulo">
                <i className="bi bi-calendar-check me-2"></i>Listado de Citas
              </h3>
              <ListarCitas
                citas={citas}
                clientes={clientes}
                onCitaActualizada={handleCitaActualizada}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
