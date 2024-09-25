import React, { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import es from 'date-fns/locale/es';
import { format } from 'date-fns';
import esLocale from 'date-fns/locale/es';
import '../index.css';
import { URL_BACKEND } from "../App";


const Pagos = () => {
  const navigate = useNavigate();
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let [solicitudesFinalizdas, setSolicitudesFinalizadas] = useState([]);
  const [proveedorMap, setProveedorMap] = useState(new Map());
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstado, setSelectedEstado] = useState("NoPagado");

    useEffect(() => {
      fetchData();
    }, [startDate, endDate, selectedEstado]); // Se ejecutará fetchData cada vez que startDate o endDate cambie
  
    const fetchData = async () => {
      try {
        // Hacer un método get para obtener las solicitudes
        let solicitudFinalizadoFiltrado = [];
  
        const solicitudesFinalizadasResponse = await fetch(`${URL_BACKEND}/api/solicitud/SolicitudesFinalizados`).then((response) => response.json());
        
        //const serviciosResponse  = await fetch(`${URL_BACKEND}/api/servicios/`).then((response) => response.json());

        solicitudFinalizadoFiltrado = solicitudesFinalizadasResponse.map(solicitud => aplicarDescuento(solicitud));

        if(selectedEstado === "Todos"){
          // Filtrar las solicitudes finalizadas según el rango de fechas
          solicitudFinalizadoFiltrado = solicitudesFinalizadasResponse.filter((solicitud) => {
          const fecha = new Date(solicitud.Fecha);
          const fechaSolicitud = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

          return fechaSolicitud >= startDate && fechaSolicitud <= endDate;
          });
        
        }
        else if(selectedEstado === "Pagado"){
         // Filtrar las solicitudes finalizadas según el rango de fechas
         solicitudFinalizadoFiltrado = solicitudesFinalizadasResponse.filter((solicitud) => {
          const fecha = new Date(solicitud.Fecha);
          const fechaSolicitud = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

          return fechaSolicitud >= startDate && fechaSolicitud <= endDate && solicitud.PagadoPorOppa === true;
          });

        }
        else if(selectedEstado === "NoPagado"){
        // Filtrar las solicitudes finalizadas según el rango de fechas
        
        solicitudFinalizadoFiltrado = solicitudesFinalizadasResponse.filter((solicitud) => {
          const fecha = new Date(solicitud.Fecha);
          const fechaSolicitud = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

          return fechaSolicitud >= startDate && fechaSolicitud <= endDate && solicitud.PagadoPorOppa === false;
          });    
        }

        
        setSolicitudesFinalizadas(solicitudFinalizadoFiltrado);
        const mapaProveedor = new Map();
  
        for (const solicitud of solicitudFinalizadoFiltrado) {
          const proveedorResponse = await fetch(`${URL_BACKEND}/api/proveedores/${solicitud.IdProveedor}`).then((response) => response.json());
          if (proveedorResponse !== null) {
            mapaProveedor.set(solicitud.IdProveedor, { id: solicitud._id, Rut: proveedorResponse.Rut });
          }
        }
  
        setProveedorMap(mapaProveedor);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const aplicarDescuento = (solicitud) => {
      //const servicio = serviciosResponse.find(servicio => servicio._id === solicitud.IdServicio);
      const descuento = solicitud.Precio * solicitud.Comision;
      let resultado = solicitud.Precio - descuento;
      solicitud.Precio = resultado;
      return solicitud;
      
    };
    
    const handleStartDateChange = date => {
      setStartDate(date);
      if (date > endDate) {
        setEndDate(date);
      }
    };      
  const handleEndDateChange = date => {
      setEndDate(date);
      if (date < startDate) {
        setStartDate(date);
      }
    };
    //Obtiene los valores del input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };      

  // Función para manejar el cambio en el valor del combobox
  const handleEstadoChange = (e) => {
    setSelectedEstado(e.target.value); // Actualiza el estado seleccionado
  };

  if(searchQuery) {
    solicitudesFinalizdas = solicitudesFinalizdas.filter((solicitud) => {
      const proveedorRut = solicitud.IdProveedor !== null && proveedorMap.has(solicitud.IdProveedor)
        ? proveedorMap.get(solicitud.IdProveedor)?.Rut.toLowerCase()
        : '';
  
      return proveedorRut.includes(searchQuery.toLowerCase());
    });
  }
  
  const handleCheckboxChange = async (checked, id) => {
    try{

      await fetch(`${URL_BACKEND}/api/solicitud/${id}`, {
        method:'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({PagadoPorOppa: checked}),
      });

      setSolicitudesFinalizadas((prevSolicitud) =>
      prevSolicitud.map((solicitud) =>
      solicitud._id === id ? { ...solicitud, PagadoPorOppa: checked } : solicitud));

      alert("Pago actualizado", "ok");


    }catch(error){
      //console.log(error)
      alert("No se pudo actualizar el pago, intentlo nuevamente.", "ok");

    }

  }

  //REDIRECCION A LA PAGINA PROVEEDORFORMS.
  const handleRowClickSolicitudPago = (SolicitudId) => {
    navigate(`/pagos/${SolicitudId}`);
  };

  return(
      <div >
        <h1>Pagos</h1>
        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' />
        <div>
          <div>
          <div className="input-buttons-container" style={{ marginBottom: '15px' }}>
                <div className="input-group">
                  <h6>Desde:</h6>
                  <DatePicker
                    className="form-control"
                    selected={startDate}
                    onChange={handleStartDateChange}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    locale={es}
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
                <div className="input-group">
                  <h6>Hasta:</h6>
                  <DatePicker
                    className="form-control"
                    selected={endDate}
                    onChange={handleEndDateChange}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    locale={es}
                    dateFormat="dd/MM/yyyy"
                  />
                </div>
                <div className="input-group">
                  <h6>Estado:</h6>
                  <select className="form-control" value={selectedEstado} onChange={handleEstadoChange}>
                    <option value="Todos">Todos</option>
                    <option value="NoPagado">No Pagado</option>
                    <option value="Pagado">Pagado</option>
                  </select>
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
                    <button className="btn btn-clear" onClick={() => setSearchQuery('')}>
                      <span className="fa fa-times"></span>
                    </button>
                  )}
                </div>
              </div>
            <div className="tabla-container">
              <table className='tabla'>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Servicio</th>
                    <th>Proveedor</th>
                    <th>Monto</th>
                    <th>Estado Solicitud</th>
                    <th>Estado de Pago</th>
                  </tr>
                </thead>
                <tbody>
                {solicitudesFinalizdas.map((solicitud) => (
                      <tr key={solicitud._id} onDoubleClick={() => handleRowClickSolicitudPago(solicitud._id)}>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {format(new Date(solicitud.Fecha), 'dd-MM-yyyy', { locale: esLocale })}
                          </td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {solicitud.NombreServicio}
                          </td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {proveedorMap.get(solicitud.IdProveedor)?.Rut || 'N/A'}
                          </td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(solicitud.Precio)}
                          </td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {solicitud.Estado}
                          </td>

                          <td>
                              <input
                                type="checkbox"
                                checked={solicitud.PagadoPorOppa}
                                onChange={(e) => handleCheckboxChange(e.target.checked, solicitud._id)}
                              />
                          </td>
                                    
                      </tr>
                  ))}
                  </tbody>
              </table>
            </div>
          </div>
      
      </div>
      </div>

    );
};

export default Pagos;