import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importa axios para realizar solicitudes HTTP
import '../index.css'; 
import { URL_BACKEND } from "../App";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState(''); // Almacena el código generado
  const [successMessage, setSuccessMessage] = useState(''); // New state for success message


  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(`${URL_BACKEND}/api/administrador/find-by-email/${email}`);
  
      if (response.status === 200) {
        const code = generateCode();
        setGeneratedCode(code);
  
        const sendEmailResponse = await axios.post(`${URL_BACKEND}/api/sendGrid/send-email`, {
          recipientEmail: email,
          subject: 'Código de Verificación - OPPA',
          body: `Tu código de verificación para cambiar tu contraseña es: ${code}. Utiliza este código para continuar con tu cambio de contraseña. Este código expira en 15 minutos.`
        });
  
        if (sendEmailResponse.status === 200) {
          setIsEmailSent(true);
          setError('');
        }
      }
    } catch (error) {
      if (error.response.status === 404) {
        // El correo electrónico no se encontró en la base de datos
        setError('El correo electrónico no está registrado. Por favor, proporciona un correo electrónico válido.');
      } else {
        // Error al realizar la solicitud HTTP
        console.log(error);
        setError('Error al verificar el correo electrónico. Por favor, inténtalo de nuevo más tarde.');
      }
    }
  };
  
  
  
  

  const handleSubmitVerificationCode = async (e) => {
    e.preventDefault();

    // Verificar el código de verificación ingresado por el usuario
    if (verificationCode === generatedCode) {
      // Código de verificación correcto, mostrar los campos de contraseña y el botón de cambio
      setShowVerificationForm(true);
      setError();
    } else {
      // Código de verificación incorrecto, mostrar un mensaje de error
      setError('Código de verificación incorrecto. Inténtalo nuevamente.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Verify if passwords match
    if (newPassword === confirmPassword) {
      setError('');
      try {
        // Make HTTP request to update password
        const response = await axios.put(`${URL_BACKEND}/api/administrador/update-password`, {
          email: email,
          newPassword: newPassword,
        });

        if (response.status === 200) {
          // Password changed successfully
          setSuccessMessage('Contraseña cambiada exitosamente.');
          // Redirect to login page after a delay
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setError('Error al cambiar la contraseña. Inténtalo más tarde.');
        }
      } catch (error) {
        console.log(error);
        setError('Error al cambiar la contraseña. Inténtalo más tarde.');
      }
    } else {
      setError('Las contraseñas no coinciden. Inténtalo nuevamente.');
    }
  };
  
  
  const generateCode = () => {
    // Generar un código aleatorio de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000);
    return code.toString();
  };
  
  return (
    <div className="main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', maxHeight: '100vh', overflowY: 'auto' }}>
      <h2>Cambiar Contraseña</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {!isEmailSent && (
        <form onSubmit={handleSubmitEmail}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="form-control"
              required
            />
          </div>
          <div style={{ textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary">Enviar código</button>
          </div>
        </form>
      )}
      {isEmailSent && !showVerificationForm && (
        <form onSubmit={handleSubmitVerificationCode}>
          <div className="form-group">
            <label htmlFor="verificationCode">Código de Verificación:</label>
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              className="form-control"
              required
            />
          </div>
          <div style={{ textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary">Verificar</button>
          </div>
        </form>
      )}
      {showVerificationForm && (
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña:</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="form-control"
              required
            />
          </div>
          <div style={{ textAlign: 'right' }}>
            <button type="submit" className="btn btn-primary">Cambiar Contraseña</button>
          </div>
        </form>
      )}
    </div>  
  );
};

export default ForgotPassword;
