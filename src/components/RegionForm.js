import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { URL_BACKEND } from "../App";

const RegionForm = () => {
    const { id } = useParams();
    const [region, setRegion] = useState({});
    const [comunas, setComunas] = useState([]);


        // Fetch region data based on the provided ID
        const fetchRegion = async () => {
            try {
                const regionResponse = await fetch(`${URL_BACKEND}/api/regiones/${id}`);
                const regionData = await regionResponse.json();
                setRegion(regionData);

                // Fetch all comunas with IdRegion same as the _id of the region
                const comunasResponse = await fetch(`${URL_BACKEND}/api/comunas/byregion/${regionData._id}`);
                const comunasData = await comunasResponse.json();
                setComunas(comunasData);
            } catch (error) {
                console.error('Error fetching region and comunas:', error);
            }
        };



    useEffect(() => {
        fetchRegion();
    }, [fetchRegion]);

    const handleDownloadExcel = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(comunas);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Comunas');
        const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = `comunas${region.Nombre}.xlsx`; // Set the file name dynamically
        const url = URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
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

            const worksheet = workbook.Sheets['Comunas'];
            const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Get the headers row
            const headers = importedData[0];

            // Remove the headers row
            importedData.shift();

            // Create an array of objects representing the imported data
            const importedComunas = importedData.map((row) => {
                const comuna = {};
                headers.forEach((header, index) => {
                    comuna[header] = row[index];
                });
                return comuna;
            });

            try {
                const response = await fetch(`${URL_BACKEND}/api/comunas/import/${region._id}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(importedComunas),
                });

                if (response.ok) {

                    setComunas(importedComunas);
                    alert('Import successful');

                    fetchRegion();
                } else {
                    alert('Import failed');
                }
            } catch (error) {
                console.error('Error importing comunas:', error);
                alert('Import failed');
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = null;
    };


    return (
        <div className='text-center'>
          <h3>{region.Nombre}</h3>
          <div className="input-buttons-container">
            <div className="d-flex align-items-center justify-content-center">
              <div className="input-container">
                <input type="file" className="form-control" accept=".xlsx" onChange={handleImportExcel} />
              </div>
              <div className="button-container">
                <button className="btn btn-excel" onClick={handleDownloadExcel}>
                  DESCARGAR EXCEL
                </button>
              </div>
            </div>
          </div>
          <div className='mx-auto col-6'>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Comunas</th>
                </tr>
              </thead>
              <tbody>
                {comunas.map((comuna) => (
                  <tr key={comuna._id}>
                    <td>{comuna.Nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    };
    
    export default RegionForm;