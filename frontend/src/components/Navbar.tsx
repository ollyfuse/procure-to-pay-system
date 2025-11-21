import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  BellIcon, 
  UserCircleIcon, 
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'staff': 'Staff Member',
      'approver_level_1': 'Level 1 Approver',
      'approver_level_2': 'Level 2 Approver',
      'finance': 'Finance Team'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'staff': 'bg-blue-100 text-blue-700',
      'approver_level_1': 'bg-orange-100 text-orange-700',
      'approver_level_2': 'bg-red-100 text-red-700',
      'finance': 'bg-green-100 text-green-700'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-700';
  };

  const userName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.username || 'User';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Current page context */}
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P2P</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Procure-to-Pay</h1>
              <p className="text-xs text-gray-500">Enterprise Procurement System</p>
            </div>
          </div>

          {/* Right side - Actions and user menu */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <BellIcon className="h-5 w-5" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <div className="flex items-center justify-end mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user?.role ? getRoleBadgeColor(user.role) : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user?.role ? getRoleDisplayName(user.role) : 'User'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <ChevronDownIcon className={`h-4 w-4 text-gray-400 ml-1 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  
                  <button
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-3 text-gray-400" />
                    Profile Settings
                  </button>
                                    
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-red-400" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};
