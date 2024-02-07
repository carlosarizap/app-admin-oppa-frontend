import React, { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import esLocale from 'date-fns/locale/es';
import '../index.css';
import { URL_BACKEND } from "../App";


const Pagos = () => {
  const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [solicitudesFinalizdas, setSolicitudesFinalizadas] = useState([]);
    const [proveedorMap, setProveedorMap] = useState(new Map());

    useEffect(() => {
        fetchData();
        
    
      }, []);
    
      const fetchData = async () => {
        try {
          const hoy = new Date();
          setSelectedDate(hoy);
          setFechaSeleccionada(hoy);

          //Hacer un metdo get para obtner las solicitudes
          const solicitudesFinalizdasResponse = await fetch(`${URL_BACKEND}/api/solicitud/SolicitudesFinalizados`).then((response) => response.json());

          //Filtrar las solicitudes finalizadas segun el año, mes y dia
          const solicitudFinalizadoFiltrado = solicitudesFinalizdasResponse.filter((solicitud) => {
            const fechaSolicitud = new Date(solicitud.Fecha); // Asegúrate de adaptar la propiedad de fecha según la estructura de tu objeto solicitud
            return (
            fechaSolicitud.getDate() === hoy.getDate() &&
            fechaSolicitud.getMonth() === hoy.getMonth() &&
            fechaSolicitud.getFullYear() === hoy.getFullYear()
            );
          });
          setSolicitudesFinalizadas(solicitudFinalizadoFiltrado);

          const mapaProveedor = new Map();

          for(const solicitud of solicitudFinalizadoFiltrado){
            const proveedorResponse = await fetch(`${URL_BACKEND}/api/proveedores/${solicitud.IdProveedor}`).then((response) => response.json());
            if(proveedorResponse !== null){
              mapaProveedor.set(solicitud.IdProveedor, {id: solicitud._id, Rut: proveedorResponse.Rut})
            }
          };

          setProveedorMap(mapaProveedor);

        }catch(error){
            
        }
      }

    const handleDateChange = async (date) => {
        setSelectedDate(date);
        setFechaSeleccionada(date);

        //Hacer un metdo get para obtner las solicitudes
        const solicitudesFinalizdasResponse = await fetch(`${URL_BACKEND}/api/solicitud/SolicitudesFinalizados`).then((response) => response.json());

        //Filtrar las solicitudes finalizadas segun el año, mes y dia
        const solicitudFinalizadoFiltrado = solicitudesFinalizdasResponse.filter((solicitud) => {
          const fechaSolicitud = new Date(solicitud.Fecha); // Asegúrate de adaptar la propiedad de fecha según la estructura de tu objeto solicitud
          return (
          fechaSolicitud.getDate() === date.getDate() &&
          fechaSolicitud.getMonth() === date.getMonth() &&
          fechaSolicitud.getFullYear() === date.getFullYear()
          );
        });
        setSolicitudesFinalizadas(solicitudFinalizadoFiltrado);

        const mapaProveedor = new Map();

        for(const solicitud of solicitudFinalizadoFiltrado){
          const proveedorResponse = await fetch(`${URL_BACKEND}/api/proveedores/${solicitud.IdProveedor}`).then((response) => response.json());
          if(proveedorResponse !== null){
            mapaProveedor.set(solicitud.IdProveedor, {id: solicitud._id, Rut: proveedorResponse.Rut})
          }
        };

        setProveedorMap(mapaProveedor);
    };

    //REDIRECCION A LA PAGINA PROVEEDORFORMS.
    const handleRowClickSolicitudPago = (SolicitudId) => {
          navigate(`/pagos/${SolicitudId}`);
    };

    return(
      <div >
        <h1>Pagos</h1>
        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' />
        <div>
          <div style={{ display: 'flex' }}>
            <div style={{ marginRight: '20px' }}>
              <Calendar
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>
            <div>
            <div>
              <p>Fecha seleccionada: {fechaSeleccionada ? format(fechaSeleccionada, 'yyyy-MM-dd', { locale: esLocale }) : 'Ninguna'}</p>
            </div>
            <div className="tabla-container">
              <table className='tabla'>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Servicio</th>
                    <th>Proveedor</th>
                    <th>Monto</th>
                    <th>Estado de Pago</th>
                  </tr>
                </thead>
                <tbody>
                {solicitudesFinalizdas.map((solicitud) => (
                      <tr key={solicitud._id} onDoubleClick={() => handleRowClickSolicitudPago(solicitud._id)}>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {format(new Date(solicitud.Fecha), 'yyyy-MM-dd', { locale: esLocale })}
                          </td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {solicitud.NombreServicio}
                          </td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {proveedorMap.get(solicitud.IdProveedor)?.Rut || 'N/A'}
                          </td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {solicitud.Precio}
                          </td>
                          <td>
                              {solicitud.PagadoPorOppa? (
                                <span style={{color: 'green'}}>Pagado</span>
                              ) : (<span style={{color: 'red'}}>No Pagado</span>)}
                          </td>
                                    
                      </tr>
                  ))}
                  </tbody>
              </table>
            </div>
          </div>
      </div>
      </div>
      </div>

    );
};

export default Pagos;