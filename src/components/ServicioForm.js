import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import DatePicker from 'react-datepicker';
import { URL_BACKEND } from "../App";

const ServicioForm = () => {
  const navigate = useNavigate();
  const { id: servicioId } = useParams();
  const [servicio, setServicio] = useState({
    Nombre: '',
    Descripcion: '',
    idCategoria: '',
    Foto: '',
    Precio: '',
    Estado: false,
    Comision: '',
    Descuento: '',
    TieneDescuento: false,
  });
  const [categorias, setCategorias] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const isCreating = servicioId === 'crear'; // Define isCreating here

  // Combined fetchData function to avoid useEffect missing dependency warning
  const fetchData = async () => {
    if (!isCreating) {
      try {
        const response = await fetch(`${URL_BACKEND}/api/servicios/${servicioId}`);
        const data = await response.json();
        setServicio(data);
      } catch (error) {
        console.error('Error fetching servicio:', error);
      }
    }

    try {
      const response = await fetch(`${URL_BACKEND}/api/categorias`);
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [servicioId]); // Add servicioId to the dependency array

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    let inputValue = value;
    if (type === 'number') {
      const parsedValue = parseFloat(value);
      inputValue = isNaN(parsedValue) || parsedValue < 0 ? '' : parsedValue;
    }

    if (type === 'checkbox') {
      inputValue = checked;
    }

    setServicio((prevServicio) => ({
      ...prevServicio,
      [name]: inputValue,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Store the selected file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = servicio.Foto;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const imageResponse = await fetch(`${URL_BACKEND}/api/cloudinary/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!imageResponse.ok) {
          throw new Error('Error uploading the image');
        }

        const imageData = await imageResponse.json();
        imageUrl = imageData.url;
      }

      const updatedServicio = {
        ...servicio,
        Foto: imageUrl,
      };

      const url = isCreating
        ? `${URL_BACKEND}/api/servicios`
        : `${URL_BACKEND}/api/servicios/${servicioId}`;

      const method = isCreating ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedServicio),
      });

      if (!response.ok) {
        throw new Error('Error submitting form');
      }

      navigate(`/servicios`);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Estas seguro de que quieres borrar este Servicio?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${URL_BACKEND}/api/servicios/${servicioId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error deleting servicio');
      
      navigate(`/servicios`);
    } catch (error) {
      console.error('Error deleting servicio:', error);
      alert(error.message);
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
      <h1>{isCreating ? 'Crear Servicio' : 'Modificar Servicio'}</h1>
      <form className="d-flex flex-column col-6 mx-auto" onSubmit={handleSubmit}>
        <h5 className="mb-3 text-start">
          Título:
          <input
            className="form-control"
            type="text"
            name="Nombre"
            value={servicio.Nombre}
            onChange={handleInputChange}
          />
        </h5>
        <h5 className="mb-3 text-start">
          Descripción:
          <textarea
            className="form-control"
            rows="5"
            name="Descripcion"
            value={servicio.Descripcion}
            onChange={handleInputChange}
          />
        </h5>

        <h5 className="mb-3 text-start">
          Categoría:
          <select
            className="form-select"
            name="idCategoria"
            value={servicio.idCategoria}
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
            type="file"
            accept="image/*"
            name="Foto"
            onChange={handleFileChange}
          />
        </h5>

        <div className="row">
          <h5 className="col-sm-6 mb-3 text-start">
            Precio:
            <input
              className="form-control"
              type="number"
              name="Precio"
              value={servicio.Precio}
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
              value={servicio.Estado ? 'Visible' : 'No visible'}
            />
          </h5>
          <div className="col-sm-2 d-flex align-items-center">
            <Switch
              checked={servicio.Estado}
              name="Estado"
              onChange={(checked) =>
                handleInputChange({ target: { name: 'Estado', checked, type: 'checkbox' } })
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
                value={servicio.Comision}
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
                value={servicio.Descuento}
                onChange={handleInputChange}
              />
            </h5>
          </div>
          <div className="col-sm-2 d-flex align-items-center">
            <Switch
              checked={servicio.TieneDescuento}
              name="TieneDescuento"
              onChange={(checked) =>
                handleInputChange({ target: { name: 'TieneDescuento', checked, type: 'checkbox' } })
              }
            />
          </div>
        </div>

        <div className="row align-items-center">
          <h5 className="col-sm-6 mb-3 text-start">
            Duración (min.):
            <input
              className="form-control"
              type="number"
              name="DuracionMinutos"
              value={servicio.DuracionMinutos || ''}
              onChange={handleInputChange}
            />
          </h5>

          <div className="col-sm-4 d-flex align-items-center">
            <h5 className="mb-3 text-start">
              Fecha Desde:
              <DatePicker
                className="form-control"
                selected={servicio.FechaDesde ? new Date(servicio.FechaDesde) : null}
                onChange={handleFechaDesdeChange}
                dateFormat="dd/MM/yyyy"
                maxDate={servicio.FechaHasta}
              />
            </h5>
          </div>
        </div>

        <div className="col-sm-6">
          <h5 className="mb-3 text-start">
            Fecha Hasta:
            <DatePicker
              className="form-control"
              selected={servicio.FechaHasta ? new Date(servicio.FechaHasta) : null}
              onChange={handleFechaHastaChange}
              dateFormat="dd/MM/yyyy"
              minDate={servicio.FechaDesde}
            />
          </h5>
        </div>

        <div className="row justify-content-center">
          <div className="col-6">
            {!isCreating && (
              <button className="btn btn-danger" type="button" onClick={handleDelete}>
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
