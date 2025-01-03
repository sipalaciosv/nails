"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/auth"; // Asegúrate de que la ruta sea correcta
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { useToast } from "@/components/ToastProvider";
const RegisterPage = () => {
  const { addToast } = useToast(); // Usa el contexto de toasts
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar errores previos
    setSuccess(null); // Limpiar mensajes de éxito
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await register(email, password);
      addToast("Registro exitoso. ¡Bienvenido!", "success"); // Muestra un toast
      router.push("/login");
    } catch (error) {
      addToast("Error al registrar: " + error.message, "danger"); // Muestra un toast de error
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <div className="p-4 shadow rounded bg-white">
            <h1 className="text-center mb-4">Regístrate</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="email" className="mb-3">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group controlId="password" className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Crea una contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group controlId="confirmPassword" className="mb-3">
                <Form.Label>Confirma tu contraseña</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100">
                Registrarse
              </Button>
            </Form>
            <p className="text-center mt-3">
              ¿Ya tienes cuenta?{" "}
              <a href="/login" className="text-primary">
                Inicia sesión
              </a>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
