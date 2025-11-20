import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export const Sidebar: React.FC = () => {
  const { user, isStaff, isApprover, isFinance } = useAuth();

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
      name: 'Pending Approvals',
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
  ];

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          {navItems
            .filter(item => item.show)
            .map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </NavLink>
            ))}
        </nav>

        {/* User Info Card */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm">
            <p className="font-medium text-gray-900">
              {user?.username}
            </p>
            <p className="text-gray-500 capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
