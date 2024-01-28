import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import esLocale from 'date-fns/locale/es';
import '../index.css';

import { URL_BACKEND } from "../App";

const Solicitudes = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [solicitudesBuscandoOppa, setSolicitudesBuscandoOppa] = useState([]);
  const [clienteMap, setClienteMap] = useState(new Map());

  useEffect(() => {
    fetchData();
    

  }, []);

  const fetchData = async () => {
    try {
        const hoy = new Date();
        setSelectedDate(hoy);
        setFechaSeleccionada(hoy);
        //Obtner todas las solicitudes en estado "Buscando OPPA"
        const solicitudesBuscandoOppaResponse = await fetch(`${URL_BACKEND}/api/solicitud/BuscandoOppa`).then((response) => response.json());
         // Filtrar las solicitudes según la fecha
        const solicitudesFiltradas = solicitudesBuscandoOppaResponse.filter((solicitud) => {
            const fechaSolicitud = new Date(solicitud.Fecha); // Asegúrate de adaptar la propiedad de fecha según la estructura de tu objeto solicitud
            return (
            fechaSolicitud.getDate() === hoy.getDate() &&
            fechaSolicitud.getMonth() === hoy.getMonth() &&
            fechaSolicitud.getFullYear() === hoy.getFullYear()
            );
        });
    
        setSolicitudesBuscandoOppa(solicitudesFiltradas);
        const mapaClientes = new Map();
        //Recorrer la lista de solicitudesFiltradas
        for (const solicitud of solicitudesFiltradas) {

          if(solicitud.IdCliente !== null && solicitud.IdApoderado !== null){
            const clienteResponse = await fetch(`${URL_BACKEND}/api/clientes/${solicitud.IdCliente}`).then((response) => response.json());
            const apoderadoResponse = await fetch(`${URL_BACKEND}/api/apoderados/${solicitud.IdApoderado}`).then((response) => response.json());
            
            mapaClientes.set(solicitud.IdCliente, { id: solicitud._id, Rut: clienteResponse.Rut });
            mapaClientes.set(solicitud.IdApoderado, { id: solicitud._id, Rut: apoderadoResponse.Rut });

          }
          else if(solicitud.IdCliente !== null){
            const clienteResponse = await fetch(`${URL_BACKEND}/api/clientes/${solicitud.IdCliente}`).then((response) => response.json());
            mapaClientes.set(solicitud.IdCliente, { id: solicitud._id, Rut: clienteResponse.Rut });
          }
          else{
            const apoderadoResponse = await fetch(`${URL_BACKEND}/api/apoderados/${solicitud.IdApoderado}`).then((response) => response.json());
            mapaClientes.set(solicitud.IdApoderado, { id: solicitud._id, Rut: apoderadoResponse.Rut });
          }
        };

        setClienteMap(mapaClientes);


    }catch(error){
        
    }
  }



  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setFechaSeleccionada(date);
    const solicitudesBuscandoOppaResponse = await fetch(`${URL_BACKEND}/api/solicitud/BuscandoOppa`).then((response) => response.json());
         // Filtrar las solicitudes según la fecha
        const solicitudesFiltradas = solicitudesBuscandoOppaResponse.filter((solicitud) => {
            const fechaSolicitud = new Date(solicitud.Fecha); // Asegúrate de adaptar la propiedad de fecha según la estructura de tu objeto solicitud
            return (
            fechaSolicitud.getDate() === date.getDate() &&
            fechaSolicitud.getMonth() === date.getMonth() &&
            fechaSolicitud.getFullYear() === date.getFullYear()
            );
        });
    
        setSolicitudesBuscandoOppa(solicitudesFiltradas);

        const mapaClientes = new Map();
        //Recorrer la lista de solicitudesFiltradas
        for (const solicitud of solicitudesFiltradas) {

          if(solicitud.IdCliente !== null && solicitud.IdApoderado !== null){
            const clienteResponse = await fetch(`${URL_BACKEND}/api/clientes/${solicitud.IdCliente}`).then((response) => response.json());
            const apoderadoResponse = await fetch(`${URL_BACKEND}/api/apoderados/${solicitud.IdApoderado}`).then((response) => response.json());
            
            mapaClientes.set(solicitud.IdCliente, { id: solicitud._id, Rut: clienteResponse.Rut });
            mapaClientes.set(solicitud.IdApoderado, { id: solicitud._id, Rut: apoderadoResponse.Rut });

          }
          else if(solicitud.IdCliente !== null){
            const clienteResponse = await fetch(`${URL_BACKEND}/api/clientes/${solicitud.IdCliente}`).then((response) => response.json());
            mapaClientes.set(solicitud.IdCliente, { id: solicitud._id, Rut: clienteResponse.Rut });
          }
          else{
            const apoderadoResponse = await fetch(`${URL_BACKEND}/api/apoderados/${solicitud.IdApoderado}`).then((response) => response.json());
            mapaClientes.set(solicitud.IdApoderado, { id: solicitud._id, Rut: apoderadoResponse.Rut });
          }
        };

        setClienteMap(mapaClientes);

  };

  return (
    <div>
      <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' />
      <h1>Servicios Solicitados</h1>
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
          <table className='table'>
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Rut Cliente</th>
                <th>Rut Apoderado</th>
                <th>Region</th>
                <th>Comuna</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Estado</th>

              </tr>
            </thead>
            <tbody>
                {solicitudesBuscandoOppa.map((solicitud) => (
                    <tr key={solicitud._id} >
                        <td>{solicitud.NombreServicio}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {clienteMap.get(solicitud.IdCliente)?.Rut || 'N/A'}
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {clienteMap.get(solicitud.IdApoderado)?.Rut || 'N/A'}
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {solicitud.Region}
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {solicitud.Comuna}
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {format(new Date(solicitud.Fecha), 'yyyy-MM-dd', { locale: esLocale })}
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {solicitud.Hora}
                        </td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {solicitud.Estado}
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

export default Solicitudes;
