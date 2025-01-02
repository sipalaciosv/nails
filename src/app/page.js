"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/clientes"); // Redirige a Clientes si está autenticado
      } else {
        router.push("/login"); // Redirige a Login si no está autenticado
      }
    });

    return () => unsubscribe(); // Limpia el listener al desmontar el componente
  }, [router]);

  return <p>Cargando...</p>; // Mensaje temporal mientras se verifica la autenticación
}
