import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';
import * as XLSX from 'xlsx';
import { URL_BACKEND } from "../App";

const Parametros = () => {
    const [regiones, setRegiones] = useState([]);
    const [tipoRecordatorios, setTipoRecordatorios] = useState([]);
    const [tipoAyudas, setTipoAyudas] = useState([]);
    const [tipoAyudaProveedors, setTipoAyudaProveedors] = useState([]);
    const [bancos, setBancos] = useState([]);
    const [tiempo, setTiempo] = useState({
        tiempoAnadido: 0,
        tiempoMinimo: 0,
        tiempoMaximo: 0,
        TiempoDeViaje: 0,
        TiempoSeguirBuscando: 0,
        TiempoDeViaje: 0
    });

    const navigate = useNavigate();

    const fetchRegiones = useCallback(async () => {
        try {
            const response = await fetch(`${URL_BACKEND}/api/regiones`);
            const data = await response.json();
            setRegiones(data);
        } catch (error) {
            console.error('Error fetching regiones:', error);
        }
    }, []);

    const fetchTipoRecordatorios = useCallback(async () => {
        try {
            const response = await fetch(`${URL_BACKEND}/api/tiporecordatorio`);
            const data = await response.json();
            setTipoRecordatorios(data);
        } catch (error) {
            console.error('Error fetching tipo recordatorios:', error);
        }
    }, []);

    const fetchTipoAyudas = useCallback(async () => {
        try {
            const response = await fetch(`${URL_BACKEND}/api/tipoayuda`);
            const data = await response.json();
            setTipoAyudas(data);
        } catch (error) {
            console.error('Error fetching tipo ayudas:', error);
        }
    }, []);

    const fetchTipoAyudaProveedors = useCallback(async () => {
        try {
            const response = await fetch(`${URL_BACKEND}/api/tipoayudaproveedor`);
            const data = await response.json();
            setTipoAyudaProveedors(data);
        } catch (error) {
            console.error('Error fetching tipo ayudas Proveedor:', error);
        }
    }, []);

    const fetchBancos = useCallback(async () => {
        try {
            const response = await fetch(`${URL_BACKEND}/api/bancos`);
            const data = await response.json();
            setBancos(data);
        } catch (error) {
            console.error('Error fetching bancos:', error);
        }
    }, []);

    const fetchTiemposSolicitud = useCallback(async () => {
        try {
            const response = await fetch(`${URL_BACKEND}/api/tiempo`);
            const data = await response.json();
            setTiempo(data[0]); // Assuming the response is an array with a single object
        } catch (error) {
            console.error('Error fetching tiempos:', error);
        }
    }, []);
    useEffect(() => {
        fetchRegiones();
        fetchTipoRecordatorios();
        fetchTipoAyudas();
        fetchTipoAyudaProveedors();
        fetchBancos();
        fetchTiemposSolicitud();
    }, [fetchRegiones, fetchTipoRecordatorios, fetchTipoAyudas, fetchBancos, fetchTiemposSolicitud]);

    const handleDownloadExcelRegion = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(regiones);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Regiones');
        const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'regiones.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadExcelTipoRecordatorio = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(tipoRecordatorios);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'TipoRecordatorios');
        const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'tipoRecordatorios.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadExcelTipoAyuda = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(tipoAyudas);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'TipoAyudas');
        const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'tiposAyudas.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadExcelTipoAyudaProveedor = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(tipoAyudas);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'TipoAyudaProveedors');
        const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'tiposAyudaProveedores.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadExcelBanco = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(bancos);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bancos');
        const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'bancos.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportExcelRegion = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const worksheet = workbook.Sheets['Regiones'];
            const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Get the headers row
            const headers = importedData[0];

            // Remove the headers row
            importedData.shift();

            // Create an array of objects representing the imported data
            const importedRegiones = importedData.map((row) => {
                const region = {};
                headers.forEach((header, index) => {
                    region[header] = row[index];
                });
                return region;
            });

            try {

                const response = await fetch(`${URL_BACKEND}/api/regiones/import`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(importedRegiones),
                });

                if (response.ok) {

                    setRegiones(importedRegiones);
                    alert('Import successful');

                    fetchRegiones();
                } else {
                    alert('Import failed');
                }
            } catch (error) {
                console.error('Error importing regiones:', error);
                alert('Import failed');
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = null;
    };

    const handleImportExcelTipoRecordatorio = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const worksheet = workbook.Sheets['TipoRecordatorios'];
            const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Get the headers row
            const headers = importedData[0];

            // Remove the headers row
            importedData.shift();

            // Create an array of objects representing the imported data
            const importedTipoRecordatorios = importedData.map((row) => {
                const tipoRecordatorio = {};
                headers.forEach((header, index) => {
                    tipoRecordatorio[header] = row[index];
                });
                return tipoRecordatorio;
            });

            try {
                const response = await fetch(`${URL_BACKEND}/api/tiporecordatorio/import`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(importedTipoRecordatorios),
                });

                if (response.ok) {
                    fetchTipoRecordatorios();
                    alert('Import successful');
                } else {
                    alert('Import failed');
                }
            } catch (error) {
                console.error('Error importing tipo recordatorios:', error);
                alert('Import failed');
            }
        };

        reader.readAsArrayBuffer(file);
        e.target.value = null;
    };

    const handleImportExcelTipoAyuda = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const worksheet = workbook.Sheets['TipoAyudas'];
            const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Get the headers row
            const headers = importedData[0];

            // Remove the headers row
            importedData.shift();

            // Create an array of objects representing the imported data
            const importedTipoAyudas = importedData.map((row) => {
                const tipoAyuda = {};
                headers.forEach((header, index) => {
                    tipoAyuda[header] = row[index];
                });
                return tipoAyuda;
            });

            try {
                const response = await fetch(`${URL_BACKEND}/api/tipoayuda/import`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(importedTipoAyudas),
                });

                if (response.ok) {
                    fetchTipoAyudas();
                    alert('Import successful');
                } else {
                    alert('Import failed');
                }
            } catch (error) {
                console.error('Error importing tipo ayudas:', error);
                alert('Import failed');
            }
        };

        reader.readAsArrayBuffer(file);
        e.target.value = null;
    };

    const handleImportExcelTipoAyudaProveedor = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const worksheet = workbook.Sheets['TipoAyudaProveedors'];
            const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Get the headers row
            const headers = importedData[0];

            // Remove the headers row
            importedData.shift();

            // Create an array of objects representing the imported data
            const importedTipoAyudaProveedors = importedData.map((row) => {
                const tipoAyudaProveedor = {};
                headers.forEach((header, index) => {
                    tipoAyudaProveedor[header] = row[index];
                });
                return tipoAyudaProveedor;
            });

            try {
                const response = await fetch(`${URL_BACKEND}/api/tipoayudaproveedor/import`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(importedTipoAyudaProveedors),
                });

                if (response.ok) {
                    fetchTipoAyudaProveedors();
                    alert('Import successful');
                } else {
                    alert('Import failed');
                }
            } catch (error) {
                console.error('Error importing tipo ayudas:', error);
                alert('Import failed');
            }
        };

        reader.readAsArrayBuffer(file);
        e.target.value = null;
    };

    const handleImportExcelBanco = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const worksheet = workbook.Sheets['Bancos'];
            const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Get the headers row
            const headers = importedData[0];

            // Remove the headers row
            importedData.shift();

            // Create an array of objects representing the imported data
            const importedBancos = importedData.map((row) => {
                const banco = {};
                headers.forEach((header, index) => {
                    banco[header] = row[index];
                });
                return banco;
            });

            try {
                const response = await fetch(`${URL_BACKEND}/api/bancos/import`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(importedBancos),
                });

                if (response.ok) {
                    fetchBancos();
                    alert('Import successful');
                } else {
                    alert('Import failed');
                }
            } catch (error) {
                console.error('Error importing bancos:', error);
                alert('Import failed');
            }
        };

        reader.readAsArrayBuffer(file);
        e.target.value = null;
    };

    const handleRowDoubleClick = (region) => {
        navigate(`/parametros/region/${region._id}`);
    };

    const handleUpdateTiemposSolicitud = async (e) => {
        e.preventDefault();

        if (tiempo.TiempoMinimo >= tiempo.TiempoMaximo) {
            alert('El tiempo mínimo debe ser menor que el tiempo máximo');
            fetchTiemposSolicitud();
            return;
        }

        try {
            const response = await fetch(`${URL_BACKEND}/api/tiempo/${tiempo._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tiempo),
            });

            if (response.ok) {
                alert('Tiempos de Solicitud actualizados correctamente');
            } else {
                //alert('Error al actualizar los Tiempos');
            }
        } catch (error) {
            console.error('Error updating tiempos de solicitud:', error);

            //alert('Error al actualizar los Tiempos de Solicitud');
        }
    };



    const handleChange = (e) => {
        const { id, value } = e.target;
        let parsedValue = parseInt(value, 10);

        if (id === 'TiempoAnadido') {
            parsedValue = Math.min(Math.max(parsedValue, 0), 10000);
        } else if (id === 'TiempoMinimo') {
            parsedValue = Math.min(Math.max(parsedValue, 0), 23);
        } else if (id === 'TiempoMaximo') {
            parsedValue = Math.min(Math.max(parsedValue, 1), 24);
        }else if (id === 'TiempoDeViaje') {
            parsedValue = Math.min(Math.max(parsedValue, 1), 10000);
        }else if (id === 'TiempoSeguirBuscando') {
            parsedValue = Math.min(Math.max(parsedValue, 1), 9000);
        }
        else if(id === 'TiempoDeViaje'){
            parsedValue = Math.min(Math.max(parsedValue, 0), 10000);
        }
        if (parsedValue === 0) {
            parsedValue = '0';
        }
        if (Number.isNaN(parsedValue) || (parsedValue >= 0 || parsedValue === 0)) {

            setTiempo((prevTiempo) => ({
                ...prevTiempo,
                [id]: parsedValue,
            }));
        }

    };






    return (
        <div className='row'>
            <div className='col'>
                <h3>Regiones Disponibles</h3>
                <div className="d-flex justify-content-between align-items-center">

                    <div className="input-buttons-container d-flex align-items-center">
                        <div>
                            <input type="file" className="form-control" accept=".xlsx" onChange={handleImportExcelRegion} />
                        </div>
                        <button className="btn btn-excel" onClick={handleDownloadExcelRegion}>
                            DESCARGAR
                        </button>
                    </div>
                </div>

                <div className="tabla-container">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {regiones.map((region) => (
                                <tr key={region._id} onDoubleClick={() => handleRowDoubleClick(region)}>
                                    <td>{region.Nombre}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='col'>
                <h3>Tipos de Recordatorios</h3>
                <div className="d-flex justify-content-between align-items-center">

                    <div className="input-buttons-container d-flex align-items-center">
                        <div>
                            <input type="file" className="form-control" accept=".xlsx" onChange={handleImportExcelTipoRecordatorio} />
                        </div>
                        <button className="btn btn-excel" onClick={handleDownloadExcelTipoRecordatorio}>
                            DESCARGAR
                        </button>
                    </div>
                </div>
                <div className="tabla-container">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tipoRecordatorios.map((tipoRecordatorio) => (
                                <tr key={tipoRecordatorio._id}>
                                    <td>{tipoRecordatorio.Nombre}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
            <div className='col'>
                <h3>Tipos de <br />Ayuda</h3>
                <div className="d-flex justify-content-between align-items-center">

                    <div className="input-buttons-container d-flex align-items-center">
                        <div>
                            <input type="file" className="form-control" accept=".xlsx" onChange={handleImportExcelTipoAyuda} />
                        </div>
                        <button className="btn btn-excel" onClick={handleDownloadExcelTipoAyuda}>
                            DESCARGAR
                        </button>
                    </div>
                </div>
                <div className="tabla-container">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tipoAyudas.map((tipoAyuda) => (
                                <tr key={tipoAyuda._id}>
                                    <td>{tipoAyuda.Nombre}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
            <div className='col'>
                <h3>Tipos de Ayuda Prov.</h3>
                <div className="d-flex justify-content-between align-items-center">

                    <div className="input-buttons-container d-flex align-items-center">
                        <div>
                            <input type="file" className="form-control" accept=".xlsx" onChange={handleImportExcelTipoAyudaProveedor} />
                        </div>
                        <button className="btn btn-excel" onClick={handleDownloadExcelTipoAyudaProveedor}>
                            DESCARGAR
                        </button>
                    </div>
                </div>
                <div className="tabla-container">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tipoAyudaProveedors.map((tipoAyuda) => (
                                <tr key={tipoAyuda._id}>
                                    <td>{tipoAyuda.Nombre}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
            <div className='col'>
                <h3>Bancos Disponibles</h3>
                <div className="d-flex justify-content-between align-items-center">

                    <div className="input-buttons-container d-flex align-items-center">
                        <div>
                            <input type="file" className="form-control" accept=".xlsx" onChange={handleImportExcelBanco} />
                        </div>
                        <button className="btn btn-excel" onClick={handleDownloadExcelBanco}>
                            DESCARGAR
                        </button>
                    </div>
                </div>
                <div className="tabla-container">
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bancos.map((banco) => (
                                <tr key={banco._id}>
                                    <td>{banco.Nombre}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
            <div className='col'>
                <h3>Tiempos de Solicitud</h3>
                <form onSubmit={handleUpdateTiemposSolicitud}>
                    <div className="form-group">
                        <label htmlFor="tiempoAnadido">Tiempo Anadido (minutos):</label>
                        <input
                            type="number"
                            id="TiempoAnadido"
                            className="form-control"
                            value={tiempo?.TiempoAnadido || ''}
                            onChange={handleChange}
                        />
                        <label htmlFor="tiempoMinimo">Tiempo Mínimo (hrs.):</label>
                        <input
                            type="number"
                            id="TiempoMinimo"
                            className="form-control"
                            value={tiempo?.TiempoMinimo || ''}
                            onChange={handleChange}
                        />
                        <label htmlFor="tiempoMaximo">Tiempo Máximo (hrs.):</label>
                        <input
                            type="number"
                            id="TiempoMaximo"
                            className="form-control"
                            value={tiempo?.TiempoMaximo || ''}
                            onChange={handleChange}
                        />
                        <label htmlFor="tiempoDeViaje">Tiempo de Viaje (minutos):</label>
                        <input
                            type="number"
                            id="TiempoDeViaje"
                            className="form-control"
                            value={tiempo?.TiempoDeViaje || ''}
                            onChange={handleChange}
                        />
                        <label htmlFor="tiempoSeguirBuscando">Tiempo de Buscando OPPA (minutos):</label>
                        <input
                            type="number"
                            id="TiempoSeguirBuscando"
                            className="form-control"
                            value={tiempo?.TiempoSeguirBuscando || ''}
                            onChange={handleChange}
                        />
                        <label>Tiempo de viaje (minutos): </label>
                        <input
                            type="number"
                            id="TiempoDeViaje"
                            className="form-control"
                            value={tiempo?.TiempoDeViaje || ''}
                            onChange={handleChange}
                        />

                    </div>
                    <div className="row justify-content-center">
                        <div className="col-6">
                            <button className='btn btn-primary' type="submit">GUARDAR</button>
                        </div>

                    </div>
                </form>
            </div>

            



        </div>
    );
};

export default Parametros;
