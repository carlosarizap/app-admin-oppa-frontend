import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useParams, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { URL_BACKEND } from "../App";

const ProveedorForm = () => {
    const navigate = useNavigate();
    const { id: proveedorId } = useParams();
    const [proveedor, setProveedor] = useState({});
    const [bancos, setBancos] = useState([]);

    const [profesiones, setProfesiones] = useState([]);
    const [selectedProfesiones, setSelectedProfesiones] = useState([]);
    const [profesionEstado, setProfesionEstado] = useState([]);
    //Agregar servicio del proveedor
    const [serviciosProveedor, setServicioProveedor] = useState([]);
    
    const currentDate = new Date();
    
    //lista de genero
    const options = [
        { value: 'Femenino', label: 'Femenino' },
        { value: 'Masculino', label: 'Masculino' },
        { value: 'Prefiero no decir', label: 'Prefiero no decir' },
    ];
    // efectos secundarios en sus componentes. extrae todos los datos del proveedor
    useEffect(() => {
        fetchData();
    }, []);

    //funcion que extraer los datos del proveedor
    const fetchData = async () => {
        try {
            const proveedorResponse = await fetch(`${URL_BACKEND}/api/proveedores/${proveedorId}`).then((response) =>
                response.json()
            );
            const bancosResponse = await fetch(`${URL_BACKEND}/api/bancos/`).then((response) => response.json());
            const profesionesResponse = await fetch(`${URL_BACKEND}/api/profesiones/`).then((response) => response.json());
            const profesionEstadoResponse = await fetch(`${URL_BACKEND}/api/profesionEstados/`).then((response) => response.json());
            const proveedorServicioResponse = await fetch(`${URL_BACKEND}/api/proveedorServicio/`).then((response) => response.json());

            setProveedor(proveedorResponse);
            setBancos(bancosResponse.map((banco) => ({ value: banco.Nombre, label: banco.Nombre })));
            setProfesiones(profesionesResponse);
            
            const filteredProfesionEstado = profesionEstadoResponse.filter(
                (profesion) => profesion.IdProveedor === proveedorId
            );

            const filteredProveedorServicio = proveedorServicioResponse.filter(
                (proServicio) => proServicio.IdProveedor === proveedorId
            );

            setSelectedProfesiones(filteredProfesionEstado.map((profesion) => ({ value: profesion.Nombre, label: profesion.Nombre })))

            setProfesionEstado(filteredProfesionEstado);

            setProveedorServicio(filteredProveedorServicio);

        } catch (error) {
            console.error('Error fetching proveedor:', error);
        }
    };



    if (proveedor === null) {
        return <div>Loading...</div>;
    }


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation checks
        if (
            !proveedor.Rut ||
            !proveedor.Nombre ||
            !proveedor.Apellidos ||
            !proveedor.Telefono ||
            !proveedor.Correo
        ) {
            console.log('Rellena todos los campos.');
            return;
        }

        try {
            // Update the proveedor data
            await fetch(`${URL_BACKEND}/api/proveedores/${proveedorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(proveedor),
            });

            // Update the profesionEstado data
            const updatedProfesionEstado = await Promise.all(
                profesionEstado.map(async (profesion) => {
                    const response = await fetch(
                        `${URL_BACKEND}/api/profesionEstados/${profesion._id}`,
                        {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(profesion),
                        }
                    );
                    return response.json();
                })
            );

            const updatedProveedorServicio = await Promise.all(
                serviciosProveedor.map(async (servicio) => {
                    const response = await fetch(`${URL_BACKEND}/api/proveedorServicio/${servicio._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(servicio),
                    });
                    return response.json();
                })
            );

            // Update the selected professions in the profesionEstado collection
            const updatedSelectedProfesiones = await Promise.all(
                selectedProfesiones.map(async (selectedProfesion) => {
                    // Check if the selected profession already exists in profesionEstado
                    const existingProfesion = profesionEstado.find(
                        (profesion) => profesion.Nombre === selectedProfesion.label
                    );
                    if (existingProfesion) {
                        // Profession already exists, update its status
                        return {
                            ...existingProfesion,
                            Activa: true, // Set the status to true or false based on your requirement
                        };
                    } else {
                        // New profession, create a new entry in profesionEstado
                        const response = await fetch(`${URL_BACKEND}/api/profesionEstados/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                IdProveedor: proveedorId,
                                IdProfesion: selectedProfesion.IdProfesion,
                                IdCategoria: selectedProfesion.idCategoria,
                                Nombre: selectedProfesion.label,
                                Rating: 0, // Set the initial rating or other required values
                                TotalRatings: 0,
                                Activa: true, // Set the status to true or false based on your requirement
                            }),
                        });
                        return response.json();
                    }
                })
            );

            // Delete professions from profesionEstado that are not selected anymore
            const deletedProfesiones = profesionEstado.filter((profesion) => {
                const selectedProfesion = selectedProfesiones.find(
                    (selectedProfesion) => selectedProfesion.label === profesion.Nombre
                );
                return !selectedProfesion;
            });

            await Promise.all(
                deletedProfesiones.map(async (deletedProfesion) => {
                    await fetch(`${URL_BACKEND}/api/profesionEstados/${deletedProfesion._id}`, {
                        method: 'DELETE',
                    });
                })
            );
            navigate('/proveedores');
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };
    const handleDelete = async () => {
        const confirmed = window.confirm('Estás seguro de que quieres borrar este Proveedor?');
        if (!confirmed) {
            return;
        }

        try {
            const url = `${URL_BACKEND}/api/proveedores/${proveedorId}`;
            const response = await fetch(url, {
                method: 'DELETE',
            });
            const data = await response.json();
            navigate(`/proveedores`);
            console.log('Proveedor deleted successfully:', data);
        } catch (error) {
            console.error('Error deleting apoderado:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const uppercaseValue = name === 'Nombre' || name === 'Apellidos' ? value.toUpperCase() : value;
        setProveedor((prevProveedor) => ({
            ...prevProveedor,
            [name]: uppercaseValue,
        }));
    };

    const handleDateChange = (date) => {
        setProveedor((prevProveedor) => ({
            ...prevProveedor,
            Fecha_Nacimiento: date,
        }));
    };

    const handleProfesionActivaChange = (index, isActive) => {
        let updatedServicios = [];

        setProfesionEstado((prevProfesionEstado) => {
            const updatedProfesionEstado = [...prevProfesionEstado];
            updatedProfesionEstado[index].Activa = isActive;
            if(isActive === true){
                //Se activan los servicios.
                const servciosToUpdate = serviciosProveedor.filter(
                    (servicio) => servicio.IdProfesion === updatedProfesionEstado[index]._id               
                );

                updatedServicios = servciosToUpdate.map((servicio) => ({
                    ...servicio,
                    Estado: true,
                    PausadoPorOPPA: false,
                }));

            }else{
                //Se desactivan todos los servcios de la profesion.
                const servciosToUpdate = serviciosProveedor.filter(
                    (servicio) => servicio.IdProfesion === updatedProfesionEstado[index]._id               
                );

                updatedServicios = servciosToUpdate.map((servicio) => ({
                    ...servicio,
                    Estado: false,
                    PausadoPorOPPA: true,
                }));

                
            };

            setServicioProveedor((prevServiciosProveedor) => {
                const updatedServiciosProveedor = [...prevServiciosProveedor];
                updatedServicios.forEach((updatedServicio) => {
                    const index = updatedServiciosProveedor.findIndex(
                        (servicio) => servicio._id === updatedServicio._id
                    );
                    if (index !== -1) {
                        updatedServiciosProveedor[index] = updatedServicio;
                    }
                });
                return updatedServiciosProveedor;
            });

            return updatedProfesionEstado;
        });
    };

    const handleProfesionesChange = (selectedOptions) => {
        setSelectedProfesiones(selectedOptions);
    };
    

    return (
        <div className="container mt-5">
            <h1 className="text-center">Editar Proveedor</h1>
            <form className="d-flex flex-column col-6 mx-auto" onSubmit={handleSubmit}>
                <h3>Profesiones:</h3>
                <div>
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Rating</th>
                                <th>Núm. de Reseñas</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profesionEstado.map((profesion, index) => (
                                <tr key={profesion._id}>
                                    <td>{profesion.Nombre}</td>
                                    <td>{profesion.Rating}</td>
                                    <td>{profesion.TotalRatings}</td>
                                    <td>
                                        <Switch
                                            checked={profesion.Activa}
                                            onChange={(checked) => handleProfesionActivaChange(index, checked)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>


                    </table>
                </div>
                <br />
                <div className="row">

                    <Select
                        isMulti
                        options={profesiones.map((profesion) => ({
                            value: profesion.Nombre,
                            idCategoria: profesion.idCategoria,
                            IdProfesion: profesion._id,
                            label: profesion.Nombre,
                        }))}
                        value={selectedProfesiones}
                        onChange={handleProfesionesChange}
                    />
                </div>
                <br />
                <h3>Datos:</h3>
                <h5 className="mb-3 text-start">
                    RUT:
                    <input
                        className="form-control"
                        type="text"
                        name="Rut"
                        id="rutInput"
                        value={proveedor?.Rut || ''}
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
                            value={proveedor?.Nombre || ''}
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
                            value={proveedor?.Apellidos || ''}
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
                            value={proveedor?.Genero || ''}
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
                            name="Telefono"
                            value={proveedor?.Telefono || ''}
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
                                value={proveedor?.Correo || ''}
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
                                selected={proveedor.Fecha_Nacimiento ? new Date(proveedor.Fecha_Nacimiento) : null}
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
                                name="Estado"
                                value={proveedor.Estado ? "Activo" : "Inactivo"}
                                id="activoInput"
                                readOnly
                            />
                        </h5>
                    </div>
                    <div className="col-sm-2 d-flex align-items-center">
                        <Switch
                            id="estadoSwitch"
                            checked={proveedor.Estado || false}
                            onChange={(checked) => setProveedor((prevProveedor) => ({ ...prevProveedor, Estado: checked }))}
                        />
                    </div>
                    <div className="col-sm-4 d-flex align-items-center">
                        <h5 className="col mb-3 text-start">
                            Revisión:
                            <input
                                className="form-control"
                                type="text"
                                name="Revisado"
                                value={proveedor.Revisado ? "Revisado" : "Sin revisar"}
                                id="revisadoInput"
                                readOnly
                            />
                        </h5>
                    </div>
                    <div className="col-sm-2 d-flex align-items-center">
                        <Switch
                            id="esSubscriptrSwitch"
                            checked={proveedor.Revisado || false}
                            onChange={(checked) => setProveedor((prevProveedor) => ({ ...prevProveedor, Revisado: checked }))}
                        />
                    </div>
                </div>
                <h3>Datos Bancarios</h3>
                <div>
                    <h5 className="mb-1 text-start">Banco:</h5>
                    <select
                        className="form-select"
                        type="text"
                        name="Banco"
                        value={proveedor?.Banco || ''}
                        id="bancoInput"
                        onChange={handleInputChange}
                    >
                        {bancos.map((banco) => (
                            <option key={banco.value} value={banco.value}>
                                {banco.value}
                            </option>
                        ))}
                    </select>

                </div>


                <div className='row'>

                    <h5 className="col mb-3 text-start">
                        RUT Cuenta:
                        <input
                            className="form-control"
                            type="text"
                            name="RutCuenta"
                            value={proveedor?.RutCuenta || ''}
                            id="rutCuentaInput"
                            onChange={handleInputChange}
                            required


                        />
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Tipo Cuenta:
                        <select
                            className="form-select"
                            type="text"
                            name="TipoCuenta"
                            value={proveedor?.TipoCuenta || ''}
                            id="tipoCuentaInput"
                            onChange={handleInputChange}
                        >
                            <option value="Cuenta Vista">Cuenta Vista</option>
                            <option value="Cuenta de Ahorro">Cuenta de Ahorro</option>
                            <option value="Cuenta Corriente">Cuenta Corriente</option>
                        </select>

                    </h5>

                </div>
                <div className='row'>
                    <h5 className="col mb-3 text-start">
                        Número de Cuenta:
                        <input
                            className="form-control"
                            type="text"
                            name="NumCuenta"
                            value={proveedor?.NumCuenta || ''}
                            id="numCuentaInput"
                            onChange={handleInputChange}
                            required


                        />
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Nombre Titular:
                        <input
                            className="form-control"
                            type="text"
                            name="TitularCuenta"
                            value={proveedor?.TitularCuenta || ''}
                            id="titularCuentaInput"
                            onChange={handleInputChange}
                            required

                        />
                    </h5>

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

export default ProveedorForm;