"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ListarClientes from "@/components/ListarClientes";
import RegistrarCliente from "@/components/RegistrarCliente";
import EditarCliente from "@/components/EditarCliente";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { Modal } from "react-bootstrap"; // Importar el componente Modal
import { useBackground } from "@/context/BackgroundContext";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const { background, cambiarFondo } = useBackground();
  const [clienteEditando, setClienteEditando] = useState(null); // Cliente que se está editando
  const [showModal, setShowModal] = useState(false); // Controlar visibilidad del modal

  const fondos = [
    "/images/opc1.jpg",
    "/images/opc2.jpg",
    "/images/opc3.avif",
    "/images/opc4.jpg",
  ];

  useEffect(() => {
    const fetchClientes = async () => {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const clientesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientes(clientesData);
    };

    fetchClientes();
  }, []);

  const handleClienteAgregado = (nuevoCliente) => {
    setClientes((prev) => [...prev, nuevoCliente]);
  };

  const handleClienteEditado = (clienteEditado) => {
    setClientes((prev) =>
      prev.map((cliente) =>
        cliente.id === clienteEditado.id ? clienteEditado : cliente
      )
    );
    setShowModal(false); // Cierra el modal al guardar cambios
  };

  const handleEditar = (cliente) => {
    setClienteEditando(cliente); // Selecciona el cliente a editar
    setShowModal(true); // Abre el modal
  };

 

  return (
    <div
      className="full-screen"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <Navbar cambiarFondo={cambiarFondo}/>
      
      <div className="container py-5">
      <h1 className="h1-titulo">Gestión de Clientes</h1>

        

      <div className="row">
  <div className="col-md-6 mb-3 mb-md-0">
    <div className="card card-pastel">
      <h3 className="card-title titulo">
        <i className="bi bi-person-fill-add me-2"></i>Registro Cliente
      </h3>
      <RegistrarCliente onClienteAgregado={handleClienteAgregado} />
    </div>
  </div>
  <div className="col-md-6">
    <div className="card card-pastel">
      <h3 className="card-title titulo">
        <i className="bi bi-person-lines-fill me-2"></i>Clientes
      </h3>
      <ListarClientes clientes={clientes} onEdit={handleEditar} />
    </div>
  </div>
</div>
      </div>

      {/* Modal para Editar Cliente */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {clienteEditando && (
            <EditarCliente
              cliente={clienteEditando}
              onClienteEditado={handleClienteEditado}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
