import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import '../index.css';
import * as XLSX from 'xlsx';
import { URL_BACKEND } from "../App";

const Servicios = () => {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [superCategorias, setSuperCategorias] = useState([]);

  const handleRowClick = (servicioId) => {
    navigate(`/servicios/${servicioId}`);
  };

  useEffect(() => {
    fetchServicios();
    fetchCategorias();
    fetchSuperCategorias();
  }, []);

  const fetchServicios = async () => {
    try {
      const response = await fetch(`${URL_BACKEND}/api/servicios/`);
      const data = await response.json();
      setServicios(data);
    } catch (error) {
      console.error('Error fetching servicios:', error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch(`${URL_BACKEND}/api/categorias/`);
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  const fetchSuperCategorias = async () => {
    try {
      const response = await fetch(`${URL_BACKEND}/api/superCategorias/`);
      const data = await response.json();
      setSuperCategorias(data);
    } catch (error) {
      console.error('Error fetching super categorias:', error);
    }
  };

  const formatDescuento = (descuento) => {
    return `${descuento * 100}%`;
  };

  const handleEstadoChange = async (checked, servicioId) => {
    try {
      // Make the API call to update the servicio's Estado
      await fetch(`${URL_BACKEND}/api/servicios/${servicioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Estado: checked }),
      });

      // Update the local state with the updated servicio
      setServicios((prevServicios) =>
        prevServicios.map((servicio) =>
          servicio._id === servicioId ? { ...servicio, Estado: checked } : servicio
        )
      );
    } catch (error) {
      console.error('Error updating servicio:', error);
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const worksheet = workbook.Sheets['Servicios'];
      const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Get the headers row
      const headers = importedData[0];

      // Remove the headers row
      importedData.shift();

      // Create an array of objects representing the imported data
      const importedServicios = importedData.map((row) => {
        const servicio = {};
        headers.forEach((header, index) => {
          servicio[header] = row[index];
        });
        return servicio;
      });

      try {
        // Send the imported servicios to the server to update the database
        const response = await fetch(`${URL_BACKEND}/api/servicios/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(importedServicios),
        });

        if (response.ok) {
          // Update the local state with the imported servicios
          setServicios(importedServicios);
          alert('Import successful');

          fetchServicios();
        } else {
          alert('Import failed');
        }
      } catch (error) {
        console.error('Error importing servicios:', error);
        alert('Import failed');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  const handleDownloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(servicios);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Servicios');
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
    link.setAttribute('download', 'servicios.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Servicios</h1>
        <div className="input-buttons-container d-flex align-items-center">
          <div>
            <input type="file" className="form-control" accept=".xlsx" onChange={handleImportExcel} />
          </div>
          <div className="d-flex align-items-center">
            <button className="btn btn-excel" onClick={handleDownloadExcel}>
              DESCARGAR EXCEL
            </button>
            <Link to="/servicios/crear" className="btn btn-primary">
              CREAR SERVICIO
            </Link>
          </div>
        </div>
      </div>

      <div className="tabla-container">
        <table className="tabla">
          <thead>
            <tr>
              <th>Título</th>
              <th>Descripción</th>
              <th>Sup. Categoría</th>
              <th>Categoria</th>
              <th>Precio</th>
              <th>Comisión</th>
              <th>Descuento</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((servicio) => {
              const categoria = categorias.find((cat) => cat._id === servicio.idCategoria);
              const superCategoria = superCategorias.find((superCat) => superCat._id === categoria?.idSuperCategoria);

              return (
                <tr key={servicio._id} onDoubleClick={() => handleRowClick(servicio._id)}>
                  <td>{servicio.Nombre}</td>
                  <td>{servicio.Descripcion}</td>
                  <td>{superCategoria ? superCategoria.Nombre : ''}</td>
                  <td>{categoria ? categoria.Nombre : ''}</td>
                  <td>{servicio.Precio}</td>
                  <td>{formatDescuento(servicio.Comision)}</td>
                  <td>{formatDescuento(servicio.Descuento)}</td>
                  <td>
                    <Switch
                      checked={servicio.Estado}
                      onChange={(checked) => handleEstadoChange(checked, servicio._id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Servicios;
