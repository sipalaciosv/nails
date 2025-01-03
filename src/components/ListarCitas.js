"use client";

import { useState } from "react";
import EditarCita from "./EditarCita";
import EliminarCita from "./EliminarCita";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Modal } from "react-bootstrap";

export default function ListarCitas({ citas, clientes, onCitaActualizada }) {
  const [mensaje, setMensaje] = useState("");
  const [editCita, setEditCita] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [showModal, setShowModal] = useState(false);
  const [citaEditando, setCitaEditando] = useState(null);

  const getClienteNombre = (idCliente) => {
    const cliente = clientes.find((c) => c.id === idCliente);
    return cliente ? cliente.nombre : "Desconocido";
  };

  const citasFiltradas = citas.filter((cita) =>
    getClienteNombre(cita.idCliente)
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const totalPages = Math.ceil(citasFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const citasPaginadas = citasFiltradas.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleEditar = (cita) => {
    setCitaEditando(cita);
    setShowModal(true);
  };

  const handleActualizar = (nuevaCita) => {
    onCitaActualizada((prevCitas) =>
      prevCitas.map((cita) => (cita.id === nuevaCita.id ? nuevaCita : cita))
    );
    setShowModal(false);
  };

  const handleEliminar = (idCita) => {
    onCitaActualizada((prevCitas) =>
      prevCitas.filter((cita) => cita.id !== idCita)
    );
    setMensaje("Cita eliminada correctamente.");
  };

  const handleEnviarWhatsApp = (telefono, cliente, fecha, hora) => {
    if (!telefono) {
      alert("El cliente no tiene un número de WhatsApp asociado.");
      return;
    }

    const baseUrl = "https://wa.me/";
    const mensaje = `Hola ${cliente}, queremos confirmar su cita programada para el ${fecha} a las ${hora}. ¿Podría confirmarnos?`;

    const url = `${baseUrl}${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <div>
      {mensaje && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {mensaje}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMensaje("")}
            aria-label="Close"
          ></button>
        </div>
      )}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre del cliente"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>
      {citasPaginadas.length === 0 ? (
        <p>No se encontraron citas.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>Servicio</th>
                <th>Precio</th>
                <th>Abono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
  {citasPaginadas.map((cita) => (
    <tr key={cita.id}>
      <td>{getClienteNombre(cita.idCliente)}</td>
      <td>
        {format(cita.fecha.toDate(), "dd-MM-yyyy", { locale: es })}
      </td>
      <td>{format(cita.fecha.toDate(), "hh:mm a", { locale: es })}</td>
      <td>
        {format(
          new Date(
            cita.fecha.toDate().getTime() + cita.duracionMilisegundos
          ),
          "hh:mm a",
          { locale: es }
        )}
      </td>
      <td>{cita.servicio}</td>
      <td>${cita.precio}</td>
<td>${cita.abono || 0}</td>
      <td>{cita.estado}</td>
      <td>
        <div className="d-flex gap-2">
          <button
            className="btn btn-whatsapp btn-sm"
            onClick={() =>
              handleEnviarWhatsApp(
                clientes
                  .find((c) => c.id === cita.idCliente)
                  ?.whatsapp.replace("+", ""),
                getClienteNombre(cita.idCliente),
                format(cita.fecha.toDate(), "dd-MM-yyyy"),
                format(cita.fecha.toDate(), "hh:mm a")
              )
            }
          >
            <i className="bi bi-whatsapp"></i>
          </button>
          <button
            className="btn btn-edit btn-sm"
            onClick={() => handleEditar(cita)}
          >
            Editar
          </button>
          <EliminarCita idCita={cita.id} onEliminar={handleEliminar} />
        </div>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Cita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {citaEditando && (
            <EditarCita
              cita={citaEditando}
              onActualizar={handleActualizar}
              onCancelar={() => setShowModal(false)}
            />
          )}
        </Modal.Body>
      </Modal>
      {citasFiltradas.length > itemsPerPage && (
        <div className="d-flex justify-content-between mt-3">
          <button
            className="btn-pagination"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="btn-pagination"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
