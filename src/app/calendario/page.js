"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import Calendario from "@/components/Calendario";
import Navbar from "@/components/Navbar";
import { useBackground } from "@/context/BackgroundContext";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Page() {
  const { background, cambiarFondo } = useBackground();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(false); // Usuario autenticado
      } else {
        router.push("/login"); // Redirige al login si no está autenticado
      }
    });

    return () => unsubscribe(); // Limpia el listener al desmontar
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
      <Navbar cambiarFondo={cambiarFondo} />
      <div className="container py-4 d-flex justify-content-center align-items-center">
        <div
          className="card shadow-lg p-4"
          style={{
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "15px",
          }}
        >
          <h3 className="card-title titulo">
            <i className="bi bi-calendar3 me-2"></i>Calendario citas
          </h3>
          <Calendario />
        </div>
      </div>
    </div>
  );
}
