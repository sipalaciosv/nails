"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import Navbar from "@/components/Navbar";
import GenerarPlantilla from "@/components/GenerarPlantilla";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { calcularRangosDisponibles } from "@/utils/horarios";
import { useBackground } from "@/context/BackgroundContext";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DisponibilidadSemanal() {
  const { background, cambiarFondo } = useBackground();
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [disponibilidadSemanal, setDisponibilidadSemanal] = useState([]);
  const [mes, setMes] = useState("");
  const [cargando, setCargando] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const obtenerLunes = (fecha) => {
    const dia = new Date(fecha);
    const diaSemana = dia.getDay();
    const diferencia = diaSemana === 0 ? -6 : 1 - diaSemana;
    dia.setDate(dia.getDate() + diferencia);
    return dia;
  };

  const obtenerDisponibilidadSemanal = async (fecha) => {
    setCargando(true);

    const lunes = obtenerLunes(fecha);

    const diasSemana = Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(lunes);
      dia.setDate(lunes.getDate() + i);
      return dia;
    });

    setMes(lunes.toLocaleDateString("es-ES", { month: "long" }));

    try {
      const citasSnapshot = await getDocs(collection(db, "citas"));
      const citas = citasSnapshot.docs.map((doc) => {
        const data = doc.data();
        const horaInicio = data.fecha.toDate();
        const horaFin = new Date(horaInicio.getTime() + data.duracionMilisegundos);

        return { horaInicio, horaFin };
      });

      const disponibilidad = await Promise.all(
        diasSemana.map(async (dia) => {
          const horarioInicio = new Date(dia.setHours(11, 0, 0, 0));
          const horarioFin = new Date(dia.setHours(19, 0, 0, 0));
          const bloqueAlmuerzo = {
            start: new Date(dia.setHours(13, 30, 0, 0)),
            end: new Date(dia.setHours(16, 0, 0, 0)),
          };

          const citasDelDia = citas.filter(
            (cita) => cita.horaInicio.toDateString() === dia.toDateString()
          );

          const rangosDisponibles = calcularRangosDisponibles(
            horarioInicio,
            horarioFin,
            citasDelDia,
            bloqueAlmuerzo
          );

          return {
            dia: dia.toLocaleDateString("es-ES", { weekday: "long" }),
            fecha: dia.getDate(),
            horarios: rangosDisponibles.map(
              (rango) =>
                `${rango.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${rango.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            ),
          };
        })
      );

      setDisponibilidadSemanal(disponibilidad);
    } catch (error) {
      console.error("Error al obtener citas:", error);
    } finally {
      setCargando(false);
    }
  };

  const handleFechaSeleccionadaChange = (e) => {
    const nuevaFecha = e.target.value;
    setFechaSeleccionada(nuevaFecha);
    if (nuevaFecha) {
      const fecha = new Date(nuevaFecha);
      obtenerDisponibilidadSemanal(fecha);
    }
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
        <h1 className="h1-titulo text-center mb-4">Disponibilidad Semanal</h1>

        <div className="card card-pastel p-4">
          {/* Fila para selector de fecha y botón */}
          <div className="row align-items-center mb-4">
            <div className="col-md-8">
              <label htmlFor="fechaSeleccionada" className="form-label">
                Selecciona una fecha:
              </label>
              <input
                type="date"
                id="fechaSeleccionada"
                className="form-control"
                value={fechaSeleccionada}
                onChange={handleFechaSeleccionadaChange}
                required
              />
            </div>
            
          </div>

          {/* Mostrar disponibilidad */}
          {cargando ? (
            <div className="text-center">
              <LoadingSpinner />
              <p>Cargando horarios...</p>
            </div>
          ) : (
            <GenerarPlantilla
              disponibilidadSemanal={disponibilidadSemanal}
              mes={mes}
            />
          )}
        </div>
      </div>
    </div>
  );
}
