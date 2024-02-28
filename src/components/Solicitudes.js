import React, { useEffect, useState} from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { URL_BACKEND } from "../App";
import { format } from 'date-fns';
import moment from 'moment';
import ListaProveedor from './ListaProveedor';
import Modal from 'react-modal'; // Importa Modal desde 'react-modal'

Modal.setAppElement('#root');

const SolicitudDetalle = () => {
    const { id: solicitudId } = useParams();
    const navigate = useNavigate();
    const [cliente, setCliente] = useState({});
    const [apoderado, setApoderado] = useState({});
    const [solicitud, setSolicitud] = useState({});
    const [proveedor, setProveedor] = useState({});
    const [servcio, setServicio] = useState({});
    const [direccion, setDireccion] = useState({});
    const [direccionCompleta, setDireccionCompleta] = useState("");
    const [horaFinal, setHoraFinal] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [hayProveedor, setHayProveedor] = useState(false);
    const [actualizarSolicitud, setActualizarSolicitud] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    

    useEffect(() => {
        fetchData();

    }, [])

    const fetchData = async() => {
        try {
            //responde de solicitud
            const solicitudResponse = await fetch(`${URL_BACKEND}/api/solicitud/BuacarSolicitudPorId/${solicitudId}`).then((response) => response.json());
            setSolicitud(solicitudResponse);
            const clienteResponse = await fetch(`${URL_BACKEND}/api/clientes/${solicitudResponse.IdCliente}`).then((response) => response.json());
            setCliente(clienteResponse);
            const apoderadoRespuesta = await fetch(`${URL_BACKEND}/api/apoderados/${solicitudResponse.IdApoderado}`).then((response) => response.json());
            setApoderado(apoderadoRespuesta);
            const servicioResponse = await fetch(`${URL_BACKEND}/api/servicios/${solicitudResponse.IdServicio}`).then((response) => response.json());
            setServicio(servicioResponse);
            const direccionResponse = await fetch(`${URL_BACKEND}/api/direccion/${solicitudResponse.IdDireccion}`).then((response) => response.json());
            setDireccion(direccionResponse);

            if(solicitudResponse.IdProveedor != null){
                const proveedorResponse = await  fetch(`${URL_BACKEND}/api/proveedores/${solicitudResponse.IdProveedor}`).then((response) => response.json());
                setProveedor(proveedorResponse);
                setHayProveedor(true);
            }

            const construirDireccion = direccionResponse.Comuna + ", " + direccionResponse.Calle;
            setDireccionCompleta(construirDireccion);


            // Calcular la hora final sumando la hora inicial y la duración del servicio
            let hora = moment(solicitudResponse.Hora, 'HH:mm:ss');
            
            const horaFinalCalculada = hora.add(servicioResponse.DuracionMinutos, 'minutes').format('HH:mm');
            
            setHoraFinal(horaFinalCalculada);

            setIsLoading(false); // Cambiar el estado a falso cuando todos los datos estén cargados



        } catch (error) {
            setIsLoading(false); // Manejar el estado de carga en caso de error
        }
       

    };

    const agregarProveedor = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleSelectProveedor = async (proveedorSeleccionado) => {
        // Lógica para manejar el proveedor seleccionado
        const proveedorServcioResponse = await fetch(`${URL_BACKEND}/api/proveedorServicio/${proveedorSeleccionado._id}`).then((response) => response.json());
        const estadoProfesionResponse = await fetch(`${URL_BACKEND}/api/profesionEstados/proveedor/${proveedorSeleccionado._id}`).then((response) => response.json());
    
        if (proveedorServcioResponse != null && estadoProfesionResponse != null) {

            const servicioFiltrado = proveedorServcioResponse.find(servicio => servicio.IdServicio === solicitud.IdServicio);
            const profesionFiltrada = estadoProfesionResponse.find(profesion => profesion._id === servicioFiltrado?.IdProfesion);
    
            if (servicioFiltrado != null && profesionFiltrada != null) {

                setProveedor(proveedorSeleccionado);
    
                setSolicitud((prevSolicitud) => ({
                    ...prevSolicitud,
                    IdProveedor: proveedorSeleccionado._id,
                    Estado: "Agendado",
                    IdProfesionEstado: servicioFiltrado.IdProfesion,
                    RatingServicio: profesionFiltrada.Rating
                }));
    
                setHayProveedor(true);
                setActualizarSolicitud(true);
            } else {
                await alert("No se encontró el servicio o la profesión correspondiente en las respuestas.");
                
            }
        }
        // Puedes hacer lo que necesites con el proveedor seleccionado aquí
    };
    

    const actualizarSolicitudNuevoProveedor = async() => {
        console.log(solicitud);
        const fecha = new Date();
        const meses = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];
        const nombreMes = meses[fecha.getMonth()];
        const dia = String(fecha.getDay() + 1);

        const TituloSolicitud = `${solicitud.NombreServicio} ${dia} ${nombreMes} ${solicitud.Hora} hrs.`;



        let comprobarSolicitud =  await fetch(`${URL_BACKEND}/api/solicitud/BuacarSolicitudPorId/${solicitudId}`).then((response) => response.json());
        if(comprobarSolicitud.IdProveedor === null){

            await fetch(`${URL_BACKEND}/api/solicitud/${solicitud._id}`, {
                method:'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({...solicitud}),
            });

            comprobarSolicitud = await fetch(`${URL_BACKEND}/api/solicitud/BuacarSolicitudPorId/${solicitudId}`).then((response) => response.json());

            if(comprobarSolicitud.IdProveedor === solicitud.IdProveedor){
                //Se crea mensajeria
                const listaLeido = [];

                let leidoProveedor = {
                    IdProveedor: solicitud.IdProveedor,
                    IdCliente: null,
                    IdApoderado: null,
                    HaLeido: true

                }

                listaLeido.push(leidoProveedor);

                if(solicitud.IdCliente != null){

                    let leidoCliente = {
                        IdProveedor : null,
                        IdCliente : solicitud?.IdCliente,
                        IdApoderado: null,
                        HaLeido : true
                    }

                    listaLeido.push(leidoCliente);

                    cliente.Apoderados.forEach(IdApoderado => {
                        console.log(IdApoderado)
                        let leido = {
                            IdProveedor: null,
                            IdCliente: null,
                            IdApoderado: IdApoderado,
                            HaLeido: true

                        }

                        listaLeido.push(leido);
                    });
                    


                }
                else{
                    let leidoApoderado = {
                        IdProveedor : null,
                        IdCliente : null,
                        IdApoderado : solicitud.IdApoderado,
                        HaLeido : true
                    }

                    listaLeido.push(leidoApoderado);
                        
                }

                const conversacion = {
                    Nombre: TituloSolicitud,
                    NombreUltimaPersona: "",
                    FotoConversacion: solicitud.FotoServicio,
                    UltimoMensaje: "",
                    HoraUltimoMensaje: new Date(),
                    NoLeido: false,
                    IdSolicitud: solicitud._id,
                    IdCliente: solicitud.IdCliente,
                    IdApoderado: solicitud.IdApoderado,
                    IdProveedor: solicitud.IdProveedor,
                    ArrayLeidos : listaLeido

                };

                console.log(conversacion);
                
                await fetch(`${URL_BACKEND}/api/conversacion/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body:JSON.stringify(conversacion),
                });

                //refrescar la pagina...
                //navigate(`/solicitudes`);
                window.location.reload();



            }
            else{
                alert("No se pudo modificar el proveedor.");
            }


        }else{
            alert("Ya tomaron la solicitud.");
        }

    }


    const volverPaginaAnterior = () => {
        navigate(`/solicitudes`);
    }

    return(
        <div>
            <h1>Detalle de solicitud</h1>
            {isLoading ? ( // Mostrar un indicador de carga mientras los datos se están cargando
                <div>Cargando...</div>
            ) : (
            <div className="container mt-5">
                <div className="card">
                    <div className="card-body">
                    <h5 className="card-title">Información de la Actividad</h5>
                    <ul className="list-group list-group-flush">
                    <li className="list-group-item"><strong>Nombre del servicio:</strong> {solicitud?.NombreServicio}</li>
                            <li className="list-group-item"><strong>Cliente:</strong> {cliente?.Nombre} {cliente?.Apellidos}</li>
                            <li className="list-group-item"><strong>Telefono del cliente:</strong>{cliente?.Numero_Telefonico}</li>
                            <li className="list-group-item"><strong>Apoderado:</strong> {apoderado?.Nombre} {apoderado?.Apellidos}</li>
                            <li className="list-group-item"><strong>Telefono del apoderado:</strong>{apoderado?.Numero_Telefonico}</li>
                            <li className="list-group-item"><strong>Fecha:</strong> {solicitud?.Fecha ? format(new Date(solicitud.Fecha), 'dd-MM-yyyy') : 'Fecha inválida'}</li>
                            <li className="list-group-item"><strong>Hora:</strong> {moment(solicitud?.Hora, 'HH:mm:ss').format('HH:mm')} - {horaFinal} </li>
                            <li className="list-group-item"><strong>Dirección:</strong> {direccionCompleta}</li>
                            <li className="list-group-item"><strong>Detalle:</strong> {direccion?.Detalle}</li>
                    </ul>
                    <h5 className="card-title">Información del Proveedor</h5>
                    {hayProveedor ? (
                        <div>
                            {actualizarSolicitud ? (
                            <div>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item"><strong>Nombre:</strong> {proveedor?.Nombre} {proveedor?.Apellidos}</li>
                                    <li className="list-group-item"><strong>Rut:</strong> {proveedor?.Rut} </li>
                                    <li className="list-group-item"><strong>Telefono: </strong> +56 {proveedor?.Telefono}</li>
                                </ul>
                                <div>
                                    <button  className="btn btn-info accordion-flush" onClick={actualizarSolicitudNuevoProveedor}>Actualizar Solicitud</button>
                                </div>
                                <button  className="btn btn-warning accordion-flush" onClick={agregarProveedor}>Cambiar Proveedor</button>
                                <ListaProveedor
                                isOpen={modalIsOpen}
                                closeModal={closeModal}
                                handleSelectProveedor={handleSelectProveedor} // Pasar la función aquí
                            />   
                            </div>
                            ) : (
                            <dvi>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item"><strong>Nombre:</strong> {proveedor?.Nombre} {proveedor?.Apellidos}</li>
                                    <li className="list-group-item"><strong>Rut:</strong> {proveedor?.Rut} </li>
                                    <li className="list-group-item"><strong>Telefono: </strong> +56 {proveedor?.Telefono}</li>
                                </ul>
                                
                            </dvi>
                            )}
                            

                        </div>
                        
                    ): (
                        <div>
                            <label>No hay proveedor</label>
                                <button  className="btn btn-info accordion-flush" onClick={agregarProveedor}>+ Agregar Proveedor</button>
                                <ListaProveedor
                                isOpen={modalIsOpen}
                                closeModal={closeModal}
                                handleSelectProveedor={handleSelectProveedor} // Pasar la función aquí
                            />   
                        </div>
                        
                    )}
                    </div>
                    <button className="btn btn-primary mt-3" onClick={volverPaginaAnterior}>Volver a solicitudes</button>
                  
                </div>
            </div>
            )}
        </div>
    );
};

export default  SolicitudDetalle;