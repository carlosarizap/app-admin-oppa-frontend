import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useParams, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { URL_BACKEND } from "../App";

const ApoderadoForm = () => {
    const navigate = useNavigate();
    const { id: apoderadoId } = useParams();
    const [apoderado, setApoderado] = useState({});
    const [clientes, setClientes] = useState([]);
    const [selectedClientes, setSelectedClientes] = useState([]);
    const currentDate = new Date();
    const options = [
        { value: 'Femenino', label: 'Femenino' },
        { value: 'Masculino', label: 'Masculino' },
        { value: 'Prefiero no decir', label: 'Prefiero no decir' },
    ];

    useEffect(() => {
        const fetchApoderado = async () => {
            try {
                const response = await fetch(`${URL_BACKEND}/api/apoderados/${apoderadoId}`);
                const data = await response.json();
                setApoderado(data);
                setSelectedClientes(data.Clientes || []);
            } catch (error) {
                console.error('Error fetching apoderado:', error);
            }
        };

        if (apoderadoId) {
            fetchApoderado();
        }
    }, [apoderadoId]);


    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await fetch(`${URL_BACKEND}/api/clientes`);
                const data = await response.json();

                const filteredClientes = data.filter((cliente) =>
                    apoderado?.Clientes?.includes(cliente._id)
                );

                setClientes(filteredClientes);
            } catch (error) {
                console.error('Error fetching Clientes:', error);
            }
        };

        fetchClientes();
    }, [apoderado?.Clientes]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation checks
        if (
            !apoderado.Rut ||
            !apoderado.Nombre ||
            !apoderado.Apellidos ||
            !apoderado.Numero_Telefonico ||
            !apoderado.Correo
        ) {
            console.log('Rellena todos los campos.');
            return;
        }


        try {
            // Your existing code for submitting the form
            await fetch(`${URL_BACKEND}/api/apoderados/${apoderadoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...apoderado,
                    Clientes: selectedClientes,
                }),
            });

            navigate('/clientes');
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm('Estás seguro de que quieres borrar este Apoderado?');
        if (!confirmed) {
            return;
        }

        try {
            const url = `${URL_BACKEND}/api/apoderados/${apoderadoId}`;
            const response = await fetch(url, {
                method: 'DELETE',
            });
            const data = await response.json();
            navigate(`/apoderados`);
            console.log('Apoderado deleted successfully:', data);
        } catch (error) {
            console.error('Error deleting apoderado:', error);
        }
    };



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const uppercaseValue = (name === "Nombre" || name === "Apellidos") ? value.toUpperCase() : value;

        setApoderado((prevApoderado) => ({
            ...prevApoderado,
            [name]: uppercaseValue,
        }));
    };



    const handleDateChange = (date) => {
        setApoderado((prevApoderado) => ({
            ...prevApoderado,
            Fecha_Nacimiento: date,
        }));
    };

    const handleClientesChange = (selectedOptions) => {
        const selectedClientes = selectedOptions ? selectedOptions.map((option) => option.value) : [];
        setSelectedClientes(selectedClientes);
    };


    return (
        <div className="container mt-5">
            <h1 className="text-center">Editar Apoderado</h1>
            <form className="d-flex flex-column col-6 mx-auto" onSubmit={handleSubmit}>
                <h5 className="mb-3 text-start">
                    RUT:
                    <input
                        className="form-control"
                        type="text"
                        name="Rut"
                        id="rutInput"
                        value={apoderado?.Rut || ''}
                        onChange={handleInputChange}
                        required
                    />
                </h5>
                <div className='row'>
                    <h5 className="col mb-3 text-start">
                        Nombre:
                        <input
                            className="form-control"
                            type="text"
                            name="Nombre"
                            value={apoderado?.Nombre || ''}
                            id="nombreInput"
                            onChange={handleInputChange}
                            required


                        />
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Apellidos:
                        <input
                            className="form-control"
                            type="text"
                            name="Apellidos"
                            value={apoderado?.Apellidos || ''}
                            id="apellidosInput"
                            onChange={handleInputChange}
                            required

                        />
                    </h5>
                </div>
                <div className='row'>
                    <h5 className="col mb-3 text-start">
                        Género:
                        <select
                            className="form-select"
                            name="Genero"
                            value={apoderado?.Genero || ''}
                            id="generoInput"
                            onChange={handleInputChange}
                            required
                        >
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Número:
                        <input
                            className="form-control"
                            type="number"
                            name="Numero_Telefonico"
                            value={apoderado?.Numero_Telefonico || ''}
                            id="numeroTelefonicoInput"
                            onChange={handleInputChange}
                            required
                        />
                    </h5>
                </div>
                <div className="row align-items-center">
                    <div className="col-sm-6">
                        <h5 className="mb-3 text-start">
                            Correo:
                            <input
                                className="form-control"
                                type="text"
                                name="Correo"
                                value={apoderado?.Correo || ''}
                                id="correoInput"
                                onChange={handleInputChange}
                                required

                            />
                        </h5>

                    </div>

                    <div className="col-sm-6">
                        <h5 className="text-start">
                            Fecha de Nacimiento:
                            <DatePicker
                                className='form-control'
                                type="date"
                                name="Fecha_Nacimiento"
                                selected={apoderado.Fecha_Nacimiento ? new Date(apoderado.Fecha_Nacimiento) : null}
                                onChange={handleDateChange}
                                dateFormat="dd/MM/yyyy"
                                maxDate={currentDate}
                                required

                            />
                        </h5>
                    </div>
                </div>

                <div className="row align-items-center">


                    <div className="col-sm-4 d-flex align-items-center">
                        <h5 className="col mb-3 text-start">
                            Suscripción:
                            <input
                                className="form-control"
                                type="text"
                                name="EsSubscriptor"
                                value={apoderado.EsSubscriptor ? "Activa" : "Inactiva"}
                                id="esSubscriptorInput"
                                readOnly
                            />
                        </h5>
                    </div>
                    <div className="col-sm-2 d-flex align-items-center">
                        <Switch
                            id="esSubscriptorSwitch"
                            checked={apoderado.EsSubscriptor || false}
                            onChange={(checked) => setApoderado((prevApoderado) => ({ ...prevApoderado, EsSubscriptor: checked }))}
                        />
                    </div>
                    <div className="col-sm-4 d-flex align-items-center">
                        <h5 className="col mb-3 text-start">
                            Estado:
                            <input
                                className="form-control"
                                type="text"
                                name="Activo"
                                value={apoderado.Activo ? "Activo" : "Inactivo"}
                                id="activoInput"
                                readOnly
                            />
                        </h5>
                    </div>
                    <div className="col-sm-2 d-flex align-items-center">
                        <Switch
                            id="activoSwitch"
                            checked={apoderado.Activo || false}
                            onChange={(checked) => setApoderado((prevApoderado) => ({ ...prevApoderado, Activo: checked }))}
                        />
                    </div>
                    


                </div>

                <div className="">
                        <h5 className="mb-2">Apadrinados:</h5>
                        <Select
                            isMulti
                            options={clientes.map((cliente) => ({
                                value: cliente._id,
                                label: cliente.Rut + " " + cliente.Nombre + " " + cliente.Apellidos
                            }))}
                            onChange={handleClientesChange}
                            value={selectedClientes
                                .filter((clienteId) => clientes.find((cliente) => cliente._id === clienteId))
                                .map((clienteId) => ({
                                    value: clienteId,
                                    label: clientes.find((cliente) => cliente._id === clienteId).Rut + " " +
                                    clientes.find((cliente) => cliente._id === clienteId).Nombre + " " +
                                        clientes.find((cliente) => cliente._id === clienteId).Apellidos
                                }))}
                        />

                    </div>

                <div className="row justify-content-center">
                    <div className="col-6">
                        <button className="btn btn-danger" onClick={handleDelete}>
                            BORRAR
                        </button>
                        <button type="submit" className="btn btn-primary">
                            MODIFICAR
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default ApoderadoForm;
