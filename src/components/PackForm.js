import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { URL_BACKEND } from "../App";

const PackForm = () => {
  const navigate = useNavigate();
  const { id: packId } = useParams();
  const [pack, setPack] = useState({});
  const [servicios, setServicios] = useState([]);
  const [selectedServicios, setSelectedServicios] = useState([]);

  const nombre = pack?.Nombre ?? '';
  const descripcion = pack?.Descripcion ?? '';
  const foto = pack?.Foto ?? '';
  const precio = pack?.Precio ?? '';
  const usos = pack?.Usos ?? '';
  const tope = pack?.Tope ?? '';
  const fechaDesde = pack?.FechaDesde ?? '';
  const fechaHasta = pack?.FechaHasta ?? '';
  const idServicios = pack?.IdServicios ?? [];
  const estado = pack?.Estado || false;

  useEffect(() => {
    const fetchPack = async () => {
      try {
        const response = await fetch(`${URL_BACKEND}/api/packs/${packId}`);
        const data = await response.json();
        setPack(data);
        setSelectedServicios(data.IdServicios)
      } catch (error) {
        console.error('Error fetching pack:', error);
      }
    };

    const fetchServicios = async () => {
      try {
        const response = await fetch(`${URL_BACKEND}/api/servicios/`);
        const data = await response.json();
        setServicios(data);
      } catch (error) {
        console.error('Error fetching servicios:', error);
      }
    };

    if (packId) {
      fetchPack();
    }

    fetchServicios();
  }, [packId]);

  const isCreating = packId === 'crear';
  const headerText = isCreating ? 'Crear Pack' : 'Modificar Pack';

  if (pack === null && !isCreating) {
    return <div>Loading...</div>;
  }

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    let inputValue = value;
    if (type === 'number') {
      const parsedValue = parseFloat(value);
      inputValue = isNaN(parsedValue) || parsedValue < 0 ? '' : parsedValue;
    }

    if (inputValue === 0) {
      inputValue = '0';
    }

    inputValue = type === 'checkbox' ? checked : inputValue;

    setPack((prevPack) => ({
      ...prevPack,
      [name]: inputValue,
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!estado) {
      pack.Estado = false;
    }
  
    if (!nombre || !descripcion || !foto || !precio) {
      alert('Rellena todos los campos.');
      return;
    }
  
    // Add the selected servicios to the pack object
    pack.IdServicios = selectedServicios;
  
    try {
      const url = isCreating ? `${URL_BACKEND}/api/packs` : `${URL_BACKEND}/api/packs/${packId}`;
      const method = isCreating ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pack)
      });
      const data = await response.json();
  
      // Do something with the response data, such as displaying a success message
      navigate(`/packs`);
      console.log('Form submitted successfully:', data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
  

  const handleDelete = async () => {

    const confirmed = window.confirm('Estas seguro de que quieres borrar este Pack?');
    if (!confirmed) {
      return;
    }

    try {
      const url = `${URL_BACKEND}/api/packs/${packId}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });
      const data = await response.json();
      navigate(`/packs`);
      console.log('Pack deleted successfully:', data);

    } catch (error) {
      console.error('Error deleting pack:', error);
    }
  };

  const handleFechaDesdeChange = (date) => {
    setPack((prevPack) => ({
      ...prevPack,
      FechaDesde: date,
    }));
  };
  const handleFechaHastaChange = (date) => {
    setPack((prevPack) => ({
      ...prevPack,
      FechaHasta: date,
    }));
  };

  const handleServiciosChange = (selectedOptions) => {
    const selectedIds = selectedOptions.map((option) => option.value);
    setSelectedServicios(selectedIds);
  };


  return (
    <div className="text-center">
      <h1>{headerText}</h1>
      <form className="d-flex flex-column col-6 mx-auto" onSubmit={handleSubmit}>
        <h5 className="mb-3 text-start">
          Título:
          <input
            className="form-control"
            type="text"
            name="Nombre"
            value={pack?.Nombre || ''}
            onChange={handleInputChange}
          />
        </h5>
        <h5 className="mb-3 text-start">
          Descripción:
          <textarea
            className="form-control"
            rows="5"
            name="Descripcion"
            value={pack?.Descripcion || ''}
            onChange={handleInputChange}
          />
        </h5>

        <h5 className="mb-3 text-start">
          Imagen:
          <input
            className="form-control"
            type="text"
            name="Foto"
            value={pack?.Foto || ''}
            onChange={handleInputChange}
          />
        </h5>
        <div className="row">
          <h5 className="col-sm-6 mb-3 text-start">
            Precio:
            <input
              className="form-control"
              type="number"
              name="Precio"
              value={pack?.Precio || ''}
              onChange={handleInputChange}
            />
          </h5>
          <h5 className="col mb-3 text-start">
            Estado:
            <input
              readOnly
              className="form-control"
              type="text"
              name="Estado"
              value={pack?.Estado ? 'Visible' : 'No visible'}
              onChange={handleInputChange}
            />
          </h5>
          <div className="col-sm-2 d-flex align-items-center">
            <Switch
              checked={pack?.Estado || false}
              name="Estado"
              onChange={(checked) =>
                handleInputChange({
                  target: { name: 'Estado', checked, type: 'checkbox' },
                })
              }
            />
          </div>
        </div>


        <div className="row align-items-center">
          <div className="col-sm-6">
            <h5 className="mb-3 text-start">
              Fecha Desde:
              <DatePicker
                className='form-control'
                type="date"
                name="FechaDesde"
                selected={pack?.FechaDesde ? new Date(pack?.FechaDesde) : null}
                onChange={handleFechaDesdeChange}
                dateFormat="dd/MM/yyyy"
                maxDate={pack?.FechaHasta}
                required
              />
            </h5>
          </div>

          <div className="col-sm-4 d-flex align-items-center">

            <h5 className="mb-3 text-start">
              Fecha Hasta:
              <DatePicker
                className='form-control'
                type="date"
                name="FechaHasta"
                selected={pack?.FechaHasta ? new Date(pack?.FechaHasta) : null}
                onChange={handleFechaHastaChange}
                dateFormat="dd/MM/yyyy"
                minDate={pack?.FechaDesde}
                required
              />
            </h5>
          </div>

        </div>
        <div className="row">
          <h5 className="col-sm-6 mb-3 text-start">
            Usos:
            <input
              className="form-control"
              type="number"
              name="Usos"
              value={pack?.Usos || ''}
              onChange={handleInputChange}
            />
          </h5>
          <h5 className="col-sm-6 mb-3 text-start">
            Tope:
            <input
              className="form-control"
              type="number"
              name="Tope"
              value={pack?.Tope || ''}
              onChange={handleInputChange}
            />
          </h5>

        </div>
        <div className="row">

          <Select
            isMulti
            options={servicios.map((servicio) => ({
              value: servicio._id,
              label: servicio?.Nombre
            }))}
            onChange={handleServiciosChange}
            value={selectedServicios
              .map((servicioId) => ({
                value: servicioId,
                label: servicios.find((servicio) => servicio._id === servicioId)?.Nombre
              }))}
          />


        </div>
        <div className="row justify-content-center">
          <div className="col-6">
            {!isCreating && (
              <button className="btn btn-danger" onClick={handleDelete}>
                BORRAR
              </button>
            )}
            <button className="btn btn-primary" type="submit">
              {isCreating ? 'CREAR' : 'MODIFICAR'}
            </button>
          </div>
        </div>
      </form>

    </div>
  );
};

export default PackForm;