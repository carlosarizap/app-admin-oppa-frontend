import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';
import * as XLSX from 'xlsx';
import { URL_BACKEND } from "../App";

const Profesiones = () => {
    const navigate = useNavigate();
    const [profesiones, setProfesiones] = useState([]);
    const [categorias, setCategorias] = useState({});

    const handleRowClick = (profesionId) => {
        navigate(`/profesiones/${profesionId}`);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profesionesResponse, categoriasResponse] = await Promise.all([
                fetch(`${URL_BACKEND}/api/profesiones/`).then((response) => response.json()),
                fetch(`${URL_BACKEND}/api/categorias/`).then((response) => response.json())
            ]);

            const categoriasData = categoriasResponse.reduce((acc, categoria) => {
                acc[categoria._id] = categoria.Nombre;
                return acc;
            }, {});

            setProfesiones(profesionesResponse);
            setCategorias(categoriasData);
        } catch (error) {
            console.error('Error fetching profesiones:', error);
        }
    };

    const handleDownloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(profesiones);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Profesiones');
        const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'profesiones.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportExcel = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const worksheet = workbook.Sheets['Profesiones'];
            const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Get the headers row
            const headers = importedData[0];

            // Remove the headers row
            importedData.shift();

            // Create an array of objects representing the imported data
            const importedProfesiones = importedData.map((row) => {
                const profesion = {};
                headers.forEach((header, index) => {
                    profesion[header] = row[index];
                });
                return profesion;
            });

            try {
     
                const response = await fetch(`${URL_BACKEND}/api/profesiones/import`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(importedProfesiones),
                });

                if (response.ok) {
                   
                    setProfesiones(importedProfesiones);
                    alert('Import successful');

                    fetchData();
                } else {
                    alert('Import failed');
                }
            } catch (error) {
                console.error('Error importing profesiones:', error);
                alert('Import failed');
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = null;
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center">
                <h1>Profesiones</h1>
                <div className="input-buttons-container d-flex align-items-center">
                    <div className="d-flex align-items-center">
                        <div>
                            <input type="file" className="form-control" accept=".xlsx" onChange={handleImportExcel} />
                        </div>
                        <button className="btn btn-excel" onClick={handleDownloadExcel}>
                            DESCARGAR EXCEL
                        </button>
                        <Link to="/profesiones/crear" className="btn btn-primary">
                            CREAR PROFESIÓN
                        </Link>
                    </div>
                </div>
            </div>
            <div className="tabla-container">
                <table className="tabla">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Categoría</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profesiones.map((profesion) => (
                            <tr key={profesion._id} onDoubleClick={() => handleRowClick(profesion._id)}>
                                <td>{profesion.Nombre}</td>
                                <td>{categorias[profesion.idCategoria]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Profesiones;
