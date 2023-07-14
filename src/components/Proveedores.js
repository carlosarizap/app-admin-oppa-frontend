import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Switch, Checkbox } from 'antd';
import '../index.css';
import * as XLSX from 'xlsx';
import { URL_BACKEND } from "../App";

const Proveedores = () => {
    const navigate = useNavigate();
    const [proveedores, setProveedores] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [estadoFilter, setEstadoFilter] = useState('Despejar');
    const [profesionEstadoMap, setProfesionEstadoMap] = useState(new Map());


    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleRowClickProveedor = (proveedorId) => {
        navigate(`/proveedores/${proveedorId}`);
    };

    useEffect(() => {
        // Fetch proveedores data from the API
        const fetchProveedores = async () => {
            try {
                const response = await fetch(`${URL_BACKEND}/api/proveedores`);
                const data = await response.json();
                setProveedores(data);
            } catch (error) {
                console.error('Error fetching proveedores:', error);
            }
        };

        fetchProveedores();

        const fetchProfesionEstado = async () => {
            try {
              const response = await fetch(`${URL_BACKEND}/api/profesionEstados`);
              const data = await response.json();
          
              // Filter the ProfesionEstado data where Activa is true
              const filteredData = data.filter((profesionEstado) => profesionEstado.Activa);
          
              // Create a map to store the ProfesionEstado values for each proveedor
              const map = new Map();
          
              // Group the filtered ProfesionEstado data by IdProveedor
              filteredData.forEach((profesionEstado) => {
                const { IdProveedor, Nombre } = profesionEstado;
                if (!map.has(IdProveedor)) {
                  map.set(IdProveedor, [Nombre]); // Initialize with an array if the IdProveedor doesn't exist
                } else {
                  const nombres = map.get(IdProveedor);
                  nombres.push(Nombre); // Add the Nombre to the existing array
                  map.set(IdProveedor, nombres);
                }
              });
          
              // Update the ProfesionEstadoMap state
              setProfesionEstadoMap(map);
            } catch (error) {
              console.error('Error fetching ProfesionEstado:', error);
            }
          };

        fetchProfesionEstado();
    }, []);

    const handleEstadoChangeProveedor = async (checked, proveedorId) => {
        try {

            await fetch(`${URL_BACKEND}/api/proveedores/${proveedorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Estado: checked }),
            });


            setProveedores((prevProveedores) =>
                prevProveedores.map((proveedor) =>
                    proveedor._id === proveedorId ? { ...proveedor, Estado: checked } : proveedor
                )
            );
        } catch (error) {
            console.error('Error updating proveedor:', error);
        }
    };

    const handleRevisadoChangeProveedor = async (checked, proveedorId) => {
        try {

            await fetch(`${URL_BACKEND}/api/proveedores/${proveedorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Revisado: checked.target.checked }),
            });


            setProveedores((prevProveedores) =>
                prevProveedores.map((proveedor) =>
                    proveedor._id === proveedorId ? { ...proveedor, Revisado: checked.target.checked } : proveedor
                )
            );
        } catch (error) {
            console.error('Error updating proveedor:', error);
        }
    };

    const handleDownloadExcelProveedores = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(proveedores);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Proveedores');
        const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'proveedores.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    let filteredProveedores = proveedores.filter((proveedor) =>
        (proveedor.Rut.includes(searchQuery.toUpperCase()) || proveedor.Nombre.includes(searchQuery.toUpperCase()) || proveedor.Apellidos.includes(searchQuery.toUpperCase()))
    );

    if (estadoFilter === 'Despejar') {
        // Do not apply any filtering based on the Estado property
    }
    else if (estadoFilter === 'Activo') {
        filteredProveedores = filteredProveedores.filter((proveedor) => proveedor.Estado === true);
    } else if (estadoFilter === 'Inactivo') {
        filteredProveedores = filteredProveedores.filter((proveedor) => proveedor.Estado === false);
    }
    else if (estadoFilter === 'Revisado') {
        filteredProveedores = filteredProveedores.filter((proveedor) => proveedor.Revisado === true);
    } else if (estadoFilter === 'NoRevisado') {
        filteredProveedores = filteredProveedores.filter((proveedor) => proveedor.Revisado === false);
    }

    return (
        <div>
            <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' />
            <div>

                <div className="d-flex justify-content-between align-items-center">
                    <h1>Proveedores</h1>
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
                                    value="Revisado"
                                    checked={estadoFilter === 'Revisado'}
                                    onChange={() => setEstadoFilter('Revisado')}
                                />
                                <label className="btn btn-suscriptor btn-secondary" htmlFor="subscriptorFilter2">
                                    Revisados
                                </label>
                            </div>

                            <div>
                                <input
                                    className="btn-check"
                                    type="radio"
                                    name="subscriptorFilter"
                                    id="subscriptorFilter3"
                                    value="NoSubscriptor"
                                    checked={estadoFilter === 'NoRevisado'}
                                    onChange={() => setEstadoFilter('NoRevisado')}
                                />
                                <label className="btn btn-nosuscriptor btn-secondary" htmlFor="subscriptorFilter3">
                                    No Revisados
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
                            <button className="btn btn-excel" onClick={handleDownloadExcelProveedores}>DESCARGAR EXCEL</button>
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
                                <th>Profesiones</th>
                                <th>Estado</th>
                                <th>Revisión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProveedores.map((proveedor) => (
                                <tr key={proveedor._id} onDoubleClick={() => handleRowClickProveedor(proveedor._id)}>
                                    <td>{proveedor.Rut}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {proveedor.Nombre}
                                    </td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {proveedor.Apellidos}
                                    </td>
                                    <td>{proveedor.Genero}</td>
                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {proveedor.Correo}
                                    </td>
                                    <td>{proveedor.Telefono}</td>
                                    <td>
                                        {new Date(proveedor.Fecha_Nacimiento).toLocaleDateString('es-ES')}
                                    </td>

                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {profesionEstadoMap.get(proveedor._id)?.join(', ') || ''}
                                    </td>

                                    <td><Switch
                                        checked={proveedor.Estado}
                                        onChange={(checked) => handleEstadoChangeProveedor(checked, proveedor._id)}
                                    /></td>
                                    <td>
                                        <Checkbox
                                            checked={proveedor.Revisado}
                                            onChange={(checked) => handleRevisadoChangeProveedor(checked, proveedor._id)}
                                        />

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    );

};

export default Proveedores;
