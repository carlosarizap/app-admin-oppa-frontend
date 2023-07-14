import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../index.css';
import * as XLSX from 'xlsx';
import { URL_BACKEND } from "../App";

const Categorias = () => {
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState([]);
    const [superCategorias, setSuperCategorias] = useState({});

    const handleRowClick = (categoriaId) => {
        navigate(`/categorias/${categoriaId}`);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [categoriasResponse, superCategoriasResponse] = await Promise.all([
                fetch(`${URL_BACKEND}/api/categorias/`).then((response) => response.json()),
                fetch(`${URL_BACKEND}/api/superCategorias/`).then((response) => response.json())
            ]);

            const superCategoriasData = superCategoriasResponse.reduce((acc, superCategoria) => {
                acc[superCategoria._id] = superCategoria.Nombre;
                return acc;
            }, {});

            setCategorias(categoriasResponse);
            setSuperCategorias(superCategoriasData);
        } catch (error) {
            console.error('Error fetching categorias:', error);
        }
    };

    const handleDownloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(categorias);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Categorias');
        const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'categorias.xlsx');
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

            const worksheet = workbook.Sheets['Categorias'];
            const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Get the headers row
            const headers = importedData[0];

            // Remove the headers row
            importedData.shift();

            // Create an array of objects representing the imported data
            const importedCategorias = importedData.map((row) => {
                const categoria = {};
                headers.forEach((header, index) => {
                    categoria[header] = row[index];
                });
                return categoria;
            });

            try {
     
                const response = await fetch(`${URL_BACKEND}/api/categorias/import`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(importedCategorias),
                });

                if (response.ok) {
                   
                    setCategorias(importedCategorias);
                    alert('Import successful');

                    fetchData();
                } else {
                    alert('Import failed');
                }
            } catch (error) {
                console.error('Error importing categorias:', error);
                alert('Import failed');
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = null;
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center">
                <h1>Categorías</h1>
                <div className="input-buttons-container d-flex align-items-center">
                    <div className="d-flex align-items-center">
                        <div>
                            <input type="file" className="form-control" accept=".xlsx" onChange={handleImportExcel} />
                        </div>
                        <button className="btn btn-excel" onClick={handleDownloadExcel}>
                            DESCARGAR EXCEL
                        </button>
                        <Link to="/categorias/crear" className="btn btn-primary">
                            CREAR CATEGORÍA
                        </Link>
                    </div>
                </div>
            </div>
            <div className="tabla-container">
                <table className="tabla">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Sup. Categoría</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categorias.map((categoria) => (
                            <tr key={categoria._id} onDoubleClick={() => handleRowClick(categoria._id)}>
                                <td>{categoria.Nombre}</td>
                                <td>{superCategorias[categoria.idSuperCategoria]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Categorias;
