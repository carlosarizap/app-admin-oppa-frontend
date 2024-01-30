import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { useParams, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import axios from 'axios';
import { URL_BACKEND } from "../App";

const ProveedorForm = () => {
    const navigate = useNavigate();
    const { id: proveedorId } = useParams();
    const [proveedor, setProveedor] = useState({});
    const [bancos, setBancos] = useState([]);
    //---------------------------------------
    const [profesiones, setProfesiones] = useState([]);
    const [selectedProfesiones, setSelectedProfesiones] = useState([]);
    const [profesionEstado, setProfesionEstado] = useState([]);
    //---------------------------------------
    const [proveedorServicio, setProveedorServicio] = useState([]);
    const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
    //----------------------------------------
    const [proveedorSolicitudes, setproveedorSolicitudes] = useState([]);
    
    const currentDate = new Date();
    //cambio de genero
    const options = [
        { value: 'Femenino', label: 'Femenino' },
        { value: 'Masculino', label: 'Masculino' },
        { value: 'Prefiero no decir', label: 'Prefiero no decir' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    //SE CARGAN LOS DATOS DEL PROVEEDOR: BANCO, PROFESIONES, PROFESIONESTADO(DEL PROVEEDOR)
    const fetchData = async () => {
        try {
            const proveedorResponse = await fetch(`${URL_BACKEND}/api/proveedores/${proveedorId}`).then((response) =>
                response.json()
            );
            //SE HACEN LAS PETICIONES A LA BASE DE DATOS Y SE GUARDAN.
            const bancosResponse = await fetch(`${URL_BACKEND}/api/bancos/`).then((response) => response.json());
            const profesionesResponse = await fetch(`${URL_BACKEND}/api/profesiones/`).then((response) => response.json());
            const profesionEstadoResponse = await fetch(`${URL_BACKEND}/api/profesionEstados/proveedor/${proveedorId}`).then((response) => response.json());
            const serviciosProveedorResponse = await fetch(`${URL_BACKEND}/api/proveedorServicio/${proveedorId}`).then((response) => response.json());
            const solicitudesProveedorResponse = await fetch(`${URL_BACKEND}/api/solicitud/SolicitudesProveedor/${proveedorId}`).then((response) => response.json());
            //Aqui se guardan los datos
            setProveedor(proveedorResponse);
            setBancos(bancosResponse.map((banco) => ({ value: banco.Nombre, label: banco.Nombre })));
            setProfesiones(profesionesResponse);
            setproveedorSolicitudes(solicitudesProveedorResponse);
            
            

            setSelectedProfesiones(profesionEstadoResponse.map((profesion) => ({ value: profesion.Nombre, label: profesion.Nombre })))

            setProfesionEstado(profesionEstadoResponse);
            setProveedorServicio(serviciosProveedorResponse);
            
            if (proveedorResponse.FotoPerfil && proveedorResponse.FotoPerfil.data) {
                
                const blob = new Blob([Uint8Array.from(proveedorResponse.FotoPerfil.data)], { type: 'image/png' });
                const imageUrl = URL.createObjectURL(blob);
                setFotoPerfilUrl(imageUrl);
            } else {
                console.warn('La propiedad FotoPerfil.data es nula o no tiene datos.');
            }


        } catch (error) {
            console.error('Error fetching proveedor:', error);
        }
    };

    if (proveedor === null) {
        return <div>Proveedor no se encuentra registrado</div>;
    }

    //LA FUNCION handleSubmit ACTUALIZA LOS DATOS DEL PROVEEDOR EN LA BASE DE DATOS.
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validation checks   
        if(proveedor.Revisado === true){
            try {
                // Update the proveedor data
                await fetch(`${URL_BACKEND}/api/proveedores/${proveedor._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(proveedor),
                });
                
    
                // Se actualiza la profesion del proveedor
                const updatedProfesionEstado = await Promise.all(
                        profesionEstado.map(async (profesion) => {
                            const response = await fetch(
                                `${URL_BACKEND}/api/profesionEstados/${profesion._id}`,
                                {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(profesion),
                                }
                            );
                            return response.json();
                        })
                );
               
                
                if(proveedorServicio.length > 0){
                    const updatedProveedorServicio = await Promise.all(
                        proveedorServicio.map(async (servicio) => {
                            const response = await fetch(`${URL_BACKEND}/api/proveedorServicio/${servicio._id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(servicio),
                            });
                            
                        })
                    );
    
                }

                //Guardar en una lista los servicios del proveedor que estan en Estado: false y PausadoPorOPPA: true
                const serviciosPausados = proveedorServicio.filter(
                    (servicio) => servicio.PausadoPorOPPA === true && servicio.Estado === false
                );

                if(serviciosPausados.length > 0){
                    //Obtner una lista de solicitudes
                    const solicitudesProveedorResponse = await fetch(`${URL_BACKEND}/api/solicitud/SolicitudesProveedor/${proveedorId}`).then((response) => response.json());
                    
                    serviciosPausados.map(async (servicio) => {
                        const solicitudFiltrado = solicitudesProveedorResponse.filter((solicitud) =>
                        solicitud.IdProfesionEstado === servicio.IdProfesion
                        );

                        //Recorrer la lista solicitudFiltrado
                        solicitudFiltrado.map(async (solicitud) => {

                            //Obtenemos conversacion de la solicitud
                            const conversacion =  await fetch(`${URL_BACKEND}/api/conversacion/ConversacionSolicitud/${solicitud._id}`).then((response) => response.json());
                            conversacion.map(async(conver) => {
                                
                                await fetch(`${URL_BACKEND}/api/conversacion/BorrarConver/${conver._id}`, {
                                    method: 'DELETE',
                                });
                            })
                           
                            //Obtner la lista de mensaje que tenga IdConversacion igual _id de conversacion
                            const mensajes = await fetch(`${URL_BACKEND}/api/mensaje/${conversacion._id}`).then((response) => response.json());

                            //Hacer put a toda los elementos de la lista mensajes

                            mensajes.map(async (mensaje) => {
                                
                                await fetch(`${URL_BACKEND}/api/mensaje/BorrarMensaje/${mensaje._id}`,{
                                    method: 'DELETE'
                                });
                                
                            });

                            await fetch(`${URL_BACKEND}/api/solicitud/${solicitud._id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    IdProveedor: null,
                                    Estado: "Buscando OPPA",
                                    IdProfesionEstado: null

                                }),
                            });

                            
                        })  
                    })
                };


    
                // Update the selected professions in the profesionEstado collection
                const updatedSelectedProfesiones = await Promise.all(
                    selectedProfesiones.map(async (selectedProfesion) => {
                        // Check if the selected profession already exists in profesionEstado
                        const existingProfesion = profesionEstado.find(
                            (profesion) => profesion.Nombre === selectedProfesion.label
                        );
                        if (existingProfesion) {
                            // Profession already exists, update its status
                            return {
                                ...existingProfesion,
                                Activa: true, // Set the status to true or false based on your requirement
                            };
                        } else {
                            // New profession, create a new entry in profesionEstado
                            const response = await fetch(`${URL_BACKEND}/api/profesionEstados/`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    IdProveedor: proveedorId,
                                    IdProfesion: selectedProfesion.IdProfesion,
                                    IdCategoria: selectedProfesion.idCategoria,
                                    Nombre: selectedProfesion.label,
                                    Rating: 0, // Set the initial rating or other required values
                                    TotalRatings: 0,
                                    Activa: true, // Set the status to true or false based on your requirement
                                }),
                            });
                            return response.json();
                        }
                    })
                );
                // Delete professions from profesionEstado that are not selected anymore
                const deletedProfesiones = profesionEstado.filter((profesion) => {
                    const selectedProfesion = selectedProfesiones.find(
                        (selectedProfesion) => selectedProfesion.label === profesion.Nombre
                    );
                    return !selectedProfesion;
                });
    
                await Promise.all(
                    deletedProfesiones.map(async (deletedProfesion) => {
                        const serviciosElimnar = proveedorServicio.filter(
                            (servicio) => servicio.IdProfesion === deletedProfesion._id
                        );

                        if(serviciosElimnar.length > 0){
                            //Obtner una lista de solicitudes
                            const solicitudesProveedorResponse = await fetch(`${URL_BACKEND}/api/solicitud/SolicitudesProveedor/${proveedorId}`).then((response) => response.json());
                            
                            serviciosElimnar.map(async (servicio) => {
                                const solicitudFiltrado = solicitudesProveedorResponse.filter((solicitud) =>
                                solicitud.IdProfesionEstado === servicio.IdProfesion
                                );

        
                                    await fetch(`${URL_BACKEND}/api/proveedorServicio/${servicio._id}`,{
                                        method:'DELETE'
                                    });
        
                                //Recorrer la lista solicitudFiltrado
                                solicitudFiltrado.map(async (solicitud) => {
        
                                    //Obtenemos conversacion de la solicitud
                                    const conversacion =  await fetch(`${URL_BACKEND}/api/conversacion/ConversacionSolicitud/${solicitud._id}`).then((response) => response.json());
                                    conversacion.map(async(conver) => {
                                        await fetch(`${URL_BACKEND}/api/conversacion/BorrarConver/${conver._id}`, {
                                            method: 'DELETE',
                                        });
                                    })
                                   
                                    //Obtner la lista de mensaje que tenga IdConversacion igual _id de conversacion
                                    const mensajes = await fetch(`${URL_BACKEND}/api/mensaje/${conversacion._id}`).then((response) => response.json());
        
                                    //Hacer put a toda los elementos de la lista mensajes
        
                                    mensajes.map(async (mensaje) => {
                                        
                                       await fetch(`${URL_BACKEND}/api/mensaje/BorrarMensaje/${mensaje._id}`,{
                                            method: 'DELETE'
                                        });
                                        
                                    });
        
                                    await fetch(`${URL_BACKEND}/api/solicitud/${solicitud._id}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            IdProveedor: null,
                                            Estado: "Buscando OPPA",
                                            IdProfesionEstado: null
        
                                        }),
                                    });
                                    
        
                                    
                                })  
                            })
                        };
                        


                        await fetch(`${URL_BACKEND}/api/profesionEstados/${deletedProfesion._id}`, {
                            method: 'DELETE',
                        });
                    })
                );
                navigate('/proveedores');
            } catch (error) {
                console.error('Error submitting form:', error);
            }
        }
        else{
            alert("No puede actualizar al proveedor, primero debe estar revisado.");
        }
       
    };

    //SOLO ELIMINA EL PROVEEDOR
    const handleDelete = async () => {
        const confirmed = window.confirm('¿Estás seguro de que quieres borrar este Proveedor? Se eliminaran sus Profesiones, servicios y las solicitudes agendadas se liberaran eliminando las conversaciones y mensajes.');
        if (!confirmed) {
            return;
        }

        try {
            const url = `${URL_BACKEND}/api/proveedores/${proveedorId}`;
            const response = await fetch(url, {
                method: 'DELETE',
            });
            const data = await response.json();

            //Eliminar ProfesionesEstado

            profesionEstado.map(async (profesiones) => {
                await fetch(`${URL_BACKEND}/api/profesionEstados/${profesiones._id}`, {
                    method:'DELETE'
                })
            });
            //Eliminar ProveedorServcios
            proveedorServicio.map(async(servicios) => {
                await fetch(`${URL_BACKEND}/api/proveedorServicio/${servicios._id}`, {
                    method:'DELETE'
                })
            });
            //Liberar solicitudes
            const solicitudesProveedorResponse = await fetch(`${URL_BACKEND}/api/solicitud/SolicitudesProveedor/${proveedorId}`).then((response) => response.json());
            if(solicitudesProveedorResponse.length > 0){
                solicitudesProveedorResponse.map(async(solicitud) => {

                    //Obtenemos conversacion de la solicitud
                    const conversacion =  await fetch(`${URL_BACKEND}/api/conversacion/ConversacionSolicitud/${solicitud._id}`).then((response) => response.json());
                    conversacion.map(async(conver) => {
                        
                        await fetch(`${URL_BACKEND}/api/conversacion/BorrarConver/${conver._id}`, {
                            method: 'DELETE',
                        });
                    })
                   
                    //Obtner la lista de mensaje que tenga IdConversacion igual _id de conversacion
                    const mensajes = await fetch(`${URL_BACKEND}/api/mensaje/${conversacion._id}`).then((response) => response.json());

                    mensajes.map(async (mensaje) => {
                                
                        await fetch(`${URL_BACKEND}/api/mensaje/BorrarMensaje/${mensaje._id}`,{
                            method: 'DELETE'
                        });
                        
                    });

                    await fetch(`${URL_BACKEND}/api/solicitud/${solicitud._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            IdProveedor: null,
                            Estado: "Buscando OPPA",
                            IdProfesionEstado: null

                        }),
                    });
                })
            }

            //Eliminar Conversacion

            //Eliminar mensajes
            navigate(`/proveedores`);
            console.log('Proveedor deleted successfully:', data);
        } catch (error) {
            console.error('Error deleting apoderado:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const uppercaseValue = name === 'Nombre' || name === 'Apellidos' ? value.toUpperCase() : value;
        setProveedor((prevProveedor) => ({
            ...prevProveedor,
            [name]: uppercaseValue,
        }));
    };

    const handleDateChange = (date) => {
        setProveedor((prevProveedor) => ({
            ...prevProveedor,
            Fecha_Nacimiento: date,
        }));
    };

    const handleProfesionActivaChange = (index, isActive) => {
        let updatedServicios = [];
        if(proveedor.Estado === true && proveedor.Revisado === true){
            setProfesionEstado((prevProfesionEstado) => {
                const updatedProfesionEstado = [...prevProfesionEstado];
                updatedProfesionEstado[index].Activa = isActive;
                if(isActive === true){
                    //Se activan los servicios.
                    const servciosToUpdate = proveedorServicio.filter(
                        (servicio) => servicio.IdProfesion === updatedProfesionEstado[index]._id               
                    );
    
                    updatedServicios = servciosToUpdate.map((servicio) => ({
                        ...servicio,
                        Estado: true,
                        PausadoPorOPPA: false,
                    }));


    
                }else{
                    //Se desactivan todos los servcios de la profesion.
                    const servciosToUpdate = proveedorServicio.filter(
                        (servicio) => servicio.IdProfesion === updatedProfesionEstado[index]._id               
                    );
    
                    updatedServicios = servciosToUpdate.map((servicio) => ({
                        ...servicio,
                        Estado: false,
                        PausadoPorOPPA: true,
                    }));
    
                    
                };
    
                setProveedorServicio((prevProveedorServicios) => {
                    const updatedProveedorServicios = [...prevProveedorServicios];
                    updatedServicios.forEach((updatedServicio) => {
                        const index = updatedProveedorServicios.findIndex(
                            (servicio) => servicio._id === updatedServicio._id
                        );
                        if (index !== -1) {
                            updatedProveedorServicios[index] = updatedServicio;
                        }
                    });
                    return updatedProveedorServicios;
                });

                const algunaProfesionActiva = updatedProfesionEstado.some((profesion) => profesion.Activa);
                console.log(algunaProfesionActiva)
                if (!algunaProfesionActiva) {
                    // Si no hay profesiones activas, desactivar el proveedor
                    setProveedor((prevProveedor) => ({
                        ...prevProveedor,
                        Estado: false,
                    }));
                }
    
                return updatedProfesionEstado;
            });

            
        }
        else{
            console.log("No se puede activar profesion, primero se debe revisar y activar el proveedor.");
        }
    };

    const handleProfesionesChange = (selectedOptions) => {
        setSelectedProfesiones(selectedOptions);
        console.log(selectedOptions);
    };

    //ACTUALIZA LA FOTO DEL PROVEEDOR.
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const arrayBuffer = reader.result;
                const uint8Array = new Uint8Array(arrayBuffer);
                setProveedor((prevProveedor) => ({
                    ...prevProveedor,
                    FotoPerfil: Array.from(uint8Array),
                }));
            };
            reader.readAsArrayBuffer(file);
            const imageUrl = URL.createObjectURL(file);
            setFotoPerfilUrl(imageUrl);
        }
    };
    //ESTADO DE REVISADO, SI ES FALSE DE PONE EN PAUSA EL ESTADO PROVEEDOR, PROFESIONES, SERVICIOS Y LAS SOLICITUDES.
    const EstadoRevisado = (checked) => {
        if(!checked){
            if (proveedorSolicitudes.length>0) {
                const confirmed = window.confirm('Se desactiva el estado de revisado, se desactivara el proveedor en conjunto a sus profesiones, servicios y se liberan las solicitudes tomadas por el proveedor.');
                if (confirmed) {
                    //SI CHECKED ES FALSE SE DEBE DESACTIVAR EL PROVEEDOR, LAS PROFESIONES Y SUS SERVICIOS.
                    if(!checked){
                        setProveedor((prevProveedor) => ({ ...prevProveedor, Revisado: checked }));
                        setProveedor((prevProveedor) => ({
                            ...prevProveedor,
                            Estado: checked
                        }));
            
                        setProfesionEstado((prevProfesionEstado) => {
                            if(prevProfesionEstado.length > 0){
                                const updatedProfesionEstado = prevProfesionEstado.map((profesion) => ({
                                    ...profesion,
                                    Activa: checked,
                                }));
                                return updatedProfesionEstado;
                            } 
                        });
                        // Modificar todos los servicios
                        setProveedorServicio((prevProveedorServicios) => {
                            
                                const updatedProveedorServicios = prevProveedorServicios.map((servicio) => ({
                                    ...servicio,
                                    Estado: checked,
                                    PausadoPorOPPA: !checked, // Pausar si el proveedor está inactivo
                                }));
                                return updatedProveedorServicios;
                            
                        });
        
                    }
                    else {
                        window.confirm('No se realizo ni un cambio.');
        
                    }
                }
                    
            }
            else{
                setProveedor((prevProveedor) => ({ ...prevProveedor, Revisado: checked }));
                setProveedor((prevProveedor) => ({
                    ...prevProveedor,
                    Estado: checked
                }));
    
                setProfesionEstado((prevProfesionEstado) => {
                    if(prevProfesionEstado.length > 0){
                        const updatedProfesionEstado = prevProfesionEstado.map((profesion) => ({
                            ...profesion,
                            Activa: checked,
                        }));
                        return updatedProfesionEstado;
                    } 
                });
                // Modificar todos los servicios
                setProveedorServicio((prevProveedorServicios) => {
                  
                    const updatedProveedorServicios = prevProveedorServicios.map((servicio) => ({
                        ...servicio,
                        Estado: checked,
                        PausadoPorOPPA: !checked, // Pausar si el proveedor está inactivo
                    }));
                    return updatedProveedorServicios;
                
            });
                
            }
        }
        else{
            setProveedor((prevProveedor) => ({ ...prevProveedor, Revisado: checked }));
        }
       
    };
    //ESTADO DEL PROVEEDOR --> CAMBIA SUS PROFESIONES, PROFESIONES Y SERVICIOS.
    const EstadoProveedor = (checked) => {
        //SI REVISADO ES TRUE, CAMBIAR EL ESTADO DEL PROVEEDOR.
        if(proveedor.Revisado === true){
            
        //SI CHECKED ES FALSE SE DEBE DESACTIVAR A NIVEL LOCAL LAS PROFESIONES Y SERVICIOS
            if (!checked) {
                if (proveedorSolicitudes.length>0) {
                    const confirmed = window.confirm('Se desactiva el estado de revisado, se desactivara el proveedor en conjunto a sus profesiones, servicios y se liberan las solicitudes tomadas por el proveedor.');
                    if(confirmed){
                        setProveedor((prevProveedor) => ({ ...prevProveedor, Estado: checked }));
                        const updatedProfesionEstado = profesionEstado.map((profesion) => ({
                            ...profesion,
                            Activa: checked,
                        }));
                        setProfesionEstado(updatedProfesionEstado);
        
                        // Modificar todos los servicios
                        const updatedProveedorServicios = proveedorServicio.map((servicio) => ({
                            ...servicio,
                            Estado: checked,
                            PausadoPorOPPA: !checked,
                        }));
                        setProveedorServicio(updatedProveedorServicios);
                        

                    }

                }
                else{
                    setProveedor((prevProveedor) => ({ ...prevProveedor, Estado: checked }));
                        const updatedProfesionEstado = profesionEstado.map((profesion) => ({
                            ...profesion,
                            Activa: checked,
                        }));
                        setProfesionEstado(updatedProfesionEstado);
        
                        // Modificar todos los servicios
                        const updatedProveedorServicios = proveedorServicio.map((servicio) => ({
                            ...servicio,
                            Estado: checked,
                            PausadoPorOPPA: !checked,
                        }));
                        setProveedorServicio(updatedProveedorServicios);
                }
            }
            else{
                setProveedor((prevProveedor) => ({ ...prevProveedor, Estado: checked }));
            }
        }
        else{
            
        }
        
    };
    //FUNCION PARA REGRESAR A LA PAGINA ANTERIOR
    const handleGoBack = () => {
        navigate('/proveedores'); 
    };

    return (
        <div className="container mt-5">
            
            <h1 className="text-center">Editar Proveedor</h1>
            <form className="d-flex flex-column col-6 mx-auto" onSubmit={handleSubmit}>
            <div className="row justify-content-center">
                <div className="col-6">
                    {/* Mostrar la imagen */}
                    {fotoPerfilUrl && (
              <img
                src={fotoPerfilUrl}
                
                alt="Foto de perfil"
                className="custom-image rounded-circle"
              />
            )}
                </div>
                </div>
                <input type="file" 
                    onChange={handleFileChange} 
                    accept=" image/png, .jpeg, .jpg"/>

                <h3>Profesiones:</h3>
                <div>
                    <table className="tabla">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Rating</th>
                                <th>Núm. de Reseñas</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profesionEstado.map((profesion, index) => (
                                <tr key={profesion._id}>
                                    <td>{profesion.Nombre}</td>
                                    <td>{profesion.Rating}</td>
                                    <td>{profesion.TotalRatings}</td>
                                    <td>
                                        <Switch
                                            checked={profesion.Activa}
                                            onChange={(checked) => handleProfesionActivaChange(index, checked)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>


                    </table>
                </div>
                <br />
                <div className="row">

                <Select
                    isMulti
                    options={profesiones && profesiones.map((profesion) => ({
                        value: profesion.Nombre,
                        idCategoria: profesion.idCategoria,
                        IdProfesion: profesion._id,
                        label: profesion.Nombre,
                    }))}
                    value={selectedProfesiones}
                    onChange={handleProfesionesChange}
                />

                </div>
                <br />
                <h3>Datos:</h3>
                <h5 className="mb-3 text-start">
                    RUT:
                    <input
                        className="form-control"
                        type="text"
                        name="Rut"
                        id="rutInput"
                        value={proveedor?.Rut || ''}
                        onChange={handleInputChange}
                        required
                    />
                </h5>
                <div className='row'>
                    <h5 className="col mb-3 text-start">
                        Nombre:
                        <input
                            className="form-control"
                            type="text"
                            name="Nombre"
                            value={proveedor?.Nombre || ''}
                            id="nombreInput"
                            onChange={handleInputChange}
                            required


                        />
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Apellidos:
                        <input
                            className="form-control"
                            type="text"
                            name="Apellidos"
                            value={proveedor?.Apellidos || ''}
                            id="apellidosInput"
                            onChange={handleInputChange}
                            required

                        />
                    </h5>
                </div>
                <div className='row'>
                    <h5 className="col mb-3 text-start">
                        Género:
                        <select
                            className="form-select"
                            name="Genero"
                            value={proveedor?.Genero || ''}
                            id="generoInput"
                            onChange={handleInputChange}
                            required
                        >
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Número:
                        <input
                            className="form-control"
                            type="number"
                            name="Telefono"
                            value={proveedor?.Telefono || ''}
                            id="numeroTelefonicoInput"
                            onChange={handleInputChange}
                            required
                        />
                    </h5>
                </div>


                <div className="row align-items-center">
                    <div className="col-sm-6">
                        <h5 className="mb-3 text-start">
                            Correo:
                            <input
                                className="form-control"
                                type="text"
                                name="Correo"
                                value={proveedor?.Correo || ''}
                                id="correoInput"
                                onChange={handleInputChange}
                                required
                            />
                        </h5>
                    </div>
                    <div className="col-sm-6">
                        <h5 className="mb-3 text-start">
                            Fecha de Nacimiento:
                            <DatePicker
                                className='form-control'
                                type="date"
                                name="Fecha_Nacimiento"
                                selected={proveedor.Fecha_Nacimiento ? new Date(proveedor.Fecha_Nacimiento) : null}
                                onChange={handleDateChange}
                                dateFormat="dd/MM/yyyy"
                                maxDate={currentDate}
                                required
                            />
                        </h5>
                    </div>
                </div>

                <div className='row'>
                    <div className="col-sm-4 d-flex align-items-center">
                        <h5 className="col mb-3 text-start">
                            Estado:
                            <input
                                className="form-control"
                                type="text"
                                name="Estado"
                                value={proveedor.Estado ? "Activo" : "Inactivo"}
                                id="activoInput"
                                readOnly
                            />
                        </h5>
                    </div>
                    <div className="col-sm-2 d-flex align-items-center">
                        <Switch
                            id="estadoSwitch"
                            checked={proveedor.Estado || false}
                            onChange={EstadoProveedor}
                        />
                    </div>
                    <div className="col-sm-4 d-flex align-items-center">
                        <h5 className="col mb-3 text-start">
                            Revisión:
                            <input
                                className="form-control"
                                type="text"
                                name="Revisado"
                                value={proveedor.Revisado ? "Revisado" : "Sin revisar"}
                                id="revisadoInput"
                                readOnly
                            />
                        </h5>
                    </div>
                    <div className="col-sm-2 d-flex align-items-center">
                        <Switch
                            id="esSubscriptrSwitch"
                            checked={proveedor.Revisado || false}
                            onChange={EstadoRevisado}
                        />
                    </div>
                </div>
                <h3>Datos Bancarios</h3>
                <div>
                    <h5 className="mb-1 text-start">Banco:</h5>
                    <select
                        className="form-select"
                        type="text"
                        name="Banco"
                        value={proveedor?.Banco || ''}
                        id="bancoInput"
                        onChange={handleInputChange}
                    >
                        {bancos.map((banco) => (
                            <option key={banco.value} value={banco.value}>
                                {banco.value}
                            </option>
                        ))}
                    </select>

                </div>


                <div className='row'>

                    <h5 className="col mb-3 text-start">
                        RUT Cuenta:
                        <input
                            className="form-control"
                            type="text"
                            name="RutCuenta"
                            value={proveedor?.RutCuenta || ''}
                            id="rutCuentaInput"
                            onChange={handleInputChange}
                            required


                        />
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Tipo Cuenta:
                        <select
                            className="form-select"
                            type="text"
                            name="TipoCuenta"
                            value={proveedor?.TipoCuenta || ''}
                            id="tipoCuentaInput"
                            onChange={handleInputChange}
                        >
                            <option value="Cuenta Vista">Cuenta Vista</option>
                            <option value="Cuenta de Ahorro">Cuenta de Ahorro</option>
                            <option value="Cuenta Corriente">Cuenta Corriente</option>
                        </select>

                    </h5>

                </div>
                <div className='row'>
                    <h5 className="col mb-3 text-start">
                        Número de Cuenta:
                        <input
                            className="form-control"
                            type="text"
                            name="NumCuenta"
                            value={proveedor?.NumCuenta || ''}
                            id="numCuentaInput"
                            onChange={handleInputChange}
                            required


                        />
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Nombre Titular:
                        <input
                            className="form-control"
                            type="text"
                            name="TitularCuenta"
                            value={proveedor?.TitularCuenta || ''}
                            id="titularCuentaInput"
                            onChange={handleInputChange}
                            required

                        />
                    </h5>

                </div>


                <div className="row justify-content-center">
                    <div className="col-6">
                        <button className="btn btn-danger" onClick={handleDelete}>
                            BORRAR
                        </button>
                        <button type="submit" className="btn btn-primary">
                            MODIFICAR
                        </button>
                        <button className="btn btn-secondary" onClick={handleGoBack}>
                            VOLVER
                        </button>
                    </div>
                </div>
            </form >
        </div >
    );
};

export default ProveedorForm;