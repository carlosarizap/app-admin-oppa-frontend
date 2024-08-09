import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import '../index.css';
import * as XLSX from 'xlsx';
import { URL_BACKEND } from "../App";

const Clientes = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tablaCliente');
    const [clientes, setClientes] = useState([]);
    const [apoderados, setApoderados] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('Despejar');
    const [subscripciones, setSubscripciones] = useState([]);


    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Filter the clientes array based on the search query




    const handleRowClickCliente = (clienteId) => {
        navigate(`/clientes/${clienteId}`);
    };

    const handleRowClickApoderado = (apoderadoId) => {
        navigate(`/apoderados/${apoderadoId}`);
    };

    useEffect(() => {
        // Fetch clientes data from the API
        const fetchClientes = async () => {
     
            try {
                const response = await fetch(`${URL_BACKEND}/api/clientes`);
                const data = await response.json();
                setClientes(data);
            } catch (error) {
                console.error('Error fetching clientes:', error);
            }
        };

        // Fetch apoderados data from the API
        const fetchApoderados = async () => {
            try {
                const response = await fetch(`${URL_BACKEND}/api/apoderados`);
                const data = await response.json();
                setApoderados(data);
            } catch (error) {
                console.error('Error fetching apoderados:', error);
            }
        };

        const fetchSubscripciones = async () => {
            try {
                const response = await fetch(`${URL_BACKEND}/api/subscripcion`);
                const data = await response.json();
                setSubscripciones(data);
            } catch (error) {
                console.error('Error fetching subscripciones:', error);
            }
        };

        fetchClientes();
        fetchApoderados();
        fetchSubscripciones();
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const getSubscriptorStatus = (id, type) => {
        const subscripcion = subscripciones.find(sub => 
            (type === 'cliente' && sub.IdCliente === id) || 
            (type === 'apoderado' && sub.IdApoderado === id)
        );
        return subscripcion ? subscripcion.Activa : false;
    };

    const handleEstadoChangeCliente = async (checked, clienteId) => {
        try {

            await fetch(`${URL_BACKEND}/api/clientes/${clienteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Activo: checked }),
            });


            setClientes((prevClientes) =>
                prevClientes.map((cliente) =>
                    cliente._id === clienteId ? { ...cliente, Activo: checked } : cliente
                )
            );
        } catch (error) {
            console.error('Error updating cliente:', error);
        }
    };

    const handleEstadoChangeApoderado = async (checked, apoderadoId) => {
        try {

            await fetch(`${URL_BACKEND}/api/apoderados/${apoderadoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Activo: checked }),
            });


            setApoderados((prevApoderados) =>
                prevApoderados.map((apoderado) =>
                    apoderado._id === apoderadoId ? { ...apoderado, Activo: checked } : apoderado
                )
            );
        } catch (error) {
            console.error('Error updating apoderado:', error);
        }
    };

    const handleDownloadExcelClientes = () => {
        const modifiedClientes = clientes.map((cliente) => ({
            ...cliente,
            Apoderados: cliente.Apoderados.join(', '), // Convert the array to a comma-separated string of IDs
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(modifiedClientes, {
            header: [
                '_id',
                'FechaHora',
                'Rut',
                'Password',
                'Nombre',
                'Apellidos',
                'Genero',
                'Correo',
                'Numero_Telefonico',
                'IdApoderadoPrincipal',
                'EsSubscriptor',
                'Activo',
                'Fecha_Nacimiento',
                'Apoderados',
            ],
            skipHeader: false,
        });

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
        const excelBuffer = XLSX.write(workbook, {
            type: 'array',
            bookType: 'xlsx',
        });
        const data = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'clientes.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const handleDownloadExcelApoderados = () => {
        const modifiedApoderados = apoderados.map((apoderado) => ({
            ...apoderado,
            Clientes: apoderado.Clientes.join(', '), // Convert the array to a comma-separated string of IDs
        }));

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(modifiedApoderados, {
            header: [
                '_id',
                'FechaHora',
                'Rut',
                'Password',
                'Nombre',
                'Apellidos',
                'Genero',
                'Correo',
                'Numero_Telefonico',
                'Fecha_Nacimiento',
                'Clientes',
                'EsSubscriptor',
                'Activo',
            ],
            skipHeader: false,
        });

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Apoderados');
        const excelBuffer = XLSX.write(workbook, {
            type: 'array',
            bookType: 'xlsx',
        });
        const data = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'apoderados.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const renderCliente = () => {
        //let filteredClientes = clientes;
        let filteredClientes = clientes.filter((cliente) =>
            (cliente.Rut.includes(searchQuery.toUpperCase()) || cliente.Nombre.includes(searchQuery.toUpperCase()) || cliente.Apellidos.includes(searchQuery.toUpperCase()))
        );

        if (estadoFilter === 'Despejar') {
            // Do not apply any filtering based on the Estado property
        }
        else if (estadoFilter === 'Activo') {
            filteredClientes = filteredClientes.filter((cliente) => cliente.Activo === true);
        } else if (estadoFilter === 'Inactivo') {
            filteredClientes = filteredClientes.filter((cliente) => cliente.Activo === false);
        }
        else if (estadoFilter === 'Subscriptor') {
            filteredClientes = filteredClientes.filter((cliente) => cliente.EsSubscriptor === true);
        } else if (estadoFilter === 'NoSubscriptor') {
            filteredClientes = filteredClientes.filter((cliente) => cliente.EsSubscriptor === false);
        }
        return (
            <div>

                <div className="d-flex justify-content-between align-items-center">
                    <h1>Clientes</h1>
                    <div className="input-buttons-container d-flex align-items-center">
                        <div className="d-flex">
                            <div>
                                <input
                                    className="btn-check btn-todos"
                                    type="radio"
                                    name="estadoFilter"
                                    id="estadoFilter1"
                                    value="Despejar"
                                    checked={estadoFilter === 'Despejar'}
                                    onChange={() => setEstadoFilter('Despejar')}
                                />
                                <label className="btn btn-todos btn-secondary" htmlFor="estadoFilter1">
                                    Todos
                                </label>
                            </div>

                            <div>
                                <input
                                    className="btn-check"
                                    type="radio"
                                    name="estadoFilter"
                                    id="estadoFilter2"
                                    value="Estado1"
                                    checked={estadoFilter === 'Activo'}
                                    onChange={() => setEstadoFilter('Activo')}
                                />
                                <label className="btn btn-activo btn-secondary" htmlFor="estadoFilter2">
                                    Activos
                                </label>
                            </div>

                            <div>
                                <input
                                    className="btn-check"
                                    type="radio"
                                    name="estadoFilter"
                                    id="estadoFilter3"
                                    value="Estado2"
                                    checked={estadoFilter === 'Inactivo'}
                                    onChange={() => setEstadoFilter('Inactivo')}
                                />
                                <label className="btn btn-inactivo btn-secondary" htmlFor="estadoFilter3">
                                    Inactivos
                                </label>
                            </div>

                            <div>
                                <input
                                    className="btn-check"
                                    type="radio"
                                    name="subscriptorFilter"
                                    id="subscriptorFilter2"
                                    value="Subscriptor"
                                    checked={estadoFilter === 'Subscriptor'}
                                    onChange={() => setEstadoFilter('Subscriptor')}
                                />
                                <label className="btn btn-suscriptor btn-secondary" htmlFor="subscriptorFilter2">
                                    Subscriptores
                                </label>
                            </div>

                            <div>
                                <input
                                    className="btn-check"
                                    type="radio"
                                    name="subscriptorFilter"
                                    id="subscriptorFilter3"
                                    value="NoSubscriptor"
                                    checked={estadoFilter === 'NoSubscriptor'}
                                    onChange={() => setEstadoFilter('NoSubscriptor')}
                                />
                                <label className="btn btn-nosuscriptor btn-secondary" htmlFor="subscriptorFilter3">
                                    No Subscriptores
                                </label>
                            </div>
                        </div>


                        <div className="form-group has-search">
                            <span className="fa fa-search form-control-feedback"></span>
                            <input
                                type="text"
                                className="form-control"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Buscar por RUT..."
                            />
                            {searchQuery && (
                                <button
                                    className="btn btn-clear"
                                    onClick={() => setSearchQuery('')}
                                >
                                    <span className="fa fa-times"></span>
                                </button>
                            )}
                        </div>

                        <div className="d-flex align-items-center">
                            <button className="btn btn-excel" onClick={handleDownloadExcelClientes}>DESCARGAR EXCEL</button>
                        </div>

                    </div>
                </div>

                <div className="tabla-container">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Rut</th>
                                <th>Nombre</th>
                                <th>Apellidos</th>
                                <th>Género</th>
                                <th>Correo</th>
                                <th>Número</th>
                                <th>Fecha Nac.</th>
                                <th>Apoderados</th>
                                <th>Suscripción</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClientes.map((cliente) => (
                                <tr key={cliente._id} onDoubleClick={() => handleRowClickCliente(cliente._id)}>
                                    <td>{cliente.Rut}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {cliente.Nombre}
                                    </td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {cliente.Apellidos}
                                    </td>
                                    <td>{cliente.Genero}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {cliente.Correo}
                                    </td>
                                    <td>{cliente.Numero_Telefonico}</td>
                                    <td>
                                        {new Date(cliente.Fecha_Nacimiento).toLocaleDateString('es-ES')}
                                    </td>

                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {cliente.Apoderados.map((apoderadoId, index) => {
                                            const apoderado = apoderados.find((c) => c._id === apoderadoId);
                                            return apoderado ? (index ? `, ${apoderado.Rut}` : apoderado.Rut) : '';
                                        })}
                                    </td>
                                    <td className={getSubscriptorStatus(cliente._id, 'cliente') ?  'green-text' : 'red-text'}>
                                    {getSubscriptorStatus(cliente._id, 'cliente') ? 'Activa' : 'Desactivada'}
                                     
                                    </td>
                                    <td><Switch
                                        checked={cliente.Activo}
                                        onChange={(checked) => handleEstadoChangeCliente(checked, cliente._id)}
                                    /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderApoderado = () => {

        let filteredApoderados = apoderados.filter((apoderado) =>
            (apoderado.Rut.includes(searchQuery.toUpperCase()) || apoderado.Nombre.includes(searchQuery.toUpperCase()) || apoderado.Apellidos.includes(searchQuery.toUpperCase()))
        );

        if (estadoFilter === 'Despejar') {
            // Do not apply any filtering based on the Estado property
        }
        else if (estadoFilter === 'Activo') {
            filteredApoderados = filteredApoderados.filter((apoderado) => apoderado.Activo === true);
        } else if (estadoFilter === 'Inactivo') {
            filteredApoderados = filteredApoderados.filter((apoderado) => apoderado.Activo === false);
        }
        else if (estadoFilter === 'Subscriptor') {
            filteredApoderados = filteredApoderados.filter((apoderado) => apoderado.EsSubscriptor === true);
        } else if (estadoFilter === 'NoSubscriptor') {
            filteredApoderados = filteredApoderados.filter((apoderado) => apoderado.EsSubscriptor === false);
        }

        return (
            <div>

                <div className="d-flex justify-content-between align-items-center">
                    <h1>Apoderados</h1>
                    <div className="input-buttons-container d-flex align-items-center">

                        <div className="d-flex align-items-center">

                            <div className="d-flex">
                                <div>
                                    <input
                                        className="btn-check btn-todos"
                                        type="radio"
                                        name="estadoFilter"
                                        id="estadoFilter1"
                                        value="Despejar"
                                        checked={estadoFilter === 'Despejar'}
                                        onChange={() => setEstadoFilter('Despejar')}
                                    />
                                    <label className="btn btn-todos btn-secondary" htmlFor="estadoFilter1">
                                        Todos
                                    </label>
                                </div>

                                <div>
                                    <input
                                        className="btn-check"
                                        type="radio"
                                        name="estadoFilter"
                                        id="estadoFilter2"
                                        value="Estado1"
                                        checked={estadoFilter === 'Activo'}
                                        onChange={() => setEstadoFilter('Activo')}
                                    />
                                    <label className="btn btn-activo btn-secondary" htmlFor="estadoFilter2">
                                        Activos
                                    </label>
                                </div>

                                <div>
                                    <input
                                        className="btn-check"
                                        type="radio"
                                        name="estadoFilter"
                                        id="estadoFilter3"
                                        value="Estado2"
                                        checked={estadoFilter === 'Inactivo'}
                                        onChange={() => setEstadoFilter('Inactivo')}
                                    />
                                    <label className="btn btn-inactivo btn-secondary" htmlFor="estadoFilter3">
                                        Inactivos
                                    </label>
                                </div>

                                <div>
                                    <input
                                        className="btn-check"
                                        type="radio"
                                        name="subscriptorFilter"
                                        id="subscriptorFilter2"
                                        value="Subscriptor"
                                        checked={estadoFilter === 'Subscriptor'}
                                        onChange={() => setEstadoFilter('Subscriptor')}
                                    />
                                    <label className="btn btn-suscriptor btn-secondary" htmlFor="subscriptorFilter2">
                                        Subscriptores
                                    </label>
                                </div>

                                <div>
                                    <input
                                        className="btn-check"
                                        type="radio"
                                        name="subscriptorFilter"
                                        id="subscriptorFilter3"
                                        value="NoSubscriptor"
                                        checked={estadoFilter === 'NoSubscriptor'}
                                        onChange={() => setEstadoFilter('NoSubscriptor')}
                                    />
                                    <label className="btn btn-nosuscriptor btn-secondary" htmlFor="subscriptorFilter3">
                                        No Subscriptores
                                    </label>
                                </div>
                            </div>

                            <div className="form-group has-search">
                                <span className="fa fa-search form-control-feedback"></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Buscar por RUT..."
                                />
                                {searchQuery && (
                                    <button
                                        className="btn btn-clear"
                                        onClick={() => setSearchQuery('')}
                                    >
                                        <span className="fa fa-times"></span>
                                    </button>
                                )}
                            </div>
                            <button className="btn btn-excel" onClick={handleDownloadExcelApoderados}>DESCARGAR EXCEL</button>
                        </div>
                    </div>
                </div>

                <div className="tabla-container">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Rut</th>
                                <th>Nombre</th>
                                <th>Apellidos</th>
                                <th>Género</th>
                                <th>Correo</th>
                                <th>Número</th>
                                <th>Fecha Nac.</th>
                                <th>Apadrinados</th>
                                <th>Subscripción</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApoderados.map((apoderado) => (
                                <tr key={apoderado._id} onDoubleClick={() => handleRowClickApoderado(apoderado._id)}>
                                    <td>{apoderado.Rut}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>

                                        {apoderado.Nombre}
                                    </td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>

                                        {apoderado.Apellidos}
                                    </td>
                                    <td>{apoderado.Genero}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>

                                        {apoderado.Correo}
                                    </td>
                                    <td>{apoderado.Numero_Telefonico}</td>
                                    <td>
                                        {new Date(apoderado.Fecha_Nacimiento).toLocaleDateString('es-ES')}
                                    </td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {apoderado.Clientes.map((clienteId, index) => {
                                            const cliente = clientes.find((c) => c._id === clienteId);
                                            return cliente ? (index ? `, ${cliente.Rut}` : cliente.Rut) : '';
                                        })}
                                    </td>


                                    <td className={getSubscriptorStatus(apoderado._id, 'apoderado') ?  'green-text' : 'red-text'}>
                                    {getSubscriptorStatus(apoderado._id, 'apoderado') ? 'Activa' : 'Desactivada'}
                                     
                                    </td>
                                    <td><Switch
                                        checked={apoderado.Activo}
                                        onChange={(checked) => handleEstadoChangeApoderado(checked, apoderado._id)}
                                    /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div>
            <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' />
            <ul className="nav nav-tabs custom-tabs">
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'tablaCliente' ? 'active' : ''}`} onClick={() => handleTabChange('tablaCliente')}>
                        Clientes
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link ${activeTab === 'tablaApoderado' ? 'active' : ''}`} onClick={() => handleTabChange('tablaApoderado')}>
                        Apoderados
                    </button>
                </li>
            </ul>
            <div className="tab-content">
                <div className={`tab-pane ${activeTab === 'tablaCliente' ? 'active' : ''}`}>
                    {renderCliente()}
                </div>
                <div className={`tab-pane ${activeTab === 'tablaApoderado' ? 'active' : ''}`}>
                    {renderApoderado()}
                </div>
            </div>
        </div>

    );

};

export default Clientes;
