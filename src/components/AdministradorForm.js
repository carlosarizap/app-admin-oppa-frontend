import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useParams, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { URL_BACKEND } from "../App";

const AdministradorForm = () => {
    const navigate = useNavigate();
    const { id: administradorId } = useParams();
    const [administrador, setAdministrador] = useState({});

    useEffect(() => {
        // La lógica para cargar el administrador existente debe ejecutarse solo si se está editando
        if (administradorId && administradorId !== "crear") {
            const fetchAdministrador = async () => {
                try {
                    const response = await fetch(`${URL_BACKEND}/api/administrador/${administradorId}`);
                    const data = await response.json();
                    setAdministrador(data);
                } catch (error) {
                    console.error('Error fetching administrador:', error);
                }
            };
            fetchAdministrador();
        }
    }, [administradorId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validation checks
        if (!administrador.Email || !administrador.Password) {
            console.log('Rellena todos los campos.');
            return;
        }
    
        try {
            let url = `${URL_BACKEND}/api/administrador`;
            let method = 'POST'; // Por defecto, se crea un nuevo administrador

            // Si hay un ID de administrador, significa que estamos en modo de edición
            if (administradorId && administradorId !== "crear") {
                url += `/${administradorId}`;
                method = 'PUT';
            }

            if(administrador.PuedeCrear == null){
                administrador.PuedeCrear = false;
            }

            // Actualiza o crea el administrador
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...administrador
                }),
            });

            if (response.ok) {
                navigate('/administradores');
            } else {
                console.error('Error submitting form:', response.statusText);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm('Estás seguro de que quieres borrar este Administrador?');
        if (!confirmed) {
            return;
        }

        try {
            const url = `${URL_BACKEND}/api/administrador/${administradorId}`;
            const response = await fetch(url, {
                method: 'DELETE',
            });
            const data = await response.json();
            navigate(`/administradores`);
            console.log('Administrador deleted successfully:', data);
        } catch (error) {
            console.error('Error deleting administrador:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAdministrador((prevAdministrador) => ({
            ...prevAdministrador,
            [name]: value,
        }));
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">{administradorId && administradorId !== "crear" ? 'Editar Administrador' : 'Crear Administrador'}</h1>
            <form className="d-flex flex-column col-6 mx-auto" onSubmit={handleSubmit}>
                <div className='row'>
                    <h5 className="col mb-3 text-start">
                        Correo:
                        <input
                            className="form-control"
                            type="email"
                            name="Email"
                            id="emailInput"
                            value={administrador?.Email || ''}
                            onChange={handleInputChange}
                            required
                        />
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Contraseña:
                        <input
                            className="form-control"
                            type="text"
                            name="Password"
                            id="passwordInput"
                            value={administrador?.Password || ''}
                            onChange={handleInputChange}
                            required
                        />
                    </h5>
                </div>
                <div className="row justify-content-center">
                    <div className="col-6">
                        {administradorId && administradorId !== "crear" && ( // Solo muestra el botón de borrar si estamos editando un administrador existente
                            <button className="btn btn-danger" onClick={handleDelete}>
                                BORRAR
                            </button>
                        )}
                        <button type="submit" className="btn btn-primary">
                            {administradorId && administradorId !== "crear" ? 'MODIFICAR' : 'CREAR'} {/* Cambia el texto del botón según el modo */}
                        </button>
                    </div>
                </div>
            </form >
        </div >
    );
};

export default AdministradorForm;
