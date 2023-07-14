import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import { URL_BACKEND } from "../App";

const ProfesionForm = () => {
    const navigate = useNavigate();
    const { id: profesionId } = useParams();
    const [profesion, setProfesion] = useState({});
    const [categorias, setCategorias] = useState([]);

    const nombre = profesion?.Nombre ?? '';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profesionResponse, categoriasResponse] = await Promise.all([
                fetch(`${URL_BACKEND}/api/profesiones/${profesionId}`).then((response) => response.json()),
                fetch(`${URL_BACKEND}/api/categorias/`).then((response) => response.json())
            ]);

            setProfesion(profesionResponse);
            setCategorias(categoriasResponse);
        } catch (error) {
            console.error('Error fetching profesion:', error);
        }
    };

    const isCreating = profesionId === 'crear';
    const headerText = isCreating ? 'Crear Profesión' : 'Modificar Profesión';

    if (profesion === null && !isCreating) {
        return <div>Loading...</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombre) {
            alert('Rellena todos los campos.');
            return;
        }

        console.log(profesion);

        try {
            const url = isCreating ? `${URL_BACKEND}/api/profesiones` : `${URL_BACKEND}/api/profesiones/${profesionId}`;
            const method = isCreating ? 'POST' : 'PUT';
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profesion)
            });
            const data = await response.json();

            // Do something with the response data, such as displaying a success message
            navigate(`/profesiones`);
            console.log('Form submitted successfully:', data);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;

        let inputValue = value;

        setProfesion((prevProfesion) => ({
            ...prevProfesion,
            [name]: inputValue
        }));
    };

    const handleDelete = async () => {

        const confirmed = window.confirm('Estas seguro de que quieres borrar esta Profesión?');
        if (!confirmed) {
          return;
        }
    
        try {
          const url = `${URL_BACKEND}/api/profesiones/${profesionId}`;
          const response = await fetch(url, {
            method: 'DELETE',
          });
          const data = await response.json();
          navigate(`/profesiones`);
          console.log('Profesion deleted successfully:', data);
    
        } catch (error) {
          console.error('Error deleting Profesion:', error);
        }
      };

    return (
        <div className="text-center">
            <h1>{headerText}</h1>
            <form className="d-flex flex-column col-6 mx-auto" onSubmit={handleSubmit}>
                <h5 className="mb-3 text-start">
                    Nombre:
                    <input
                        className="form-control"
                        type="text"
                        name="Nombre"
                        value={profesion?.Nombre || ''}
                        onChange={handleInputChange}
                    />
                </h5>
                <h5 className="mb-3 text-start">
                    Categoría:
                    <select
                        className="form-select"
                        name="idCategoria"
                        value={profesion?.idCategoria || ''}
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

export default ProfesionForm;
