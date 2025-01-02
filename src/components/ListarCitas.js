"use client";

import { useState } from "react";
import EditarCita from "./EditarCita";
import EliminarCita from "./EliminarCita";
import { format } from "date-fns";
import { es } from "date-fns/locale"; // Para formato en español
import { Modal } from "react-bootstrap"; // Importa el modal
export default function ListarCitas({ citas, clientes, onCitaActualizada }) {
  const [mensaje, setMensaje] = useState("");
  const [editCita, setEditCita] = useState(null);
  const [busqueda, setBusqueda] = useState(""); // Estado para el buscador
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const itemsPerPage = 3; // Número de citas por página
  const [showModal, setShowModal] = useState(false);
const [citaEditando, setCitaEditando] = useState(null);

  const formatFecha = (fecha) => {
    const dateObj = fecha.toDate();
    return format(dateObj, "dd-MM-yyyy, hh:mm a", { locale: es });
  };
  // Función para obtener el nombre del cliente
  const getClienteNombre = (idCliente) => {
    const cliente = clientes.find((c) => c.id === idCliente);
    return cliente ? cliente.nombre : "Desconocido";
  };

  // Calcular hora de finalización estimada
  const calcularHoraFin = (fechaInicio, duracionMilisegundos) => {
    if (!fechaInicio || !duracionMilisegundos) return "Sin datos";
    const inicio = fechaInicio.toDate(); // Convierte el Timestamp de Firebase a Date
    const fin = new Date(inicio.getTime() + duracionMilisegundos); // Suma la duración en milisegundos
    return fin.toLocaleString(); // Devuelve la fecha/hora legible
  };

  // Filtrar citas según el término de búsqueda
  const citasFiltradas = citas.filter((cita) =>
    getClienteNombre(cita.idCliente)
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // Calcular la paginación
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
    setShowModal(true); // Abre el modal
  };

  const handleActualizar = (nuevaCita) => {
    onCitaActualizada((prevCitas) =>
      prevCitas.map((cita) => (cita.id === nuevaCita.id ? nuevaCita : cita))
    );
    setShowModal(false); // Cierra el modal
  };

  const handleEliminar = (idCita) => {
    onCitaActualizada((prevCitas) => prevCitas.filter((cita) => cita.id !== idCita));
    setMensaje("Cita eliminada correctamente.");
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
            setCurrentPage(1); // Reiniciar a la primera página al buscar
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
                <th>Hora Fin Estimada</th>
                <th>Servicio</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citasPaginadas.map((cita) => (
                <tr key={cita.id}>
                  <td>{getClienteNombre(cita.idCliente)}</td>
                  <td>
  <div style={{ whiteSpace: "nowrap" }}>
    <div>{format(cita.fecha.toDate(), "dd-MM-yyyy", { locale: es })}</div>
    <div>{format(cita.fecha.toDate(), "hh:mm a", { locale: es })}</div>
  </div>
</td>
<td>
  <div style={{ whiteSpace: "nowrap" }}>
    <div>{format(new Date(cita.fecha.toDate().getTime() + cita.duracionMilisegundos), "dd-MM-yyyy", { locale: es })}</div>
    <div>{format(new Date(cita.fecha.toDate().getTime() + cita.duracionMilisegundos), "hh:mm a", { locale: es })}</div>
  </div>
</td>
                  <td>{cita.servicio}</td>
                  <td>${cita.precio}</td>
                  <td>{editCita?.id === cita.id ? "Editando..." : cita.estado}</td>
                  <td>
                    {editCita?.id === cita.id ? (
                      <EditarCita
                        cita={editCita}
                        onCancelar={() => setEditCita(null)}
                        onActualizar={handleActualizar}
                      />
                    ) : (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-edit btn-sm"
                          onClick={() => handleEditar(cita)}
                        >
                          Editar
                        </button>
                        <EliminarCita idCita={cita.id} onEliminar={handleEliminar} />
                      </div>
                    )}
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
      {/* Controles de Paginación */}
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
