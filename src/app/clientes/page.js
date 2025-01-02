"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase"; // Asegúrate de que esté configurado correctamente
import Navbar from "@/components/Navbar";
import ListarClientes from "@/components/ListarClientes";
import RegistrarCliente from "@/components/RegistrarCliente";
import EditarCliente from "@/components/EditarCliente";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { Modal } from "react-bootstrap";
import { useBackground } from "@/context/BackgroundContext";
import LoadingSpinner from "@/components/LoadingSpinner"; // Importa el componente LoadingSpinner

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // Estado del usuario autenticado
  const [loading, setLoading] = useState(true); // Estado de carga
  const { background, cambiarFondo } = useBackground();
  const [clienteEditando, setClienteEditando] = useState(null); // Cliente que se está editando
  const [showModal, setShowModal] = useState(false); // Controlar visibilidad del modal
  const router = useRouter();

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user); // Usuario autenticado
        setLoading(false); // Deja de cargar
      } else {
        router.push("/login"); // Redirigir al login si no está autenticado
      }
    });

    return () => unsubscribe(); // Limpiar el listener al desmontar el componente
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      const fetchClientes = async () => {
        setLoading(true); // Empieza a cargar datos
        const querySnapshot = await getDocs(collection(db, "clientes"));
        const clientesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClientes(clientesData);
        setLoading(false); // Deja de cargar datos
      };

      fetchClientes();
    }
  }, [currentUser]);

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

  if (loading) {
    return <LoadingSpinner />; // Usa el componente LoadingSpinner
  }

  return currentUser ? (
    <div
      className="full-screen"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <Navbar cambiarFondo={cambiarFondo} />
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
  ) : null;
}
