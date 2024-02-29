import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; 
import { URL_BACKEND } from "../App";
import Cookies from 'js-cookie';

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${URL_BACKEND}/api/administrador/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Login successful
        const data = await response.json();
        localStorage.setItem('token', data.token); // Store token in localStorage
        setIsLoggedIn(true);
        navigate('/solicitudes');
      } else {
        // Login failed
        setError('Correo o contraseña incorrecta.');
      }
    } catch (error) {
      // Handle network errors
      console.error('Error al enviar la solicitud:', error);
      setError('Error al enviar la solicitud. Inténtalo de nuevo más tarde.');
    }
  };

  return (
    <div className="main">
      <h2>Iniciar Sesión</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico:</label>
          <input
            id="email"
            value={email}
            onChange={handleEmailChange}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            className="form-control"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
      </form>
    </div>  
  );
};

export default Login;
