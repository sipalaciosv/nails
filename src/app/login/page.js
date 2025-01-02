"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/auth"; // Asegúrate de que la ruta sea correcta
import { Form, Button, Alert, Container, Row, Col } from "react-bootstrap";
import { useToast } from "@/components/ToastProvider";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const { addToast } = useToast(); // Usa el contexto de toasts
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar errores previos
    try {
      const user = await login(email, password);
      addToast("Inicio de sesión exitoso", "success");
      router.push("/clientes"); // Redirige al inicio tras iniciar sesión
    } catch (error) {
      addToast("Error al iniciar sesión: " + error.message, "danger"); // Muestra un toast de error
      setError("Error al iniciar sesión: " + error.message);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <div className="p-4 shadow rounded bg-white">
            <h1 className="text-center mb-4">Iniciar Sesión</h1>
            {error && <Alert variant="danger">{error}</Alert>}
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
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100">
                Iniciar Sesión
              </Button>
            </Form>
            <p className="text-center mt-3">
              ¿No tienes cuenta?{" "}
              <a href="/register" className="text-primary">
                Regístrate
              </a>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
