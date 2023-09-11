import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import DatePicker from 'react-datepicker';
import { URL_BACKEND } from "../App";

const ServicioForm = () => {
  const navigate = useNavigate();
  const { id: servicioId } = useParams();
  const [servicio, setServicio] = useState({});
  const [categorias, setCategorias] = useState([]);

  const nombre = servicio?.Nombre ?? '';
  const descripcion = servicio?.Descripcion ?? '';
  const idCategoria = servicio?.idCategoria ?? '';
  const foto = servicio?.Foto ?? '';
  const precio = servicio?.Precio ?? '';
  const estado = servicio?.Estado || false;
  const comision = servicio?.Comision ?? '';
  const descuento = servicio?.Descuento ?? '';
  const tieneDescuento = servicio?.TieneDescuento || false;

  useEffect(() => {
    const fetchServicio = async () => {
      try {
        const response = await fetch(`${URL_BACKEND}/api/servicios/${servicioId}`);
        const data = await response.json();
        setServicio(data);
      } catch (error) {
        console.error('Error fetching servicio:', error);
      }
    };

    const fetchCategorias = async () => {
      try {
        const response = await fetch(`${URL_BACKEND}/api/categorias`);
        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error('Error fetching categorias:', error);
      }
    };

    if (servicioId) {
      fetchServicio();
    }

    fetchCategorias();
  }, [servicioId]);

  const isCreating = servicioId === 'crear';
  const headerText = isCreating ? 'Crear Servicio' : 'Modificar Servicio';

  if (servicio === null && !isCreating) {
    return <div>Loading...</div>;
  }

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    let inputValue = value;
    if (type === 'number') {
      const parsedValue = parseFloat(value);
      inputValue = isNaN(parsedValue) || parsedValue < 0 ? '' : parsedValue;
    }


    if (name === 'Descuento' || name === 'Comision') {
      const parsedValue = parseFloat(inputValue);
      if (isNaN(parsedValue) || parsedValue < 0 || parsedValue >= 1) {
        inputValue = '';

      } else {
        inputValue = parsedValue;

      }
    }

    if (inputValue === 0) {
      inputValue = '0';
    }

    inputValue = type === 'checkbox' ? checked : inputValue;

    setServicio((prevServicio) => ({
      ...prevServicio,
      [name]: inputValue,
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!descuento) {
      servicio.Descuento = 0;
    }

    if (!estado) {
      servicio.Estado = false;
    }

    if (!tieneDescuento) {
      servicio.TieneDescuento = false;
    }

    if (!nombre || !descripcion || !idCategoria || !foto || !precio || !comision) {
      alert('Rellena todos los campos.');
      return;
    }

    console.log(servicio)

    try {
      const url = isCreating ? `${URL_BACKEND}/api/servicios` : `${URL_BACKEND}/api/servicios/${servicioId}`;
      const method = isCreating ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(servicio)
      });
      const data = await response.json();

      // Do something with the response data, such as displaying a success message
      navigate(`/servicios`);
      console.log('Form submitted successfully:', data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async () => {

    const confirmed = window.confirm('Estas seguro de que quieres borrar este Servicio?');
    if (!confirmed) {
      return;
    }

    try {
      const url = `${URL_BACKEND}/api/servicios/${servicioId}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });
      const data = await response.json();
      navigate(`/servicios`);
      console.log('Servicio deleted successfully:', data);

    } catch (error) {
      console.error('Error deleting servicio:', error);
    }
  };

  const handleFechaDesdeChange = (date) => {
    setServicio((prevServicio) => ({
      ...prevServicio,
      FechaDesde: date,
    }));
  };
  const handleFechaHastaChange = (date) => {
    setServicio((prevServicio) => ({
      ...prevServicio,
      FechaHasta: date,
    }));
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
            value={servicio?.Nombre || ''}
            onChange={handleInputChange}
          />
        </h5>
        <h5 className="mb-3 text-start">
          Descripción:
          <textarea
            className="form-control"
            rows="5"
            name="Descripcion"
            value={servicio?.Descripcion || ''}
            onChange={handleInputChange}
          />
        </h5>

        <h5 className="mb-3 text-start">
          Categoría:
          <select
            className="form-select"
            name="idCategoria"
            value={servicio?.idCategoria || ''}
            onChange={handleInputChange}
          >
            <option value="">Seleccione una categoría...</option>
            {categorias.map((categoria) => (
              <option key={categoria._id} value={categoria._id}>
                {categoria.Nombre}
              </option>
            ))}
          </select>
        </h5>

        <h5 className="mb-3 text-start">
          Imagen:
          <input
            className="form-control"
            type="text"
            name="Foto"
            value={servicio?.Foto || ''}
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
              value={servicio?.Precio || ''}
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
              value={servicio?.Estado ? 'Visible' : 'No visible'}
              onChange={handleInputChange}
            />
          </h5>
          <div className="col-sm-2 d-flex align-items-center">
            <Switch
              checked={servicio?.Estado || false}
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
            <h5 className="text-start">
              Comisión:
              <input
                className="form-control"
                type="number"
                name="Comision"
                value={servicio?.Comision || ''}
                onChange={handleInputChange}
              />
            </h5>
          </div>

          <div className="col-sm-4 d-flex align-items-center">

            <h5 className="text-start">
              Descuento:
              <input
                className="form-control"
                type="number"
                name="Descuento"
                value={servicio?.Descuento || ''}
                onChange={handleInputChange}
              />
            </h5>
          </div>
          <div className="col-sm-2 d-flex align-items-center">
            <Switch
              checked={servicio?.TieneDescuento || false}
              name="TieneDescuento"
              onChange={(checked) =>
                handleInputChange({
                  target: { name: 'TieneDescuento', checked, type: 'checkbox' },
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
                selected={servicio?.FechaDesde ? new Date(servicio.FechaDesde) : null}
                onChange={handleFechaDesdeChange}
                dateFormat="dd/MM/yyyy"
                maxDate={servicio?.FechaHasta} // Use optional chaining here as well
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
                selected={servicio?.FechaHasta ? new Date(servicio.FechaHasta) : null}
                onChange={handleFechaHastaChange}
                dateFormat="dd/MM/yyyy"
                minDate={servicio?.FechaDesde} // Use optional chaining here as well
                required
              />

            </h5>
          </div>

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

export default ServicioForm;