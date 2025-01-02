"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import EditarCita from "@/components/EditarCita";

const locales = { es };
const localizer = dateFnsLocalizer({
  format: (date, formatStr, options) => format(date, formatStr, { ...options, locale: es }),
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: es }),
  getDay,
  locales: { es },
});

export default function Calendario() {
  const [citas, setCitas] = useState([]);
  const [modalData, setModalData] = useState(null); // Cita seleccionada para el modal
  const [isEditing, setIsEditing] = useState(false);

  // Cargar citas desde Firebase
  const fetchCitas = async () => {
    try {
      const citasSnapshot = await getDocs(collection(db, "citas"));
      const clientesSnapshot = await getDocs(collection(db, "clientes"));

      // Crear un mapa de clientes para buscar rápidamente por ID
      const clientesMap = {};
      clientesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        clientesMap[doc.id] = {
          nombre: data.nombre,
          telefono: data.whatsapp.replace("+", ""), // Elimina el "+" para el enlace
        };
      });

      const citasData = citasSnapshot.docs.map((doc) => {
        const data = doc.data();
        const cliente = clientesMap[data.idCliente] || { nombre: "Desconocido", telefono: "" };
        return {
          id: doc.id,
          title: `${cliente.nombre} - ${data.servicio}`,
          start: data.fecha.toDate(),
          end: new Date(data.fecha.toDate().getTime() + data.duracionMilisegundos),
          fecha: data.fecha, // Para EditarCita
          duracionMilisegundos: data.duracionMilisegundos, // Para EditarCita
          cliente: cliente.nombre,
          telefono: cliente.telefono,
          estado: data.estado,
          notas: data.notas,
          precio: data.precio,
          servicio: data.servicio, // Agrega el servicio
        };
      });
      setCitas(citasData);
    } catch (error) {
      console.error("Error al cargar citas:", error);
    }
  };

  const handleEnviarWhatsApp = () => {
    if (!modalData || !modalData.telefono) {
      alert("El cliente no tiene un número de WhatsApp asociado.");
      return;
    }

    const baseUrl = "https://wa.me/";
    const mensaje = `Hola ${modalData.cliente}, queremos confirmar su cita programada para el ${modalData.start.toLocaleDateString()} a las ${modalData.start.toLocaleTimeString()}. ¿Podría confirmarnos?`;

    // Generar el enlace de WhatsApp
    const url = `${baseUrl}${modalData.telefono}?text=${encodeURIComponent(mensaje)}`;

    // Abrir en una nueva pestaña
    window.open(url, "_blank");
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  const handleSelectEvent = (event) => {
    setModalData(event); // Establece la cita seleccionada
    setIsEditing(false); // Asegúrate de que no esté en modo edición al abrir
  };

  const closeModal = () => {
    setModalData(null); // Cierra el modal
    setIsEditing(false); // Salir del modo edición
  };

  const handleActualizar = (citaActualizada) => {
    setCitas((prev) =>
      prev.map((cita) =>
        cita.id === citaActualizada.id
          ? {
              ...citaActualizada,
              start: citaActualizada.fecha.toDate(),
              end: new Date(
                citaActualizada.fecha.toDate().getTime() +
                  citaActualizada.duracionMilisegundos
              ),
            }
          : cita
      )
    );
    setIsEditing(false); // Salir del modo edición
    setModalData(null); // Cerrar modal
  };

  return (
    <div>
      <h3 className="text-center mb-4">Calendario de Citas</h3>
      <Calendar
        localizer={localizer}
        events={citas}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "80vh" }}
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          date: "Fecha",
          time: "Hora",
          event: "Evento",
          noEventsInRange: "No hay citas en este rango.",
        }}
        eventPropGetter={(event) => {
          let backgroundColor;

          // Asignar colores según el estado
          switch (event.estado) {
            case "Pendiente":
              backgroundColor = "orange";
              break;
            case "Confirmada":
              backgroundColor = "green";
              break;
            case "Cancelada":
              backgroundColor = "red";
              break;
            default:
              backgroundColor = "gray"; // Color por defecto
          }

          return {
            style: {
              backgroundColor,
              color: "white",
              borderRadius: "5px",
              border: "none",
              padding: "5px",
            },
          };
        }}
        onSelectEvent={handleSelectEvent}
      />

      {/* Modal para detalles y edición */}
      <Modal show={!!modalData} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Editar Cita" : "Detalles de la Cita"}
          </Modal.Title>
        </Modal.Header>
        {modalData && (
          <Modal.Body>
            {isEditing ? (
              <EditarCita
                cita={{
                  ...modalData,
                  fecha: Timestamp.fromDate(modalData.start),
                  duracionMilisegundos:
                    modalData.end.getTime() - modalData.start.getTime(),
                }}
                onActualizar={handleActualizar}
                onCancelar={() => setIsEditing(false)} // Salir del modo edición
              />
            ) : (
              <>
                <p>
                  <strong>Cliente:</strong> {modalData.cliente}
                </p>
                <p>
                  <strong>Servicio:</strong> {modalData.servicio}
                </p>
                <p>
                  <strong>Fecha:</strong> {modalData.start.toLocaleString()}
                </p>
                <p>
                  <strong>Estado:</strong> {modalData.estado}
                </p>
                <p>
                  <strong>Precio:</strong> ${modalData.precio}
                </p>
                <p>
                  <strong>Notas:</strong> {modalData.notas || "Sin notas"}
                </p>
              </>
            )}
          </Modal.Body>
        )}
        <Modal.Footer>
          {isEditing ? null : (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
          )}
          <Button variant="secondary" onClick={closeModal}>
            {isEditing ? "Cancelar" : "Cerrar"}
          </Button>
          <Button variant="info" onClick={handleEnviarWhatsApp}>
            Enviar WhatsApp
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
