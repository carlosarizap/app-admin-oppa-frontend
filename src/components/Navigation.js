import React from 'react';
import { Link } from 'react-router-dom';
import logoOppa from '../images/logo-oppa-2.png';

const Navigation = ({ isLoggedIn }) => { // Receive isLoggedIn as a prop
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    // No need to update isLoggedIn here since it's managed in App component
    // Redirect to login page or any other desired location
    window.location.href = '/login'; // Redirect to login page
  };

  return (
    <nav className="navbar navbar-expand-lg">
      <div className='container'>
        <Link className='navbar-brand' to="/">
          <img src={logoOppa} alt="Example" style={{ width: '200px', height: 'auto' }} />
        </Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isLoggedIn && (
              <>
                <li className="nav-item active fw-bold">
                  <Link className='nav-link' to="/">Inicio</Link>
                </li>
                <li className="nav-item active fw-bold">
                  <Link className='nav-link' to="/solicitudes">Solicitudes</Link>
                </li>
                <li className="nav-item active fw-bold">
                  <Link className='nav-link' to="/servicios">Servicios</Link>
                </li>
                <li className="nav-item active fw-bold">
                  <Link className='nav-link' to="/packs">Packs</Link>
                </li>
                <li className="nav-item active fw-bold">
                  <Link className='nav-link' to="/categorias">Categorías</Link>
                </li>
                <li className="nav-item active fw-bold">
                  <Link className='nav-link' to="/profesiones">Profesiones</Link>
                </li>
                <li className="nav-item active fw-bold">
                  <Link className='nav-link' to="/clientes">Clientes</Link>
                </li>
                <li className="nav-item active fw-bold">
                  <Link className='nav-link' to="/proveedores">Proveedores</Link>
                </li>
                <li className="nav-item active fw-bold">
                  <Link className='nav-link' to="/pagos">Pagos</Link>
                </li>
                <li className="nav-item active fw-bold">
                  <Link className='nav-link' to="/parametros">Parámetros</Link>
                </li>
                <li className="nav-item active fw-bold">
                  <Link className='nav-link' to="/ayuda">Ayuda</Link>
                </li>
                <li className="nav-item active fw-bold">
                  <Link className='nav-link btn btn-link' onClick={handleLogout}>Cerrar Sesión</Link>
                </li>
              </>
            )}
            {!isLoggedIn && (
              <li className="nav-item active fw-bold">
                <Link className='nav-link' to="/login">Iniciar Sesión</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
