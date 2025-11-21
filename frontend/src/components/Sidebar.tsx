import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  CheckCircleIcon,
  XCircleIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';

export const Sidebar: React.FC = () => {
  const { user, isStaff, isApprover, isFinance, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      show: true,
    },
    // Staff Navigation - Categorized
    {
      name: 'All Requests',
      href: '/requests',
      icon: DocumentTextIcon,
      show: isStaff,
    },
    {
      name: 'Pending Requests',
      href: '/requests?status=pending',
      icon: ClockIcon,
      show: isStaff,
    },
    {
      name: 'Approved Requests',
      href: '/requests?status=approved',
      icon: CheckCircleIcon,
      show: isStaff,
    },
    {
      name: 'Rejected Requests',
      href: '/requests?status=rejected',
      icon: XCircleIcon,
      show: isStaff,
    },
    {
      name: 'Receipts Pending',
      href: '/requests?receipts_pending=true',
      icon: ReceiptPercentIcon,
      show: isStaff,
    },
    {
      name: 'Create Request',
      href: '/requests/new',
      icon: PlusIcon,
      show: isStaff,
    },
    // Approver Navigation - Enhanced
    {
      name: 'Waiting for My Approval',
      href: '/approvals',
      icon: ClipboardDocumentCheckIcon,
      show: isApprover,
    },
    {
      name: 'Approved by Me',
      href: '/approvals/history?action=approved',
      icon: CheckCircleIcon,
      show: isApprover,
    },
    {
      name: 'Rejected by Me',
      href: '/approvals/history?action=rejected',
      icon: XCircleIcon,
      show: isApprover,
    },
    // Finance Navigation - Enhanced
    {
      name: 'Awaiting Finance Review',
      href: '/finance?status=awaiting_review',
      icon: ClockIcon,
      show: isFinance,
    },
    {
      name: 'Paid Requests',
      href: '/finance?status=paid',
      icon: CheckCircleIcon,
      show: isFinance,
    },
    {
      name: 'On Hold Requests',
      href: '/finance?status=on_hold',
      icon: XCircleIcon,
      show: isFinance,
    },
    {
      name: 'Missing Receipts',
      href: '/finance?missing_receipts=true',
      icon: ReceiptPercentIcon,
      show: isFinance,
    },
  ];


  const isActiveLink = (href: string) => {
    const currentPath = location.pathname + location.search;
    return currentPath === href;
  };

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
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P2P</span>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">Procure-to-Pay</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems
          .filter(item => item.show)
          .map((item) => {
            const isActive = isActiveLink(item.href);
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon 
                  className={`h-5 w-5 mr-3 transition-colors duration-200 ${
                    isActive ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} 
                />
                {item.name}
              </NavLink>
            );
          })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="bg-gray-50 rounded-lg p-4 mb-3">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
              <UserCircleIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user?.username
                }
              </p>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  user?.role ? getRoleColor(user.role) : 'bg-gray-100 text-gray-800'
                }`}>
                  {user?.role ? getRoleDisplay(user.role) : 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-gray-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
