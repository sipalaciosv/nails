"use client";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import "@/app/globals.css";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function Calendario() {
  const [events, setEvents] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Formulario de edición
  const [servicio, setServicio] = useState("");
  const [estado, setEstado] = useState("");
  const [fecha, setFecha] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshotClientes = await getDocs(collection(db, "clientes"));
        const clientesData = querySnapshotClientes.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClientes(clientesData);

        const querySnapshotCitas = await getDocs(collection(db, "citas"));
        const citas = querySnapshotCitas.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.servicio,
            start: data.fecha.toDate(),
            extendedProps: {
              cliente: data.idCliente,
              notas: data.notas,
              precio: data.precio,
              estado: data.estado || "Sin estado",
              fecha: data.fecha.toDate(),
            },
          };
        });
        setEvents(citas);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, []);

  const getClienteNombre = (idCliente) => {
    const cliente = clientes.find((c) => c.id === idCliente);
    return cliente ? cliente.nombre : "Cliente desconocido";
  };
  const getEventClassNames = (event) => {
    if (!event.extendedProps || !event.extendedProps.estado) {
      return [];
    }
  
    switch (event.extendedProps.estado) {
      case "Pendiente":
        return ["event-pendiente"];
      case "Confirmada":
        return ["event-confirmada"];
      case "Cancelada":
        return ["event-cancelada"];
      default:
        return [];
    }
  };
  
  const handleEdit = () => {
    setEditMode(true);
    setServicio(selectedEvent.title.split(" - ")[0]);
    setEstado(selectedEvent.title.split(" - ")[1]);
    setFecha(selectedEvent.extendedProps.fecha.toISOString().slice(0, 16));
    setNotas(selectedEvent.extendedProps.notas || "");
  };

  const handleSaveEdit = async () => {
    try {
      const citaRef = doc(db, "citas", selectedEvent.id);
      const updatedCita = {
        servicio,
        estado,
        fecha: new Date(fecha),
        notas,
      };
      await updateDoc(citaRef, updatedCita);

      // Actualiza la lista de eventos
      setEvents((prev) =>
        prev.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: `${servicio} - ${estado}`,
                start: new Date(fecha),
                extendedProps: { ...event.extendedProps, ...updatedCita },
              }
            : event
        )
      );

      setEditMode(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("¿Estás seguro de que deseas eliminar esta cita?");
    if (confirm) {
      try {
        await deleteDoc(doc(db, "citas", selectedEvent.id));
        setEvents((prevEvents) => prevEvents.filter((e) => e.id !== selectedEvent.id));
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
          eventClassNames={(event) => getEventClassNames(event)}
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
                  <h5 className="modal-title">
                    Detalles de la Cita - {getClienteNombre(selectedEvent.extendedProps.cliente)}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setIsModalOpen(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {editMode ? (
                    <div>
                      <label>Servicio:</label>
                      <input
                        className="form-control mb-2"
                        value={servicio}
                        onChange={(e) => setServicio(e.target.value)}
                      />
                      <label>Estado:</label>
                      <select
                        className="form-select mb-2"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmada">Confirmada</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                      <label>Fecha y Hora:</label>
                      <input
                        className="form-control mb-2"
                        type="datetime-local"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                      />
                      <label>Notas:</label>
                      <textarea
                        className="form-control"
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                      ></textarea>
                    </div>
                  ) : (
                    <div>
                      <p><strong>Servicio:</strong> {selectedEvent.title}</p>
                      <p><strong>Estado:</strong> {selectedEvent.extendedProps.estado}</p>
                      <p><strong>Cliente:</strong> {getClienteNombre(selectedEvent.extendedProps.cliente)}</p>
                      <p><strong>Notas:</strong> {selectedEvent.extendedProps.notas || "Sin notas"}</p>
                      <p><strong>Precio:</strong> {selectedEvent.extendedProps.precio}</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  {editMode ? (
                    <button className="btn btn-success" onClick={handleSaveEdit}>
                      Guardar Cambios
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={handleEdit}>
                      Editar
                    </button>
                  )}
                  <button className="btn btn-danger" onClick={handleDelete}>
                    Eliminar
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditMode(false);
                      setIsModalOpen(false);
                    }}
                  >
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
