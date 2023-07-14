import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import '../index.css';
import * as XLSX from 'xlsx';
import { URL_BACKEND } from "../App";

const Packs = () => {
  const navigate = useNavigate();
  const [packs, setPacks] = useState([]);
  const [servicios, setServicios] = useState([]);

  const handleRowClick = (packId) => {
    navigate(`/packs/${packId}`);
  };

  useEffect(() => {
    fetchPacks();
    fetchServicios();
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await fetch(`${URL_BACKEND}/api/packs/`);
      const data = await response.json();
      setPacks(data);
    } catch (error) {
      console.error('Error fetching packs:', error);
    }
  };

  const fetchServicios = async () => {
    try {
      const response = await fetch(`${URL_BACKEND}/api/servicios/`);
      const data = await response.json();
      setServicios(data);
    } catch (error) {
      console.error('Error fetching servicios:', error);
    }
  };

  const handleEstadoChange = async (checked, packId) => {
    try {
      // Make the API call to update the pack's Estado
      await fetch(`${URL_BACKEND}/api/packs/${packId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Estado: checked }),
      });

      // Update the local state with the updated pack
      setPacks((prevPacks) =>
        prevPacks.map((pack) =>
          pack._id === packId ? { ...pack, Estado: checked } : pack
        )
      );
    } catch (error) {
      console.error('Error updating pack:', error);
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const worksheet = workbook.Sheets['Packs'];
      const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Get the headers row
      const headers = importedData[0];

      // Remove the headers row
      importedData.shift();

      // Create an array of objects representing the imported data
      const importedPacks = importedData.map((row) => {
        const pack = {};
        headers.forEach((header, index) => {
          pack[header] = row[index];
        });
        return pack;
      });

      try {
        // Send the imported packs to the server to update the database
        const response = await fetch(`${URL_BACKEND}/api/packs/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(importedPacks),
        });

        if (response.ok) {
          // Update the local state with the imported packs
          setPacks(importedPacks);
          alert('Import successful');

          fetchPacks();
        } else {
          alert('Import failed');
        }
      } catch (error) {
        console.error('Error importing packs:', error);
        alert('Import failed');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  const handleDownloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(packs);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Packs');
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
    link.setAttribute('download', 'packs.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Packs</h1>
        <div className="input-buttons-container d-flex align-items-center">
          <div>
            <input type="file" className="form-control" accept=".xlsx" onChange={handleImportExcel} />
          </div>
          <div className="d-flex align-items-center">
            <button className="btn btn-excel" onClick={handleDownloadExcel}>
              DESCARGAR EXCEL
            </button>
            <Link to="/packs/crear" className="btn btn-primary">
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
              <th>Precio</th>
              <th>Servicios</th>
              <th>Tope</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {packs.map((pack) => {

              return (
                <tr key={pack._id} onDoubleClick={() => handleRowClick(pack._id)}>
                  <td>{pack.Nombre}</td>
                  <td>{pack.Descripcion}</td>
                  <td>{pack.Precio}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pack.IdServicios.map((servicioId, index) => {
                      const servicio = servicios.find((s) => s._id === servicioId);
                      return servicio ? (index ? `, ${servicio.Nombre}` : servicio.Nombre) : '';
                    })}
                  </td>
                  <td>{pack.Usos}/{pack.Tope}</td>
                  <td>
                    {new Date(pack.FechaDesde).toLocaleDateString('es-ES')}
                  </td>
                  <td>
                    {new Date(pack.FechaHasta).toLocaleDateString('es-ES')}
                  </td>
                  <td>
                    <Switch
                      checked={pack.Estado}
                      onChange={(checked) => handleEstadoChange(checked, pack._id)}
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

export default Packs;
