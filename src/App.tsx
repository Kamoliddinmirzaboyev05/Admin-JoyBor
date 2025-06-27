import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Payments from './pages/Payments';
import Rooms from './pages/Rooms';
import FloorDetail from './pages/FloorDetail';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="payments" element={<Payments />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="rooms/:floorId" element={<FloorDetail />} />
          <Route path="applications" element={<div className="p-8 text-center text-gray-500">Arizalar sahifasi tez orada...</div>} />
          <Route path="reports" element={<div className="p-8 text-center text-gray-500">Hisobotlar sahifasi tez orada...</div>} />
          <Route path="settings" element={<div className="p-8 text-center text-gray-500">Sozlamalar sahifasi tez orada...</div>} />
          <Route path="profile" element={<div className="p-8 text-center text-gray-500">Profil sahifasi tez orada...</div>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;