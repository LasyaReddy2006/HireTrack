import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Page components
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationDetails from './pages/ApplicationDetails';
import JobListings from './pages/JobListings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes inside shared Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Default root path redirects to Dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/new" element={<ApplicationForm />} />
            <Route path="applications/edit/:id" element={<ApplicationForm />} />
            <Route path="applications/:id" element={<ApplicationDetails />} />
            <Route path="jobs" element={<JobListings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* 404 Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
