"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown, Button } from "react-bootstrap";
import { auth } from "@/firebase"; // Asegúrate de que esta ruta sea correcta
import { signOut } from "firebase/auth";
import { useToast } from "@/components/ToastProvider";
export default function Navbar({ cambiarFondo }) {
  const [user, setUser] = useState(auth.currentUser); // Obtiene el usuario actual
  const router = useRouter();
  const { addToast } = useToast(); // Usa el contexto de toasts
  const handleLogout = async () => {
    try {
      await signOut(auth);
      addToast("Sesión cerrada exitosamente", "success"); // Muestra un toast
      router.push("/login");
    } catch (error) {
      addToast("Error al cerrar sesión: " + error.message, "danger");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container">
        <a className="navbar-brand" href="/">
          PrettyNails
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link" href="/clientes">
                Clientes
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/citas">
                Citas
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/disponibilidad">
                Disponibilidad
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/calendario">
                Calendario
              </a>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            {user && (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="light"
                  id="dropdown-basic"
                  className="navbar-profile-btn d-flex align-items-center"
                >
                  <i className="bi bi-person-circle"></i>
                </Dropdown.Toggle>

                <Dropdown.Menu className="navbar-profile-menu">
                  <Dropdown.Item href="/perfil">
                    <i className="bi bi-person-fill-gear me-2"></i> Ver Perfil
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="bi bi-person-fill-x me-2"></i> Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
            <Button
              className="btn-fondo btn-sm ms-3"
              onClick={cambiarFondo}
              title="Cambiar Fondo"
            >
              Cambiar Fondo
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
