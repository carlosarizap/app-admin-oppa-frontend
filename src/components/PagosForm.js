import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import { URL_BACKEND } from "../App";

const PagosForm = () =>{
    const navigate = useNavigate();
    const { id: solicitudId } = useParams();
    const [proveedor, setProveedor] = useState({});
    const [solicitud, setSolicitud] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const solicitudResponse = await fetch(`${URL_BACKEND}/api/solicitud/BuacarSolicitudPorId/${solicitudId}`).then((response) =>response.json());
            const proveedorResponse = await fetch(`${URL_BACKEND}/api/proveedores/${solicitudResponse.IdProveedor}`).then((response) =>response.json());
            setSolicitud(solicitudResponse);
            setProveedor(proveedorResponse);
        } catch (error) {
            
        }
    }

    const EstadoRevisado = (checked) =>{
        setSolicitud((prevSolicitud) => ({
            ...prevSolicitud,
            PagadoPorOppa: checked

        }));

    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const respuesta = await fetch(`${URL_BACKEND}/api/solicitud/${solicitudId}`, {
            method:'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(solicitud),
        });
        console.log(respuesta.json)
        
        navigate('/pagos');
    };

        //FUNCION PARA REGRESAR A LA PAGINA ANTERIOR
    const handleGoBack = () => {
        navigate('/pagos'); 
    };

    return (
        <div className="container mt-4">
            <h1 className="text-center">Realizar Pago</h1>
            <form className="d-flex flex-column col-5 mx-auto" onSubmit={handleSubmit}>
                <h3>Proveedor</h3>
                <div >
                    <h5 className="col mb-3 text-start">
                        Nombre: {proveedor.Nombre} {/* Mostrar el nombre del proveedor */}
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Apellido: {proveedor.Apellidos} {/* Mostrar el apellido del proveedor */}
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Rut: {proveedor.Rut} {/* Mostrar el Rut del proveedor */}
                    </h5>
                </div>

                <h3>Datos Bancarios</h3>
                <div >
                    <h5 className="col mb-3 text-start">
                        Banco: {proveedor.Banco} {/* Mostrar el banco del proveedor */}
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Tipo de Cuenta: {proveedor.TipoCuenta} {/* Mostrar el tipo de cuenta del proveedor */}
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Número de Cuenta: {proveedor.NumCuenta} {/* Mostrar el número de cuenta del proveedor */}
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Rut de Cuenta: {proveedor.RutCuenta} {/* Mostrar el número de cuenta del proveedor */}
                    </h5>
                    <h5 className="col mb-3 text-start">
                        Titular de la Cuenta: {proveedor.TitularCuenta} {/* Mostrar el titular de la cuenta del proveedor */}
                    </h5>
                </div>

                <h3>Datos de Solicitud</h3>
                <h5>Nombre del Servicio: {solicitud.NombreServicio}</h5>
                <h5>Precio: ${solicitud.Precio}</h5>
                <h3>Estado de Pago</h3>
                <div className="col-sm-3 d-flex align-items-center">
                    <h5 className="col mb-3 text-start">
                        <input
                            className="form-control"
                            type="text"
                            name="Revisado"
                            value={solicitud.PagadoPorOppa ? "Pagado" : "No Pagado"}
                            id="revisadoInput"
                            readOnly
                        />
                    </h5>
                    <div className="col-sm-1 d-flex align-items-center ms-2">
                        <Switch
                            id="esSubscriptrSwitch"
                            checked={solicitud.PagadoPorOppa || false}
                            onChange={EstadoRevisado}
                        />
                    </div>
                </div>
                    
                <div className="col-6">
                    <button type="submit" className="btn btn-primary">
                        ACTUALIZAR
                    </button>
                    
                </div>
            </form>
            <div className="col-8 text-center">
            <button className="btn btn-secondary" onClick={handleGoBack}>
                        VOLVER
            </button>
            </div>
            
        </div>
    );
};

export default PagosForm;