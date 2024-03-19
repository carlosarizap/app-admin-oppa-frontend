import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import '../index.css';
import * as XLSX from 'xlsx';
import { URL_BACKEND } from "../App";

const Administradores = () => {
  const navigate = useNavigate();
  const [administradores, setAdministradores] = useState([]);
  const [servicios, setServicios] = useState([]);

  const handleRowClick = (administradorId) => {
    navigate(`/administradores/${administradorId}`);
  };

  useEffect(() => {
    fetchAdministradores();
    fetchServicios();
  }, []);

  const fetchAdministradores = async () => {
    try {
      const response = await fetch(`${URL_BACKEND}/api/administrador/`);
      const data = await response.json();
      setAdministradores(data);

        console.log(data)

    } catch (error) {
      console.error('Error fetching administradores:', error);
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

  const handleEstadoChange = async (checked, administradorId) => {
    try {
      // Make the API call to update the administrador's Estado
      await fetch(`${URL_BACKEND}/api/administradores/${administradorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Estado: checked }),
      });

      // Update the local state with the updated administrador
      setAdministradores((prevAdministradores) =>
        prevAdministradores.map((administrador) =>
          administrador._id === administradorId ? { ...administrador, Estado: checked } : administrador
        )
      );
    } catch (error) {
      console.error('Error updating administrador:', error);
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const worksheet = workbook.Sheets['Administradores'];
      const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Get the headers row
      const headers = importedData[0];

      // Remove the headers row
      importedData.shift();

      // Create an array of objects representing the imported data
      const importedAdministradores = importedData.map((row) => {
        const administrador = {};
        headers.forEach((header, index) => {
          administrador[header] = row[index];
        });
        return administrador;
      });

      try {
        // Send the imported administradores to the server to update the database
        const response = await fetch(`${URL_BACKEND}/api/administradores/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(importedAdministradores),
        });

        if (response.ok) {
          // Update the local state with the imported administradores
          setAdministradores(importedAdministradores);
          alert('Import successful');

          fetchAdministradores();
        } else {
          alert('Import failed');
        }
      } catch (error) {
        console.error('Error importing administradores:', error);
        alert('Import failed');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null;
  };

  const handleDownloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(administradores);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Administradores');
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
    link.setAttribute('download', 'administradores.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Administradores</h1>
        <div className="input-buttons-container d-flex align-items-center">
          <div className="d-flex align-items-center">
            <Link to="/administradores/crear" className="btn btn-primary">
              CREAR ADMIN
            </Link>
          </div>
        </div>
      </div>

      <div className="tabla-container">
        <table className="tabla">
          <thead>
            <tr>
              <th>Administrador</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {administradores.map((administrador) => {

              return (
                <tr key={administrador._id} onDoubleClick={() => handleRowClick(administrador._id)}>
                  <td>{administrador.Email}</td>
                  <td>
                                    {administrador.PuedeCrear ? (
                                        <span>Principal</span>
                                    ) : (
                                        <span style={{ color: 'red' }}></span>
                                    )}

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

export default Administradores;
