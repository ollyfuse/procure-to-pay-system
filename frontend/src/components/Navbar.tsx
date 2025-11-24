import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon, 
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'staff': 'Staff',
      'approver_level_1': 'L1 Approver',
      'approver_level_2': 'L2 Approver',
      'finance': 'Finance'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'staff': 'bg-blue-50 text-blue-700 border-blue-200',
      'approver_level_1': 'bg-orange-50 text-orange-700 border-orange-200',
      'approver_level_2': 'bg-red-50 text-red-700 border-red-200',
      'finance': 'bg-green-50 text-green-700 border-green-200'
    };
    return colorMap[role] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const userName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.username || 'User';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 h-16 shadow-sm">
      <div className="px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Brand */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="h-8 w-8 sm:h-9 sm:w-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xs sm:text-sm">P2P</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Procure-to-Pay</h1>
                <p className="text-xs text-gray-500 -mt-0.5">Purchase Management System</p>
              </div>
              {/* Mobile title */}
              <div className="sm:hidden">
                <h1 className="text-lg font-semibold text-gray-900">P2P</h1>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                {/* Desktop user info */}
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                    {userName}
                  </p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    user?.role ? getRoleBadgeColor(user.role) : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    {user?.role ? getRoleDisplayName(user.role) : 'User'}
                  </span>
                </div>
                
                {/* Mobile: Just role badge */}
                <div className="md:hidden">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${
                    user?.role ? getRoleBadgeColor(user.role) : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    {user?.role ? getRoleDisplayName(user.role) : 'User'}
                  </span>
                </div>
                
                <div className="h-8 w-8 sm:h-9 sm:w-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-gray-300">
                  <UserCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </div>
                
                <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                  showUserMenu ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    <div className="mt-2">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${
                        user?.role ? getRoleBadgeColor(user.role) : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {user?.role ? getRoleDisplayName(user.role) : 'User'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-3 text-gray-500" />
                    Profile Settings
                  </button>
                                    
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-700 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-red-500" />
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
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};
