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
  
      const clientesMap = {};
      clientesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        clientesMap[doc.id] = {
          nombre: data.nombre,
          telefono: data.whatsapp?.replace("+", "") || null,
          instagram: data.instagram || null,
          facebook: data.facebook || null,
        };
      });
  
      const citasData = citasSnapshot.docs.map((doc) => {
        const data = doc.data();
        const cliente = clientesMap[data.idCliente] || { nombre: "Desconocido", telefono: null };
        return {
          id: doc.id,
          title: `${cliente.nombre} - ${data.servicio}`,
          start: data.fecha.toDate(),
          end: new Date(data.fecha.toDate().getTime() + data.duracionMilisegundos),
          cliente: cliente.nombre,
          telefono: cliente.telefono,
          instagram: cliente.instagram,
          facebook: cliente.facebook, // Incluye correctamente el campo Facebook
          estado: data.estado,
          notas: data.notas,
          precio: data.precio,
          abono: data.abono || 0,
        };
      });
  
      setCitas(citasData);
    } catch (error) {
      console.error("Error al cargar citas:", error);
    }
  };
  
  
  const fetchClienteDetails = async (idCliente) => {
    try {
      const clienteSnapshot = await getDocs(collection(db, "clientes"));
      const clienteDoc = clienteSnapshot.docs.find((doc) => doc.id === idCliente);
      if (clienteDoc) {
        const clienteData = clienteDoc.data();
        return {
          telefono: clienteData.whatsapp?.replace("+", "") || null,
          instagram: clienteData.instagram || null,
          facebook: clienteData.facebook || null,
        };
      }
      return { telefono: null, instagram: null, facebook: null };
    } catch (error) {
      console.error("Error al obtener los detalles del cliente:", error);
      return { telefono: null, instagram: null, facebook: null };
    }
  };
  
  const handleCopiarRecordatorio = () => {
    if (!modalData) {
      alert("No hay datos de la cita para copiar el mensaje.");
      return;
    }
  
    const mensaje = `Hola ${modalData.cliente}, queremos confirmar su cita programada para el ${modalData.start.toLocaleDateString()} a las ${modalData.start.toLocaleTimeString()}. ¿Podría confirmarnos?`;
  
    navigator.clipboard
      .writeText(mensaje)
      .then(() => {
        alert("Mensaje copiado al portapapeles.");
      })
      .catch((err) => {
        console.error("Error al copiar al portapapeles:", err);
        alert("Hubo un problema al copiar el mensaje.");
      });
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
    const cliente = citas.find((cita) => cita.id === event.id);
    if (cliente) {
      setModalData({
        ...event,
        telefono: cliente.telefono,
        instagram: cliente.instagram,
        facebook: cliente.facebook, // Asegúrate de incluirlo
      });
    }
    setIsEditing(false);
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
              backgroundColor = "#6aa3b4";
              break;
            case "Confirmada":
              backgroundColor = "#77dd77";
              break;
            case "Cancelada":
              backgroundColor = "#ff6961";
              break;
            default:
              backgroundColor = "#ebe6ea"; // Color por defecto
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
              onCancelar={() => setIsEditing(false)}
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
                <strong>Abono:</strong> ${modalData.abono || 0}
              </p>
              {modalData.telefono && (
                <p>
                  <strong>WhatsApp:</strong>{" "}
                  <a
                    href={`https://wa.me/${modalData.telefono}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-whatsapp"
                  >
                    <i className="bi bi-whatsapp"></i> Enviar WhatsApp
                  </a>
                </p>
              )}
              {modalData.facebook && (
  <p>
    <strong>Facebook:</strong>{" "}
    <a
      href={modalData.facebook}
      target="_blank"
      rel="noopener noreferrer"
    >
      Ver perfil
    </a>
  </p>
)}
{modalData.instagram && (
  <p>
    <strong>Instagram:</strong>{" "}
    <a
      href={modalData.instagram}
      target="_blank"
      rel="noopener noreferrer"
    >
      Ver perfil
    </a>
  </p>
)}
              <p>
                <strong>Notas:</strong> {modalData.notas || "Sin notas"}
              </p>
            </>
          )}
        </Modal.Body>
        
        )}
        <Modal.Footer>
  {!isEditing ? (
    <Button className="btn-edit" onClick={() => setIsEditing(true)}>
      Editar
    </Button>
  ) : null}
  <Button className="btn-borrar" onClick={closeModal}>
    {isEditing ? "Cancelar" : "Cerrar"}
  </Button>
  <Button className="btn-whatsapp" onClick={handleEnviarWhatsApp}>
    <i className="bi bi-whatsapp"></i> Enviar WhatsApp
  </Button>
  
  {modalData && (
    <div style={{ width: "100%", marginTop: "10px" }}>
      <label htmlFor="recordatorioTextarea">
        <strong>Texto del Recordatorio:</strong>
      </label>
      <textarea
        id="recordatorioTextarea"
        readOnly
        style={{ width: "100%", height: "100px", marginTop: "5px" }}
        value={`Hola ${modalData.cliente}, queremos confirmar su cita programada para el ${modalData.start.toLocaleDateString()} a las ${modalData.start.toLocaleTimeString()}. ¿Podría confirmarnos?`}
      />
      <Button
        variant="primary"
        onClick={() => {
          const textarea = document.getElementById("recordatorioTextarea");
          textarea.select();
          textarea.setSelectionRange(0, 99999); // Para dispositivos móviles
          
        }}
        style={{ marginTop: "10px" }}
      >
        Seleccionar Texto
      </Button>
    </div>
  )}
</Modal.Footer>

      </Modal>
    </div>
  );
}
