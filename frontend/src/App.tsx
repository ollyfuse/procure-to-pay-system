import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Requests } from './pages/Requests';
import { CreateRequest } from './pages/CreateRequest';
import { Approvals } from './pages/Approvals';
import { Finance } from './pages/Finance';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Staff Routes */}
            <Route path="/requests" element={
              <ProtectedRoute requiredRole={['staff']}>
                <Layout>
                  <Requests />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/requests/new" element={
              <ProtectedRoute requiredRole={['staff']}>
                <Layout>
                  <CreateRequest />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Approver Routes */}
            <Route path="/approvals" element={
              <ProtectedRoute requiredRole={['approver_level_1', 'approver_level_2']}>
                <Layout>
                  <Approvals />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Finance Routes */}
            <Route path="/finance" element={
              <ProtectedRoute requiredRole={['finance']}>
                <Layout>
                  <Finance />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600">Page not found</p>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
