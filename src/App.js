import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard';
import Servicios from './components/Servicios'
import ServicioForm from './components/ServicioForm'
import Categorias from './components/Categorias'
import CategoriaForm from './components/CategoriaForm'
import Clientes from './components/Clientes'
import ClienteForm from './components/ClienteForm'
import ApoderadoForm from './components/ApoderadoForm'
import Parametros from './components/Parametros'
import RegionForm from './components/RegionForm'
import Ayuda from './components/Ayuda'
import Profesiones from './components/Profesiones'
import ProfesionForm from './components/ProfesionForm'
import Proveedores from './components/Proveedores'
import ProveedorForm from './components/ProveedorForm'
import Packs from './components/Packs'
import PackForm from './components/PackForm'

export const URL_BACKEND = process.env.REACT_APP_SERVER_URL;
const App = () => {
  return (
    <Router>
      <Navigation />

      <div className="container p-4">
        <Routes>
          <Route path="/dashboard" Component={Dashboard} />
          <Route path="/servicios" Component={Servicios} />
          <Route path="/servicios/:id" Component={ServicioForm} />
          <Route path="/categorias" Component={Categorias} />
          <Route path="/categorias/:id" Component={CategoriaForm} />
          <Route path="/clientes/" Component={Clientes} />
          <Route path="/clientes/:id" Component={ClienteForm} />
          <Route path="/apoderados/:id" Component={ApoderadoForm} />
          <Route path="/parametros/" Component={Parametros} />
          <Route path="/parametros/region/:id" Component={RegionForm} />
          <Route path="/ayuda" Component={Ayuda} />
          <Route path="/profesiones" Component={Profesiones} />
          <Route path="/profesiones/:id" Component={ProfesionForm} />
          <Route path="/proveedores" Component={Proveedores} />
          <Route path="/proveedores/:id" Component={ProveedorForm} />
          <Route path="/packs" Component={Packs} />
          <Route path="/packs/:id" Component={PackForm} />
        </Routes>
      </div>
    </Router>

  );
};


export default App