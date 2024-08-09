import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useParams, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { URL_BACKEND } from "../App";

const ClienteForm = () => {
    const navigate = useNavigate();
    const { id: clienteId } = useParams();
    const [cliente, setCliente] = useState({});
    const [monedero, setMonedero] = useState({});
    const [apoderados, setApoderados] = useState([]);
    const [selectedApoderados, setSelectedApoderados] = useState([]);
    const [subscripcion, setSubscripcion] = useState({});
    const currentDate = new Date();
    const options = [
        { value: 'Femenino', label: 'Femenino' },
        { value: 'Masculino', label: 'Masculino' },
        { value: 'Prefiero no decir', label: 'Prefiero no decir' },
    ];

    useEffect(() => {
        const fetchCliente = async () => {
            try {
                const response = await fetch(`${URL_BACKEND}/api/clientes/${clienteId}`);
                const responseMonedero = await fetch(`${URL_BACKEND}/api/monedero/cliente/${clienteId}`);
                const data = await response.json();
                const dataMonedero = await responseMonedero.json();
                setCliente(data);
                setMonedero(dataMonedero);
                setSelectedApoderados(data.Apoderados || []);
            } catch (error) {
                console.error('Error fetching cliente:', error);
            }
        };


        const fetchSubscripcion = async () => {
            try {
                const response = await fetch(`${URL_BACKEND}/api/subscripcion/cliente/${clienteId}`);
                const data = await response.json();
                setSubscripcion(data);
            } catch (error) {
                console.error('Error fetching subscripcion:', error);
            }
        };

        if (clienteId) {
            fetchCliente();
            fetchSubscripcion();
        }
    }, [clienteId]);

    useEffect(() => {
        const fetchApoderados = async () => {
            try {
                const response = await fetch(`${URL_BACKEND}/api/apoderados`);
                const data = await response.json();

                // Filter the apoderados based on Cliente.Apoderados
                const filteredApoderados = data.filter((apoderado) =>
                    cliente?.Apoderados?.includes(apoderado._id)
                );

                setApoderados(filteredApoderados);
            } catch (error) {
                console.error('Error fetching apoderados:', error);
            }
        };

        fetchApoderados();
    }, [cliente?.Apoderados]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation checks
        if (
            !cliente.Rut ||
            !cliente.Nombre ||
            !cliente.Apellidos ||
            !cliente.Numero_Telefonico ||
            !cliente.Correo
        ) {
            console.log('Rellena todos los campos.');
            return;
        }

        try {
            // Actualiza el cliente
            await fetch(`${URL_BACKEND}/api/clientes/${clienteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...cliente,
                    Apoderados: selectedApoderados,
                }),
            });

            // Actualiza el saldo del monedero
            await fetch(`${URL_BACKEND}/api/monedero/${monedero._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Saldo: monedero.Saldo,
                    // Otros campos del monedero, si es necesario
                }),
            });

            navigate('/clientes');
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm('Estás seguro de que quieres borrar este Cliente?');
        if (!confirmed) {
            return;
        }

        try {
            const url = `${URL_BACKEND}/api/clientes/${clienteId}`;
            const response = await fetch(url, {
                method: 'DELETE',
            });
            const data = await response.json();
            navigate(`/clientes`);
            console.log('Cliente deleted successfully:', data);
        } catch (error) {
            console.error('Error deleting apoderado:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const uppercaseValue = name === 'Nombre' || name === 'Apellidos' ? value.toUpperCase() : value;
        setCliente((prevCliente) => ({
            ...prevCliente,
            [name]: uppercaseValue,
        }));
    };

    const handleDateChange = (date) => {
        setCliente((prevCliente) => ({
            ...prevCliente,
            Fecha_Nacimiento: date,
        }));
    };

    const handleMonederoInputChange = (e) => {
        const { value } = e.target;
        setMonedero((prevMonedero) => ({
            ...prevMonedero,
            Saldo: value,
        }));
    };




    const handleApoderadosChange = (selectedOptions) => {
        const selectedApoderados = selectedOptions ? selectedOptions.map((option) => option.value) : [];
        setSelectedApoderados(selectedApoderados);
    };

    const handleSubscriptionSwitch = async (checked) => {
        console.log(checked);
        console.log(subscripcion);

        // Caso 1: La suscripción no existe y se presiona activar
        if (subscripcion?.error && checked) {
            try {
                const newSubscription = {
                    _id: `${clienteId}-subscription`, // or use a more unique ID generation method
                    FechaHora: new Date(),
                    UltimoPago: new Date(),
                    ProximoPago: new Date(new Date().setFullYear(new Date().getFullYear() + 100)),
                    Desactivar: false,
                    Activa: true,
                    IdCliente: clienteId,
                    IdApoderado: null,
                    Rut: cliente.Rut,
                    TbkUser: cliente.TbkUser || "", // Assuming this is fetched with cliente data
                };

                const response = await fetch(`${URL_BACKEND}/api/subscripcion`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newSubscription),
                });

                const data = await response.json();
                setSubscripcion(data); // Actualizar el estado local con la nueva suscripción
            } catch (error) {
                console.error('Error creating subscription:', error);
            }
        }
        // Caso 2: La suscripción existe y se presiona activar
        else if (subscripcion && checked) {
            try {
                const updatedSubscription = {
                    ...subscripcion,
                    FechaHora: new Date(),
                    UltimoPago: new Date(),
                    ProximoPago: new Date(new Date().setFullYear(new Date().getFullYear() + 100)),
                    Desactivar: false,
                    Activa: true,
                };

                const response = await fetch(`${URL_BACKEND}/api/subscripcion/${subscripcion._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedSubscription),
                });

                const data = await response.json();
                setSubscripcion(data); // Actualizar el estado local con la suscripción actualizada
            } catch (error) {
                console.error('Error updating subscription:', error);
            }
        }
        // Caso 3: Se presiona desactivar
        else if (subscripcion && !checked) {
            try {
                const updatedSubscription = {
                    ...subscripcion,
                    Activa: false,
                    Desactivar: false,
                };

                const response = await fetch(`${URL_BACKEND}/api/subscripcion/${subscripcion._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedSubscription),
                });

                const data = await response.json();
                setSubscripcion(data); // Actualizar el estado local con la suscripción desactivada
            } catch (error) {
                console.error('Error updating subscription:', error);
            }
        }
    };




    return (
        <div className="container mt-5">
            <h1 className="text-center">Editar Cliente</h1>
            <form className="d-flex flex-column col-6 mx-auto" onSubmit={handleSubmit}>
                <div className='row'>

                    <h5 className="col mb-3 text-start">
                        RUT:
                        <input
                            className="form-control"
                            type="text"
                            name="Rut"
                            id="rutInput"
                            value={cliente?.Rut || ''}
                            onChange={handleInputChange}
                            required
                        />
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Saldo en monedero:
                        <input
                            className="form-control"
                            type="number"
                            name="Saldo"
                            id="saldoInput"
                            value={monedero?.Saldo || ''}
                            onChange={handleMonederoInputChange}
                            required
                        />

                    </h5>
                </div>

                <div className='row'>
                    <h5 className="col mb-3 text-start">
                        Nombre:
                        <input
                            className="form-control"
                            type="text"
                            name="Nombre"
                            value={cliente?.Nombre || ''}
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
                            value={cliente?.Apellidos || ''}
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
                            value={cliente?.Genero || ''}
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
                            value={cliente?.Numero_Telefonico || ''}
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
                                value={cliente?.Correo || ''}
                                id="correoInput"
                                onChange={handleInputChange}
                                required
                            />
                        </h5>
                    </div>
                    <div className="col-sm-6">
                        <h5 className="mb-3 text-start">
                            Fecha de Nacimiento:
                            <DatePicker
                                className='form-control'
                                type="date"
                                name="Fecha_Nacimiento"
                                selected={cliente.Fecha_Nacimiento ? new Date(cliente.Fecha_Nacimiento) : null}
                                onChange={handleDateChange}
                                dateFormat="dd/MM/yyyy"
                                maxDate={currentDate}
                                required
                            />
                        </h5>
                    </div>
                </div>

                <div className='row'>
                    <div className="col-sm-4 d-flex align-items-center">
                        <h5 className="col mb-3 text-start">
                            Estado:
                            <input
                                className="form-control"
                                type="text"
                                name="Activo"
                                value={cliente.Activo ? "Activo" : "Inactivo"}
                                id="activoInput"
                                readOnly
                            />
                        </h5>
                    </div>
                    <div className="col-sm-2 d-flex align-items-center">
                        <Switch
                            id="activoSwitch"
                            checked={cliente.Activo || false}
                            onChange={(checked) => setCliente((prevCliente) => ({ ...prevCliente, Activo: checked }))}
                        />
                    </div>
                    <div className="col-sm-4 d-flex align-items-center">
                        <h5 className="col mb-3 text-start">
                            Suscripción:
                            <input
                                className="form-control"
                                type="text"
                                name="EsSubscriptor"
                                value={subscripcion?.Activa ? "Activa" : "Inactiva"}
                                id="esSubscriptorInput"
                                readOnly
                            />
                        </h5>
                    </div>
                    <div className="col-sm-2 d-flex align-items-center">
                        <Switch
                            id="esSubscriptrSwitch"
                            checked={subscripcion?.Activa || false}
                            onChange={handleSubscriptionSwitch}
                        />
                    </div>
                </div>



                <div className="">
                    <h5 className="mb-2">Apoderados:</h5>
                    <Select
                        isMulti
                        options={apoderados.map((apoderado) => ({
                            value: apoderado._id,
                            label: apoderado.Rut + " " + apoderado.Nombre + " " + apoderado.Apellidos
                        }))}
                        onChange={handleApoderadosChange}
                        value={selectedApoderados
                            .filter((apoderadoId) => apoderados.find((apoderado) => apoderado._id === apoderadoId))
                            .map((apoderadoId) => ({
                                value: apoderadoId,
                                label: apoderados.find((apoderado) => apoderado._id === apoderadoId).Rut + " " +
                                    apoderados.find((apoderado) => apoderado._id === apoderadoId).Nombre + " " +
                                    apoderados.find((apoderado) => apoderado._id === apoderadoId).Apellidos
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
            </form >
        </div >
    );
};

export default ClienteForm;