"use client";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function Calendario() {
  const [events, setEvents] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "citas"));
        const citas = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: `${data.servicio} - ${data.estado}`,
            start: data.fecha.toDate(),
            extendedProps: {
              cliente: data.idCliente,
              notas: data.notas,
              precio: data.precio,
            },
          };
        });
        setEvents(citas);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error al obtener las citas:", error);
      }
    };

    fetchCitas();
  }, []);

  const handleEdit = (event) => {
    alert("Abrir formulario para editar: " + event.title);
  };

  const handleDelete = async (event) => {
    const confirm = window.confirm("¿Estás seguro de que deseas eliminar esta cita?");
    if (confirm) {
      try {
        await deleteDoc(doc(db, "citas", event.id));
        setEvents((prevEvents) => prevEvents.filter((e) => e.id !== event.id));
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error al eliminar la cita:", error);
      }
    }
  };

  if (!isLoaded) {
    return <div>Cargando calendario...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="container py-5">
        <h1 className="text-center mb-4">Calendario de Citas</h1>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="es"
          events={events}
          eventClick={(info) => {
            setSelectedEvent(info.event);
            setIsModalOpen(true);
          }}
        />
        {isModalOpen && selectedEvent && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Detalles de la Cita</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setIsModalOpen(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p><strong>Servicio:</strong> {selectedEvent.title}</p>
                  <p><strong>Cliente ID:</strong> {selectedEvent.extendedProps.cliente}</p>
                  <p><strong>Notas:</strong> {selectedEvent.extendedProps.notas || "Sin notas"}</p>
                  <p><strong>Precio:</strong> {selectedEvent.extendedProps.precio}</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-primary" onClick={() => handleEdit(selectedEvent)}>
                    Editar
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(selectedEvent)}>
                    Eliminar
                  </button>
                  <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
