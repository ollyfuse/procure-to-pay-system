import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, login } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.login(credentials);
      
      if (result.success && result.user) {
        login(result.user, localStorage.getItem('access_token')!);
        toast.success(`Welcome back, ${result.user.first_name}!`);
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const quickLogin = (username: string, password: string) => {
    setCredentials({ username, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-teal-500 flex items-center justify-center shadow-md">
          <span className="text-white text-2xl">🏢</span>
        </div>
        <h1 className="text-3xl font-semibold text-gray-800">Procure-to-Pay</h1>
        <p className="text-gray-500 mt-1">Enterprise procurement management system</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-lg bg-white shadow-md rounded-2xl p-8 mb-12">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Sign In</h2>
        <p className="text-gray-500 text-sm mb-6">Enter your credentials to continue</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-600 text-sm mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white p-3 rounded-xl font-medium hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* Staff */}
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border-t-4 border-teal-500">
          <div className="mx-auto h-12 w-12 mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
            <span className="text-gray-600 text-xl">📄</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Staff</h3>
          <p className="text-gray-500 text-sm mb-4">Create and track purchase requests</p>
          <button 
            onClick={() => quickLogin('staff_user', 'testpass123')}
            className="w-full border border-gray-300 rounded-xl p-2 hover:bg-gray-100 transition text-gray-700"
          >
            Continue as Staff
          </button>
        </div>

        {/* Approver */}
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border-t-4 border-orange-500">
          <div className="mx-auto h-12 w-12 mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
            <span className="text-gray-600 text-xl">🛡️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Approver</h3>
          <p className="text-gray-500 text-sm mb-4">Review and approve requests</p>
          <button 
            onClick={() => quickLogin('approver_l1', 'testpass123')}
            className="w-full border border-gray-300 rounded-xl p-2 hover:bg-gray-100 transition text-gray-700"
          >
            Continue as Approver
          </button>
        </div>

        {/* Finance */}
        <div className="bg-white rounded-2xl shadow-md p-6 text-center border-t-4 border-green-500">
          <div className="mx-auto h-12 w-12 mb-4 rounded-xl bg-gray-100 flex items-center justify-center">
            <span className="text-gray-600 text-xl">📑</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Finance</h3>
          <p className="text-gray-500 text-sm mb-4">Manage POs and validate receipts</p>
          <button 
            onClick={() => quickLogin('finance_user', 'testpass123')}
            className="w-full border border-gray-300 rounded-xl p-2 hover:bg-gray-100 transition text-gray-700"
          >
            Continue as Finance
          </button>
        </div>
      </div>
    </div>
  );
};
