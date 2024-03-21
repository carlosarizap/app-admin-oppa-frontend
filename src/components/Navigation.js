import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Importa axios para realizar llamadas a la API
import logoOppa from '../images/logo-oppa-2.png';
import { URL_BACKEND } from "../App";

const Navigation = ({ isLoggedIn }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const email = localStorage.getItem('email'); // Obtén el correo electrónico del almacenamiento local
        
        console.log(email)
        
        const response = await axios.get(`${URL_BACKEND}/api/administrador/find-by-email/${email}`);
  
        if (response.status === 200) {
          const adminData = response.data;
          // Verifica si el administrador tiene la capacidad de crear
          setIsAdmin(adminData.PuedeCrear);
        }
      } catch (error) {
        console.error('Error al obtener la información del administrador:', error);
      }
    };

    if (isLoggedIn) {
      fetchAdminInfo(); // Llama a la función para obtener la información del administrador al cargar el componente
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    window.location.href = '/login';
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
                {isAdmin && (
                  <li className="nav-item active fw-bold">
                    <Link className='nav-link' to="/administradores">Administradores</Link>
                  </li>
                )}
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
