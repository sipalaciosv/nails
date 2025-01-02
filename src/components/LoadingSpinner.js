import { Spinner } from "react-bootstrap";

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Cargando...</span>
    </Spinner>
  </div>
);

export default LoadingSpinner;
