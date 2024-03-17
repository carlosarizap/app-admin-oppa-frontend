import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Servicios from './components/Servicios';
import ServicioForm from './components/ServicioForm';
import Categorias from './components/Categorias';
import CategoriaForm from './components/CategoriaForm';
import Clientes from './components/Clientes';
import ClienteForm from './components/ClienteForm';
import ApoderadoForm from './components/ApoderadoForm';
import Parametros from './components/Parametros';
import RegionForm from './components/RegionForm';
import Ayuda from './components/Ayuda';
import Profesiones from './components/Profesiones';
import ProfesionForm from './components/ProfesionForm';
import Proveedores from './components/Proveedores';
import ProveedorForm from './components/ProveedorForm';
import Packs from './components/Packs';
import PackForm from './components/PackForm';
import Solicitudes from './components/Solicitudes';
import Pagos from './components/Pagos';
import PagosForm from './components/PagosForm';
import Login from './components/Login';
import SolicitudDetalle from './components/SolicitudDetalle';
import Inicio from './components/Inicio';

export const URL_BACKEND = process.env.REACT_APP_SERVER_URL;

const ProtectedRoute = ({ children, isLoggedIn }) => {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const ProtectedLoginRoute = ({ children, isLoggedIn }) => {
  console.log("a")
  return isLoggedIn ? <Navigate to="/" replace /> : children;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Set up activity timer
    const activityTimer = setTimeout(() => {
      // Automatically log out after 1 minute of inactivity
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    }, 43200000); 

    // Listen for activity to reset timer
    const handleActivity = () => {
      clearTimeout(activityTimer);
      const newTimer = setTimeout(() => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }, 43200000); 
      setTimeoutId(newTimer);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      clearTimeout(activityTimer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  return (
    <Router>
      <Navigation isLoggedIn={isLoggedIn}/>
      <div className="container p-4">
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Dashboard /></ProtectedRoute>} />
          <Route path="/servicios" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Servicios /></ProtectedRoute>} />
          <Route path="/servicios/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ServicioForm /></ProtectedRoute>} />
          <Route path="/categorias" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Categorias /></ProtectedRoute>} />
          <Route path="/categorias/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><CategoriaForm /></ProtectedRoute>} />
          <Route path="/clientes/" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Clientes /></ProtectedRoute>} />
          <Route path="/clientes/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ClienteForm /></ProtectedRoute>} />
          <Route path="/apoderados/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ApoderadoForm /></ProtectedRoute>} />
          <Route path="/parametros/" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Parametros /></ProtectedRoute>} />
          <Route path="/parametros/region/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><RegionForm /></ProtectedRoute>} />
          <Route path="/ayuda" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Ayuda /></ProtectedRoute>} />
          <Route path="/profesiones" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Profesiones /></ProtectedRoute>} />
          <Route path="/profesiones/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ProfesionForm /></ProtectedRoute>} />
          <Route path="/proveedores" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Proveedores /></ProtectedRoute>} />
          <Route path="/proveedores/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ProveedorForm /></ProtectedRoute>} />
          <Route path="/packs" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Packs /></ProtectedRoute>} />
          <Route path="/packs/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><PackForm /></ProtectedRoute>} />
          <Route path="/solicitudes" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Solicitudes /></ProtectedRoute>} />
          <Route path="/pagos" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Pagos /></ProtectedRoute>} />
          <Route path="/pagos/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><PagosForm /></ProtectedRoute>} />
          <Route path="/solicitudes/:id" element={<ProtectedRoute isLoggedIn={isLoggedIn}><SolicitudDetalle /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Inicio /></ProtectedRoute>}/>
          <Route path="/login" element={<ProtectedLoginRoute isLoggedIn={isLoggedIn}><Login setIsLoggedIn={setIsLoggedIn} /></ProtectedLoginRoute>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
