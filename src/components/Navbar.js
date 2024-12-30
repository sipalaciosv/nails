"use client";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-custom ">
      <div className="container">
        <a className="navbar-brand" href="/">
          NailsApp
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
          <ul className="navbar-nav">
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
          </ul>
        </div>
      </div>
    </nav>
  );
}
