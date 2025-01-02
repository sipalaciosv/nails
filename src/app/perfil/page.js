"use client";

import { useState, useEffect } from "react";
import { auth } from "@/firebase"; // Asegúrate de que esta ruta sea correcta
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar"; // Importa el Navbar
import { useBackground } from "@/context/BackgroundContext"; // Importa el contexto de fondo
import LoadingSpinner from "@/components/LoadingSpinner";

const PerfilPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { background, cambiarFondo } = useBackground(); // Usa el contexto para el fondo

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push("/login"); // Redirige al login si no está autenticado
      }
    });

    return () => unsubscribe(); // Limpia el listener al desmontar el componente
  }, [router]);

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
      <Navbar cambiarFondo={cambiarFondo} /> {/* Agrega el Navbar */}
      <div className="container py-5">
        <h1 className="mb-4">Perfil de Usuario</h1>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Información Personal</h5>
            <p className="card-text">
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;
