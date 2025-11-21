import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  PlusIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export const Sidebar: React.FC = () => {
  const { user, isStaff, isApprover, isFinance, logout } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      show: true,
    },
    {
      name: 'My Requests',
      href: '/requests',
      icon: DocumentTextIcon,
      show: isStaff,
    },
    {
      name: 'Create Request',
      href: '/requests/new',
      icon: PlusIcon,
      show: isStaff,
    },
    {
      name: 'Approvals',
      href: '/approvals',
      icon: ClipboardDocumentCheckIcon,
      show: isApprover,
    },
    {
      name: 'Finance',
      href: '/finance',
      icon: BanknotesIcon,
      show: isFinance,
    },
    {
    name: 'My History',
    href: '/approvals/history',
    icon: ClockIcon, 
    show: isApprover,
  },
  ];

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      'staff': 'Staff Member',
      'approver_level_1': 'Level 1 Approver',
      'approver_level_2': 'Level 2 Approver',
      'finance': 'Finance Team'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'staff': 'bg-blue-100 text-blue-800',
      'approver_level_1': 'bg-orange-100 text-orange-800',
      'approver_level_2': 'bg-red-100 text-red-800',
      'finance': 'bg-green-100 text-green-800'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo/Brand */}
      {/* <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P2P</span>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">Procure-to-Pay</h1>
          </div>
        </div>
      </div> */}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems
          .filter(item => item.show)
          .map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    className={`h-5 w-5 mr-3 transition-colors duration-200 ${
                      isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`} 
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
      </nav>
  
    </aside>
  );
};
