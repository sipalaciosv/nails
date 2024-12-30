"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function ListarCitas({ citas, clientes, onCitaActualizada }) {
  const [editCita, setEditCita] = useState(null); // Cita en edición
  const [estado, setEstado] = useState(""); // Estado editable

  const handleEdit = (cita) => {
    setEditCita(cita);
    setEstado(cita.estado); // Inicializa el estado con el valor actual
  };

  const handleCancelEdit = () => {
    setEditCita(null);
    setEstado("");
  };

  const handleSaveEdit = async () => {
    if (!editCita) return;

    try {
      const citaRef = doc(db, "citas", editCita.id);
      await updateDoc(citaRef, { estado });

      onCitaActualizada({ ...editCita, estado }); // Actualizar en la UI
      handleCancelEdit(); // Salir del modo de edición
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
    }
  };

  const getClienteNombre = (idCliente) => {
    const cliente = clientes.find((c) => c.id === idCliente);
    return cliente ? cliente.nombre : "Desconocido";
  };

  return (
    <div>
      <h3>Listado de Citas</h3>
      {citas.length === 0 ? (
        <p>No hay citas registradas.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Servicio</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => (
                <tr key={cita.id}>
                  <td>{getClienteNombre(cita.idCliente)}</td>
                  <td>{new Date(cita.fecha.seconds * 1000).toLocaleString()}</td>
                  <td>{cita.servicio}</td>
                  <td>${cita.precio}</td>
                  <td>
                    {editCita?.id === cita.id ? (
                      <select
                        className="form-select"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmada">Confirmada</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                    ) : (
                      cita.estado
                    )}
                  </td>
                  <td>
                    {editCita?.id === cita.id ? (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={handleSaveEdit}
                        >
                          Guardar
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={handleCancelEdit}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEdit(cita)}
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
