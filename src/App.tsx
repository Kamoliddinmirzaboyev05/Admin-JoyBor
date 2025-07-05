import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Payments from "./pages/Payments";
import Rooms from "./pages/Rooms";
import FloorDetail from "./pages/FloorDetail";
import { Toaster } from "sonner";
import StudentProfile from "./pages/StudentProfile";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";
import ApplicationDetail from "./pages/ApplicationDetail";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";

function RequireAuth() {
  const isAuth = localStorage.getItem('isAuth') === 'true';
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route element={<RequireAuth />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="payments" element={<Payments />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="rooms/:floorId" element={<FloorDetail />} />
          <Route path="applications" element={<Applications />} />
          <Route path="application/:id" element={<ApplicationDetail />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:studentId" element={<StudentProfile />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
