import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import logoOppa from '../images/logo-oppa-2.png'

export default class Navigation extends Component {
    render() {
        return (
            <nav className="navbar navbar-expand-lg">
                <div className='container'>

                    <Link className='navbar-brand' to="/">
                        <img src={logoOppa} alt="Example" style={{ width: '200px', height: 'auto' }} />
                    </Link>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item active">
                                <Link className='nav-link fw-bold' to="/">Inicio</Link>
                            </li>
                            <li className="nav-item active fw-bold">
                                <Link className='nav-link' to="/servicios">Servicios</Link>
                            </li>
                            <li className="nav-item active fw-bold">
                                <Link className='nav-link' to="/packs">Packs</Link>
                            </li>
                            <li className="nav-item active fw-bold">
                                <Link className='nav-link' to="/categorias">Categorías</Link>
                            </li>
                            <li className="nav-item active fw-bold">
                                <Link className='nav-link' to="/profesiones">Profesiones</Link>
                            </li>
                            <li className="nav-item active fw-bold">
                                <Link className='nav-link' to="/clientes">Clientes</Link>
                            </li>
                            <li className="nav-item active fw-bold">
                                <Link className='nav-link' to="/proveedores">Proveedores</Link>
                            </li>
                            <li className="nav-item active fw-bold">
                                <Link className='nav-link' to="/parametros">Parámetros</Link>
                            </li>
                            <li className="nav-item active fw-bold">
                                <Link className='nav-link' to="/ayuda">Ayuda</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        )
    }
}
