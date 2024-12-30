"use client";

import { useState } from "react";

export default function ListarClientes({ clientes, onEdit }) {
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const itemsPerPage = 6; // Número de clientes por página
  const [expandedNotes, setExpandedNotes] = useState({}); // Controla qué notas están expandidas

  // Filtrar clientes según el término de búsqueda
  const clientesFiltrados = clientes.filter((cliente) => {
    const search = searchTerm.toLowerCase();
    return (
      cliente.nombre.toLowerCase().includes(search) ||
      cliente.whatsapp.toLowerCase().includes(search)
    );
  });

  // Calcular la paginación
  const totalPages = Math.ceil(clientesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const clientesPaginados = clientesFiltrados.slice(startIndex, endIndex);

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

  const toggleNote = (id) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [id]: !prev[id], // Cambia el estado de expandido o contraído
    }));
  };

  return (
    <div>
      {/* Campo de Búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por nombre o WhatsApp"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reiniciar a la primera página al buscar
          }}
        />
      </div>

      {/* Lista de Clientes Filtrados y Paginados */}
      <div className="row">
        {clientesPaginados.length > 0 ? (
          clientesPaginados.map((cliente) => (
            <div key={cliente.id} className="col-md-4 mb-3">
              <div className="card shadow-sm border-0 rounded-lg">
                <div className="card-body">
                  <h5 className="card-title text-truncate">{cliente.nombre}</h5>
                  <p className="card-text">
                    <strong>WhatsApp:</strong> {cliente.whatsapp}
                  </p>
                  <p
                    className={`card-text text-muted ${
                      expandedNotes[cliente.id] ? "expanded" : "text-ellipsis"
                    }`}
                    onClick={() => toggleNote(cliente.id)} // Alterna expandir/contraer al hacer clic
                    style={{ cursor: "pointer" }}
                  >
                    <strong>Notas:</strong>{" "}
                    {cliente.notas || "Sin notas"}
                  </p>
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onEdit(cliente)}
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No se encontraron resultados.</p>
        )}
      </div>

      {/* Controles de Paginación */}
      {clientesFiltrados.length > itemsPerPage && (
        <div className="d-flex justify-content-between mt-3">
          <button
            className="btn btn-secondary"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="btn btn-secondary"
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
