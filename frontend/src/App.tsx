import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Requests } from './pages/Requests';
import { CreateRequest } from './pages/CreateRequest';
import { Approvals } from './pages/Approvals';
import { Finance } from './pages/Finance';
import { RequestDetail } from './pages/RequestDetail';
import { ApprovalHistory } from './pages/ApprovalHistory';
import { Profile } from './pages/Profile';
import './App.css';

function App() {
    useEffect(() => {
    const hasSeenNotice = localStorage.getItem('service-notice-2024');
    if (!hasSeenNotice) {
      setTimeout(() => {
        toast.success(
          "We apologize for the recent service interruption. The system is now fully operational. Please note: API documentation has moved to http://16.171.30.43:8000/api/docs/. from the one I submitted in email. Thank you for your patience."
, 
          {
            duration: 8000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
          }
        );
        localStorage.setItem('service-notice-2024', 'true');
      }, 1000); // Show after 1 second
    }
  }, []);

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
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
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

            <Route path="/requests/:id" element={
              <ProtectedRoute>
                <Layout>
                  <RequestDetail />
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

            <Route path="/approvals/history" element={
              <ProtectedRoute requiredRole={['approver_level_1', 'approver_level_2']}>
                <Layout>
                  <ApprovalHistory />
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
