import React, { Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from "./components/Layout/Layout";
import { Toaster } from "sonner";
import SEOHead from "./components/SEO/SEOHead";

// Lazy loading komponentlar
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Students = React.lazy(() => import("./pages/Students"));
const Payments = React.lazy(() => import("./pages/Payments"));
const Rooms = React.lazy(() => import("./pages/Rooms"));
const FloorDetail = React.lazy(() => import("./pages/FloorDetail"));
const StudentProfile = React.lazy(() => import("./pages/StudentProfile"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Applications = React.lazy(() => import("./pages/Applications"));
const ApplicationDetail = React.lazy(() => import("./pages/ApplicationDetail"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Reports = React.lazy(() => import("./pages/Reports"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Loading komponenti
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 daqiqa cache - sahifalar o'rtasida o'tishda qayta yuklash bo'lmasligi uchun
      gcTime: 1000 * 60 * 30, // 30 daqiqa cache - ma'lumotlar xotirajada saqlanadi
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Sahifa ochilganda qayta yuklash bo'lmasligi uchun
      refetchOnReconnect: true, // Internet qayta ulanganda yuklash
    },
  },
});

function RequireAuth() {
  const isAuth = localStorage.getItem('isAuth') === 'true';
  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SEOHead />
      <Toaster position="top-center" />
      <Routes>
        <Route element={<RequireAuth />}>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          } />
          <Route path="students" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Students />
            </Suspense>
          } />
          <Route path="payments" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Payments />
            </Suspense>
          } />
          <Route path="rooms" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Rooms />
            </Suspense>
          } />
          <Route path="rooms/:floorId" element={
            <Suspense fallback={<LoadingSpinner />}>
              <FloorDetail />
            </Suspense>
          } />
          <Route path="applications" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Applications />
            </Suspense>
          } />
          <Route path="application/:id" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ApplicationDetail />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Settings />
            </Suspense>
          } />
          <Route path="reports" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Reports />
            </Suspense>
          } />
          <Route path="profile" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Profile />
            </Suspense>
          } />
          <Route path="studentprofile/:studentId" element={
            <Suspense fallback={<LoadingSpinner />}>
              <StudentProfile />
            </Suspense>
          } />
          {/* 404 Not Found route */}
          <Route path="*" element={
            <Suspense fallback={<LoadingSpinner />}>
              <NotFound />
            </Suspense>
          } />
          </Route>
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
