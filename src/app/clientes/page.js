"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ListarClientes from "@/components/ListarClientes";
import RegistrarCliente from "@/components/RegistrarCliente";
import EditarCliente from "@/components/EditarCliente"; // Importamos el nuevo componente
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [background, setBackground] = useState("/images/opc1.jpg"); // Fondo inicial
  const [clienteEditando, setClienteEditando] = useState(null); // Cliente que se está editando

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
    setClienteEditando(null); // Salir del modo edición
  };

  const handleEditar = (cliente) => {
    setClienteEditando(cliente); // Selecciona el cliente a editar
  };

  // Cambiar fondo
  const cambiarFondo = () => {
    const currentIndex = fondos.indexOf(background);
    const nextIndex = (currentIndex + 1) % fondos.length; // Cicla entre las opciones
    setBackground(fondos[nextIndex]);
  };

  return (
    <div
      className="full-screen"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <Navbar />
      <div className="container py-5">
        <h1 className="text-center mb-4 ">Gestión de Clientes</h1>

        <div className="d-flex justify-content-center mb-4">
          <button className="btn btn-secondary" onClick={cambiarFondo}>
            Cambiar Fondo
          </button>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="card shadow-lg bg-white rounded p-3">
              {clienteEditando ? (
                <EditarCliente
                  cliente={clienteEditando}
                  onClienteEditado={handleClienteEditado}
                />
              ) : (
                <RegistrarCliente onClienteAgregado={handleClienteAgregado} />
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-lg bg-white rounded p-3">
              <ListarClientes clientes={clientes} onEdit={handleEditar} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
