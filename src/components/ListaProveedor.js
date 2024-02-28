import React, { useEffect, useState } from 'react';
import { URL_BACKEND } from "../App";
import Modal from 'react-modal';

const ListaProveedorModal = ({ isOpen, closeModal, handleSelectProveedor }) => {
    const [proveedores, setProveedores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProveedor, setSelectedProveedor] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    //Esta funcion se usa cuando se inicializa.
    useEffect(() => {

        fetchData();
        
    },[]);

    const fetchData = async () => {
        try{

            const proveedorResponse = await fetch(`${URL_BACKEND}/api/proveedores`).then((response) => response.json());;
            setProveedores(proveedorResponse);
            setIsLoading(false);
        }
        catch(error){
            setIsLoading(false);
            console.log("Error al obtener los proveedores");
        }
    };

    const handleCheckboxChange = (event, proveedor) => {
        setSelectedProveedor(proveedor);
      };
    
      const handleSelectButtonClick = () => {
        handleSelectProveedor(selectedProveedor);
        closeModal();
      };

      

      const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
      };

      let filteredProveedores = proveedores.filter((proveedor) =>
        (proveedor.Rut.includes(searchQuery.toUpperCase()) || proveedor.Nombre.includes(searchQuery.toUpperCase()) || proveedor.Apellidos.includes(searchQuery.toUpperCase()))
    );


    return (
        <Modal isOpen={isOpen} onRequestClose={closeModal} contentLabel="Lista de Proveedores">
          <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css' />
          <h2 className='text-center'>Lista de Proveedores</h2>
          <div className="form-group has-search">
            <span className="fa fa-search form-control-feedback"></span>
             <input 
              type="text"
              className="form-control"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar por Nombre o RUT..."
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
          {isLoading ? (
            <div>Cargando...</div>
          ) : (
            <div className="tabla-container">
              <table className="tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Rut</th>
                  <th>Teléfono</th>
                  <th>Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {filteredProveedores.map(proveedor => (
                  <tr key={proveedor._id}>
                    <td>{proveedor.Nombre} {proveedor.Apellidos}</td>
                    <td>{proveedor.Rut}</td>
                    <td>{proveedor.Telefono}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProveedor === proveedor}
                        onChange={event => handleCheckboxChange(event, proveedor)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
        </table>

            </div>
            
      )}
      <div className='d-flex justify-content-center'>
        <button className='btn btn-info me-2' onClick={handleSelectButtonClick} disabled={!selectedProveedor}>
          Aceptar
        </button>
        <button className='btn btn-danger me-2' onClick={closeModal}>
          Cerrar
        </button>
      </div>
      
    </Modal>
    );
};

export default ListaProveedorModal;
