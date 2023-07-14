import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Switch } from 'antd';
import { URL_BACKEND } from "../App";

const CategoriaForm = () => {
    const navigate = useNavigate();
    const { id: categoriaId } = useParams();
    const [categoria, setCategoria] = useState({});
    const [superCategorias, setSuperCategorias] = useState([]);

    const nombre = categoria?.Nombre ?? '';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [categoriaResponse, superCategoriasResponse] = await Promise.all([
                fetch(`${URL_BACKEND}/api/categorias/${categoriaId}`).then((response) => response.json()),
                fetch(`${URL_BACKEND}/api/superCategorias/`).then((response) => response.json())
            ]);

            setCategoria(categoriaResponse);
            setSuperCategorias(superCategoriasResponse);
        } catch (error) {
            console.error('Error fetching categoria:', error);
        }
    };

    const isCreating = categoriaId === 'crear';
    const headerText = isCreating ? 'Crear Categoría' : 'Modificar Categoría';

    if (categoria === null && !isCreating) {
        return <div>Loading...</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nombre) {
            alert('Rellena todos los campos.');
            return;
        }

        console.log(categoria);

        try {
            const url = isCreating ? `${URL_BACKEND}/api/categorias` : `${URL_BACKEND}/api/categorias/${categoriaId}`;
            const method = isCreating ? 'POST' : 'PUT';
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoria)
            });
            const data = await response.json();

            // Do something with the response data, such as displaying a success message
            navigate(`/categorias`);
            console.log('Form submitted successfully:', data);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;

        let inputValue = value;

        setCategoria((prevCategoria) => ({
            ...prevCategoria,
            [name]: inputValue
        }));
    };

    const handleDelete = async () => {

        const confirmed = window.confirm('Estas seguro de que quieres borrar esta Categoría?');
        if (!confirmed) {
          return;
        }
    
        try {
          const url = `${URL_BACKEND}/api/categorias/${categoriaId}`;
          const response = await fetch(url, {
            method: 'DELETE',
          });
          const data = await response.json();
          navigate(`/categorias`);
          console.log('Categoria deleted successfully:', data);
    
        } catch (error) {
          console.error('Error deleting Categoria:', error);
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
                        value={categoria?.Nombre || ''}
                        onChange={handleInputChange}
                    />
                </h5>
                <h5 className="mb-3 text-start">
                    Super Categoría:
                    <select
                        className="form-select"
                        name="idSuperCategoria"
                        value={categoria?.idSuperCategoria || ''}
                        onChange={handleInputChange}
                    >
                        <option value="">Seleccione una super categoría...</option>
                        {superCategorias.map((superCategoria) => (
                            <option key={superCategoria._id} value={superCategoria._id}>
                                {superCategoria.Nombre}
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

export default CategoriaForm;
