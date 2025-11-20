import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'staff':
        return 'Staff';
      case 'approver_level_1':
        return 'Approver L1';
      case 'approver_level_2':
        return 'Approver L2';
      case 'finance':
        return 'Finance';
      default:
        return role;
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Procure-to-Pay System
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <BellIcon className="h-6 w-6" />
            </button>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role && getRoleDisplayName(user.role)}
                </p>
              </div>
              
              <div className="relative">
                <button
                  onClick={logout}
                  className="flex items-center p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Logout"
                >
                  <UserCircleIcon className="h-8 w-8" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
