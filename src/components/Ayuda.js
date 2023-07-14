import React, { useEffect, useState } from 'react';
import { useNavigation } from 'react-router-dom';
import { Checkbox } from 'antd';
import * as XLSX from 'xlsx';
import '../index.css';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { URL_BACKEND } from "../App";


const Ayuda = () => {
  const [activeTab, setActiveTab] = useState('tablaCliente');
  const [ayudas, setAyudas] = useState([]);
  const [ayudaProveedors, setAyudaProveedors] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [apoderados, setApoderados] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [ayudaFechaOrder, setAyudaFechaOrder] = useState('asc');
  const [ayudaProveedorFechaOrder, setAyudaProveedorFechaOrder] = useState('asc');
  const [estadoFilter, setEstadoFilter] = useState('Despejar');

  useEffect(() => {
    fetchAyudas();
    fetchAyudaProveedors();
    fetchClientes();
    fetchApoderados();
    fetchProveedors();
  }, []);

  const fetchAyudas = async () => {
    try {
      const response = await fetch(`${URL_BACKEND}/api/ayuda`);
      if (response.ok) {
        const data = await response.json();
        setAyudas(data);
      } else {
        console.error('Failed to fetch Ayudas');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAyudaProveedors = async () => {
    try {
      const response = await fetch(`${URL_BACKEND}/api/ayudaproveedor`);
      if (response.ok) {
        const data = await response.json();
        setAyudaProveedors(data);
      } else {
        console.error('Failed to fetch Ayudas');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${URL_BACKEND}/api/clientes`);
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      } else {
        console.error('Failed to fetch Clientes');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchApoderados = async () => {
    try {
      const response = await fetch(`${URL_BACKEND}/api/apoderados`);
      if (response.ok) {
        const data = await response.json();
        setApoderados(data);
      } else {
        console.error('Failed to fetch Apoderados');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchProveedors = async () => {
    try {
      const response = await fetch(`${URL_BACKEND}/api/proveedores`);
      if (response.ok) {
        const data = await response.json();
        setProveedores(data);
      } else {
        console.error('Failed to fetch Clientes');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getClientRut = (clientId) => {
    const cliente = clientes.find((cliente) => cliente._id === clientId);
    if (cliente) {
      return cliente.Rut;
    } else {
      const apoderado = apoderados.find(
        (apoderado) => apoderado._id === clientId
      );
      return apoderado ? apoderado.Rut : '';
    }
  };

  const getProveedorRut = (proveedorId) => {
    const proveedor = proveedores.find((proveedor) => proveedor._id === proveedorId);
    if (proveedor) {
      return proveedor.Rut;
    }
  };

  const handleDownloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
      ayudas.map((ayuda) => ({
        ...ayuda,
        ClienteRut: getClientRut(ayuda.IdCliente),
      }))
    );
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ayudas');
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
    link.setAttribute('download', 'ayuda.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadExcelProveedor = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
      ayudaProveedors.map((ayuda) => ({
        ...ayuda,
        ProveedorRut: getProveedorRut(ayuda.IdProveedor),
      }))
    );
    XLSX.utils.book_append_sheet(workbook, worksheet, 'AyudaProveedor');
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
    link.setAttribute('download', 'ayudaProveedores.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleRevisadoChangeAyudaProveedor = async (checked, ayudaId) => {
    try {

      await fetch(`${URL_BACKEND}/api/ayudaproveedor/${ayudaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Revisado: checked.target.checked }),
      });


      setAyudaProveedors((prevAyudaProveedors) =>
        prevAyudaProveedors.map((ayuda) =>
          ayuda._id === ayudaId ? { ...ayuda, Revisado: checked.target.checked } : ayuda
        )
      );
    } catch (error) {
      console.error('Error updating ayuda proveedor:', error);
    }
  };
  const handleRevisadoChangeAyuda = async (checked, ayudaId) => {
    try {

      await fetch(`${URL_BACKEND}/api/ayuda/${ayudaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Revisado: checked.target.checked }),
      });


      setAyudas((prevAyudas) =>
        prevAyudas.map((ayuda) =>
          ayuda._id === ayudaId ? { ...ayuda, Revisado: checked.target.checked } : ayuda
        )
      );
    } catch (error) {
      console.error('Error updating ayuda:', error);
    }
  };

  const sortAyudasByFecha = () => {
    const sortedAyudas = [...ayudas];
    sortedAyudas.sort((a, b) => {
      if (ayudaFechaOrder === 'asc') {
        return new Date(b.Fecha) - new Date(a.Fecha);
      } else {
        return new Date(a.Fecha) - new Date(b.Fecha);
      }
    });
    setAyudas(sortedAyudas);
    setAyudaFechaOrder(ayudaFechaOrder === 'asc' ? 'desc' : 'asc');
  };

  const sortAyudaProveedorsByFecha = () => {
    const sortedAyudaProveedors = [...ayudaProveedors];
    sortedAyudaProveedors.sort((a, b) => {
      if (ayudaProveedorFechaOrder === 'asc') {
        return new Date(b.Fecha) - new Date(a.Fecha);
      } else {
        return new Date(a.Fecha) - new Date(b.Fecha);
      }
    });
    setAyudaProveedors(sortedAyudaProveedors);
    setAyudaProveedorFechaOrder(ayudaProveedorFechaOrder === 'asc' ? 'desc' : 'asc');
  };

  const getFechaSortIcon = (order) => {
    const iconStyle = {
      verticalAlign: 'middle',
      position: 'relative',
      top: '-2px', // Adjust this value as needed
    };

    if (order === 'asc') {
      return <span className="sort-icon"><CaretUpOutlined style={iconStyle} /></span>;
    } else {
      return <span className="sort-icon"><CaretDownOutlined style={iconStyle} /></span>;
    }
  };


  const handleRevisadoFilterChange = (filter) => {
    setEstadoFilter(filter);
  };

  let filteredAyudas = ayudas;
  let filteredAyudaProveedors = ayudaProveedors;

  if (estadoFilter === 'Despejar') {
    // Do not apply any filtering based on the Estado property
    //console.log("here")
  } else if (estadoFilter === 'Revisado') {
    filteredAyudas = filteredAyudas.filter((ayuda) => ayuda.Revisado);
    filteredAyudaProveedors = filteredAyudaProveedors.filter((ayuda) => ayuda.Revisado);
  } else if (estadoFilter === 'NoRevisado') {
    filteredAyudas = filteredAyudas.filter((ayuda) => !ayuda.Revisado);
    filteredAyudaProveedors = filteredAyudaProveedors.filter((ayuda) => !ayuda.Revisado);
  }

  const renderAyudaCliente = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Solicitudes de Contacto Clientes</h1>
        <div className="input-buttons-container d-flex align-items-center">
          <div className="d-flex align-items-center">
          <div>
              <input
                className="btn-check"
                type="radio"
                value="Despejar"
                name='subscriptorFilter32'
                id="estadoFilter31"
                checked={estadoFilter === 'Despejar'}
                onChange={() => handleRevisadoFilterChange('Despejar')}
              />
              <label className="btn btn-todos btn-secondary" htmlFor="estadoFilter31">
                Todos
              </label>
            </div>
            <div>
              <input
                className="btn-check"
                type="radio"
                value="Revisado"
                name='subscriptorFilter12'
                id="estadoFilter22"
                checked={estadoFilter === 'Revisado'}
                onChange={() => handleRevisadoFilterChange('Revisado')}
              />
              <label className="btn btn-suscriptor btn-secondary" htmlFor="estadoFilter22">
                Revisados
              </label>
            </div>
            <div>
              <input
                className="btn-check"
                type="radio"
                value="NoRevisado"
                name="subscriptorFilter11"
                id="estadoFilter33"
                checked={estadoFilter === 'NoRevisado'}
                onChange={() => handleRevisadoFilterChange('NoRevisado')}
              />
              <label className="btn btn-nosuscriptor btn-secondary" htmlFor="estadoFilter33">
                No Revisados
              </label>
            </div>
            <button className="btn btn-excel" onClick={handleDownloadExcel}>
              DESCARGAR EXCEL
            </button>
          </div>
        </div>
      </div>
      <div className="tabla-container">
        <table className="tabla">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Detalle</th>
              <th>RUT</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Número</th>
              <th onClick={sortAyudasByFecha}>
                Fecha {getFechaSortIcon(ayudaFechaOrder)}
              </th>
              <th>Revisión</th>
            </tr>
          </thead>
          <tbody>
            {filteredAyudas.map((ayuda) => (
              <tr key={ayuda._id}>
                <td>{ayuda.Tipo}</td>
                <td>{ayuda.Detalle}</td>
                <td>{getClientRut(ayuda.IdCliente)}</td>
                <td>{ayuda.Nombre}</td>
                <td>{ayuda.Correo}</td>
                <td>{ayuda.Numero}</td>
                <td>{new Date(ayuda.Fecha).toLocaleString('es-ES')}</td>
                <td>
                  <Checkbox
                    checked={ayuda.Revisado}
                    onChange={(checked) => handleRevisadoChangeAyuda(checked, ayuda._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAyudaProveedor = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h1>Solicitudes de Contacto Proveedores</h1>
        <div className="input-buttons-container d-flex align-items-center">
          <div className="d-flex align-items-center">
          <div>
              <input
                className="btn-check"
                type="radio"
                value="Despejar"
                name='subscriptorFilter32'
                id="estadoFilter31"
                checked={estadoFilter === 'Despejar'}
                onChange={() => handleRevisadoFilterChange('Despejar')}
              />
              <label className="btn btn-todos btn-secondary" htmlFor="estadoFilter31">
                Todos
              </label>
            </div>
            <div>
              <input
                className="btn-check"
                type="radio"
                value="Revisado"
                name='subscriptorFilter12'
                id="estadoFilter22"
                checked={estadoFilter === 'Revisado'}
                onChange={() => handleRevisadoFilterChange('Revisado')}
              />
              <label className="btn btn-suscriptor btn-secondary" htmlFor="estadoFilter22">
                Revisados
              </label>
            </div>
            <div>
              <input
                className="btn-check"
                type="radio"
                value="NoRevisado"
                name="subscriptorFilter11"
                id="estadoFilter33"
                checked={estadoFilter === 'NoRevisado'}
                onChange={() => handleRevisadoFilterChange('NoRevisado')}
              />
              <label className="btn btn-nosuscriptor btn-secondary" htmlFor="estadoFilter33">
                No Revisados
              </label>
            </div>
            <button className="btn btn-excel" onClick={handleDownloadExcelProveedor}>
              DESCARGAR EXCEL
            </button>
          </div>
        </div>
      </div>
      <div className="tabla-container">
        <table className="tabla">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Detalle</th>
              <th>RUT</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Número</th>
              <th onClick={sortAyudaProveedorsByFecha}>
                Fecha {getFechaSortIcon(ayudaProveedorFechaOrder)}
              </th>
              <th>Revisión</th>
            </tr>
          </thead>
          <tbody>
            {filteredAyudaProveedors.map((ayuda) => (
              <tr key={ayuda._id}>
                <td>{ayuda.Tipo}</td>
                <td>{ayuda.Detalle}</td>
                <td>{getProveedorRut(ayuda.IdProveedor)}</td>
                <td>{ayuda.Nombre}</td>
                <td>{ayuda.Correo}</td>
                <td>{ayuda.Numero}</td>
                <td>{new Date(ayuda.Fecha).toLocaleString('es-ES')}</td>
                <td>
                  <Checkbox
                    checked={ayuda.Revisado}
                    onChange={(checked) => handleRevisadoChangeAyudaProveedor(checked, ayuda._id)}
                  />

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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
          <button className={`nav-link ${activeTab === 'tablaProveedor' ? 'active' : ''}`} onClick={() => handleTabChange('tablaProveedor')}>
            Proveedores
          </button>
        </li>
      </ul>
      <div className="tab-content">
        <div className={`tab-pane ${activeTab === 'tablaCliente' ? 'active' : ''}`}>
          {renderAyudaCliente()}
        </div>
        <div className={`tab-pane ${activeTab === 'tablaProveedor' ? 'active' : ''}`}>
          {renderAyudaProveedor()}
        </div>
      </div>
    </div>

  );
};

export default Ayuda;
