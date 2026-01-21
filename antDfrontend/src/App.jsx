import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { App as AntApp } from 'antd';
import HomePage from './components/HomePage';
import ViewEmployees from './components/ViewEmployees';
import ViewRoles from './components/ViewRoles';
import UpdateEmployee from './components/UpdateEmployee';
import './index.css';

function App() {
  return (
    <AntApp>
      <Router>
        <div className="app-wrapper">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/employees" element={<ViewEmployees />} />
            <Route path="/roles" element={<ViewRoles />} />
            <Route path="/employees/update/:id" element={<UpdateEmployee />} />
          </Routes>
        </div>
      </Router>
    </AntApp>
  );
}

export default App;