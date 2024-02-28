import React, { useEffect, useState } from 'react';
import {useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import esLocale from 'date-fns/locale/es';
import '../index.css';

import { URL_BACKEND } from "../App";

const Solicitudes = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('Todos');
  const [solicitudes, setSolicitudes] = useState([]);
  const [clienteMap, setClienteMap] = useState(new Map());
  const [solicutudesCalendar, setSolicitudesCalendar] = useState([]);


  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
        const hoy = new Date();
        setSelectedDate(hoy);
        //Obtner todas las solicitudes en estado "Buscando OPPA"
        const solicitudesBuscandoOppaResponse = await fetch(`${URL_BACKEND}/api/solicitud/solicitudTotal`).then((response) => response.json());
         // Filtrar las solicitudes según la fecha
        
        const solicitudesFiltradas = solicitudesBuscandoOppaResponse.filter((solicitud) => {
            const fechaSolicitud = new Date(solicitud.Fecha); // Asegúrate de adaptar la propiedad de fecha según la estructura de tu objeto solicitud
            return (
            fechaSolicitud.getDate() === hoy.getDate() &&
            fechaSolicitud.getMonth() === hoy.getMonth() &&
            fechaSolicitud.getFullYear() === hoy.getFullYear()
            );
        });

        setSolicitudesCalendar(solicitudesBuscandoOppaResponse);
    
        setSolicitudes(solicitudesFiltradas);
        const mapaClientes = new Map();
        //Recorrer la lista de solicitudesFiltradas
        for (const solicitud of solicitudesFiltradas) {

          if(solicitud.IdCliente !== null && solicitud.IdApoderado !== null){
            const clienteResponse = await fetch(`${URL_BACKEND}/api/clientes/${solicitud.IdCliente}`).then((response) => response.json());
            const apoderadoResponse = await fetch(`${URL_BACKEND}/api/apoderados/${solicitud.IdApoderado}`).then((response) => response.json());
            
            if(clienteResponse != null && apoderadoResponse != null){
              mapaClientes.set(solicitud.IdCliente, { id: solicitud._id, Rut: clienteResponse.Rut });
              mapaClientes.set(solicitud.IdApoderado, { id: solicitud._id, Rut: apoderadoResponse.Rut });
            }
            

          }
          else if(solicitud.IdCliente !== null && solicitud.IdApoderado  == null){
            const clienteResponse = await fetch(`${URL_BACKEND}/api/clientes/${solicitud.IdCliente}`).then((response) => response.json());
            if(clienteResponse != null){
              mapaClientes.set(solicitud.IdCliente, { id: solicitud._id, Rut: clienteResponse.Rut });
            }
          }
          else if(solicitud.IdCliente == null && solicitud.IdApoderado  !== null){
            const apoderadoResponse = await fetch(`${URL_BACKEND}/api/apoderados/${solicitud.IdApoderado}`).then((response) => response.json());
            
            if(apoderadoResponse != null){
              mapaClientes.set(solicitud.IdApoderado, { id: solicitud._id, Rut: apoderadoResponse.Rut });
            }
          }
        };

        setClienteMap(mapaClientes)
        console.log(solicitudesBuscandoOppaResponse)


    }catch(error){
        
    }
  }
  const handleDateChange = async (date) => {
    setSelectedDate(date);
    const solicitudesBuscandoOppaResponse = await fetch(`${URL_BACKEND}/api/solicitud/solicitudTotal`).then((response) => response.json());
    setSolicitudesCalendar(solicitudesBuscandoOppaResponse);
         // Filtrar las solicitudes según la fecha
        const solicitudesFiltradas = solicitudesBuscandoOppaResponse.filter((solicitud) => {
            const fechaSolicitud = new Date(solicitud.Fecha); // Asegúrate de adaptar la propiedad de fecha según la estructura de tu objeto solicitud
            return (
            fechaSolicitud.getDate() === date.getDate() &&
            fechaSolicitud.getMonth() === date.getMonth() &&
            fechaSolicitud.getFullYear() === date.getFullYear()
            );
        });
    
        setSolicitudes(solicitudesFiltradas);

        const mapaClientes = new Map();
        //Recorrer la lista de solicitudesFiltradas
        for (const solicitud of solicitudesFiltradas) {

          if(solicitud.IdCliente !== null && solicitud.IdApoderado !== null){
            const clienteResponse = await fetch(`${URL_BACKEND}/api/clientes/${solicitud.IdCliente}`).then((response) => response.json());
            const apoderadoResponse = await fetch(`${URL_BACKEND}/api/apoderados/${solicitud.IdApoderado}`).then((response) => response.json());
            
            if(clienteResponse != null && apoderadoResponse != null){
              mapaClientes.set(solicitud.IdCliente, { id: solicitud._id, Rut: clienteResponse.Rut });
              mapaClientes.set(solicitud.IdApoderado, { id: solicitud._id, Rut: apoderadoResponse.Rut });
            }
            

          }
          else if(solicitud.IdCliente !== null && solicitud.IdApoderado  == null){
            const clienteResponse = await fetch(`${URL_BACKEND}/api/clientes/${solicitud.IdCliente}`).then((response) => response.json());
            if(clienteResponse != null){
              mapaClientes.set(solicitud.IdCliente, { id: solicitud._id, Rut: clienteResponse.Rut });
            }
          }
          else if(solicitud.IdCliente == null && solicitud.IdApoderado  !== null){
            const apoderadoResponse = await fetch(`${URL_BACKEND}/api/apoderados/${solicitud.IdApoderado}`).then((response) => response.json());
            
            if(apoderadoResponse != null){
              mapaClientes.set(solicitud.IdApoderado, { id: solicitud._id, Rut: apoderadoResponse.Rut });
            }
          }
        };

        setClienteMap(mapaClientes);

  };

   //Obtiene los valores del input
   const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Función para manejar el cambio en el valor del combobox
  const handleEstadoChange = (e) => {
      setSelectedEstado(e.target.value); // Actualiza el estado seleccionado
  };

 //metodo de filtrados
 let solicitudFiltrada = []
 if(!searchQuery && selectedEstado  === "Todos"){
   solicitudFiltrada = solicitudes;
 }
 else if(searchQuery && selectedEstado === "Todos"){
  
   solicitudFiltrada = solicitudes.filter((solicitud) => {
     const clienteRut = solicitud.IdCliente !== null && clienteMap.has(solicitud.IdCliente)
       ? clienteMap.get(solicitud.IdCliente)?.Rut.toLowerCase()
       : '';
     const apoderadoRut = solicitud.IdApoderado !== null && clienteMap.has(solicitud.IdApoderado)
       ? clienteMap.get(solicitud.IdApoderado)?.Rut.toLowerCase()
       : '';
     
     // Filtrar si el rut del cliente o del apoderado coincide con la búsqueda
     return clienteRut.includes(searchQuery.toLowerCase()) || apoderadoRut.includes(searchQuery.toLowerCase());
   });

 }
 else if(!searchQuery && selectedEstado  !== "Todos"){
   solicitudFiltrada = solicitudes.filter((solicitud) => solicitud.Estado === selectedEstado);
   
 }
 else if(searchQuery && selectedEstado !== "Todos"){

   
   let Filtrada = solicitudes.filter((solicitud) => solicitud.Estado === selectedEstado);

   solicitudFiltrada = Filtrada.filter((solicitud) => {
     const clienteRut = solicitud.IdCliente !== null && clienteMap.has(solicitud.IdCliente)
       ? clienteMap.get(solicitud.IdCliente)?.Rut.toLowerCase()
       : '';
     const apoderadoRut = solicitud.IdApoderado !== null && clienteMap.has(solicitud.IdApoderado)
       ? clienteMap.get(solicitud.IdApoderado)?.Rut.toLowerCase()
       : '';
     
     // Filtrar si el rut del cliente o del apoderado coincide con la búsqueda
     return clienteRut.includes(searchQuery.toLowerCase()) || apoderadoRut.includes(searchQuery.toLowerCase());
   });
 }

  //REDIRECCION A LA PAGINA PROVEEDORFORMS.
  const handleRowClickSolicitudDetalle = (SolicitudId) => {
    navigate(`/solicitudes/${SolicitudId}`);
  };

  return (
    <div>
      <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' />
      <div>
        <div className="d-flex justify-content-between align-items-center">
          <h1>Servicios Solicitados</h1>
          <div className="input-buttons-container d-flex align-items-center">
            <div className='d-flex'>
              <div style={{ marginRight: '15px' }}>
                <select className="form-control" value={selectedEstado} onChange={handleEstadoChange}>
                  <option value="Todos">Todos</option>
                  <option value="Buscando OPPA">Buscando OPPA</option>
                  <option value="Agendado">Agendado</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Finalizado">Finalizado</option>
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
                    <button
                      className="btn btn-clear"
                      onClick={() => setSearchQuery('')}
                      >
                      <span className="fa fa-times"></span>
                    </button>
                    )}
              </div>
              
            </div>
          </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: '20px' }}>
        <Calendar
  value={selectedDate}
  onChange={handleDateChange}
  tileContent={({ date }) => {
    // Verificar si el día actual coincide con alguna fecha específica
    const esFechaEspecifica = solicutudesCalendar.some((solicitud) =>{
      const fechaSolicitud = new Date(solicitud.Fecha);
      return(
        fechaSolicitud.getDate() === date.getDate() &&
        fechaSolicitud.getMonth() === date.getMonth() &&
        fechaSolicitud.getFullYear() === date.getFullYear() &&
        solicitud.Estado === "Buscando OPPA"
      );
    });

    // Si el día actual coincide con una fecha específica, mostrar un punto rojo
    if (esFechaEspecifica) {
      return <div style={{ backgroundColor: 'red', borderRadius: '50%', width: '5px', height: '5px'}} />;
    }

    // Si no es una fecha específica, devolver null para no mostrar nada
    return null;
  }}
/>

        </div>
          <div className="tabla-container">
            <table className='tabla'>
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
                  {solicitudFiltrada.map((solicitud) => (
                      <tr key={solicitud._id} onDoubleClick={() => handleRowClickSolicitudDetalle(solicitud._id)}>
                          <td>{solicitud.NombreServicio}</td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {solicitud.IdCliente !== null && clienteMap.has(solicitud.IdCliente) ? (clienteMap.get(solicitud.IdCliente)?.Rut || 'N/A') : 'N/A'}
                          </td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {solicitud.IdApoderado !== null && clienteMap.has(solicitud.IdApoderado) ? (clienteMap.get(solicitud.IdApoderado)?.Rut || 'N/A') : 'N/A'}
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
                              {solicitud.Hora.substring(0, 5)}
                          </td>
                          <td style={{
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              color: solicitud.Estado === 'Buscando OPPA' ? 'orange' :
                                    solicitud.Estado === 'Agendado' ? 'green' :
                                    solicitud.Estado === 'Aprobado' ? 'aquamarine' :
                                    solicitud.Estado === 'Finalizado' ? 'blue' : 'black'
                            }}>
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
