import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ReceiptPercentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  show: boolean;
  highlight?: boolean;
}

interface NavSection {
  title: string;
  show?: boolean;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { isStaff, isApprover, isFinance, user } = useAuth();
  const location = useLocation();

  const navSections: NavSection[] = [
    {
      title: 'Overview',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: HomeIcon,
          show: true,
        },
      ]
    },
    {
      title: 'Requests',
      show: isStaff,
      items: [
        {
          name: 'All Requests',
          href: '/requests',
          icon: DocumentTextIcon,
          show: isStaff,
        },
        {
          name: 'Create Request',
          href: '/requests/new',
          icon: PlusIcon,
          show: isStaff,
          highlight: true,
        },
        {
          name: 'Pending',
          href: '/requests?status=pending',
          icon: ClockIcon,
          show: isStaff,
        },
        {
          name: 'Approved',
          href: '/requests?status=approved',
          icon: CheckCircleIcon,
          show: isStaff,
        },
        {
          name: 'Rejected',
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
      ]
    },
    {
      title: 'Approvals',
      show: isApprover,
      items: [
        {
          name: 'Pending Approval',
          href: '/approvals',
          icon: ClipboardDocumentCheckIcon,
          show: isApprover,
          highlight: true,
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
      ]
    },
    {
      title: 'Finance',
      show: isFinance,
      items: [
        {
          name: 'Awaiting Review',
          href: '/finance?status=awaiting_review',
          icon: ClockIcon,
          show: isFinance,
          highlight: true,
        },
        {
          name: 'Paid Requests',
          href: '/finance?status=paid',
          icon: CheckCircleIcon,
          show: isFinance,
        },
        {
          name: 'On Hold',
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
      ]
    }
  ];

  const isActiveLink = (href: string) => {
    const currentPath = location.pathname + location.search;
    return currentPath === href;
  };

  const userName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user?.username || 'User';

  return (
    <aside className="h-full bg-gradient-to-br from-white to-gray-50 lg:bg-white lg:border-r lg:border-gray-200 flex flex-col shadow-2xl lg:shadow-none">
      {/* Mobile Full-Screen Header */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-sm">P2P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Procure-to-Pay</h1>
              <p className="text-blue-100 text-sm">Purchase Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>
        
        {/* User Info on Mobile */}
        <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-white">{userName}</p>
              <p className="text-blue-100 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 lg:px-4 py-6 space-y-6 overflow-y-auto">
        {navSections
          .filter(section => section.show !== false)
          .map((section) => (
            <div key={section.title}>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.items
                  .filter(item => item.show)
                  .map((item) => {
                    const isActive = isActiveLink(item.href);
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={`group flex items-center px-4 py-4 lg:py-3 text-base lg:text-sm font-medium rounded-2xl lg:rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105 lg:scale-100'
                            : item.highlight
                            ? 'text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 hover:shadow-md'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <item.icon 
                          className={`h-6 w-6 lg:h-5 lg:w-5 mr-4 lg:mr-3 flex-shrink-0 transition-colors duration-200 ${
                            isActive 
                              ? 'text-white' 
                              : item.highlight
                              ? 'text-gray-700 group-hover:text-blue-600'
                              : 'text-gray-400 group-hover:text-gray-600'
                          }`} 
                        />
                        <span className="truncate flex-1 font-medium">{item.name}</span>
                        {item.highlight && !isActive && (
                          <div className="ml-3 h-2.5 w-2.5 bg-blue-600 rounded-full flex-shrink-0 animate-pulse"></div>
                        )}
                        {isActive && (
                          <div className="ml-3 h-2 w-2 bg-white rounded-full flex-shrink-0"></div>
                        )}
                      </NavLink>
                    );
                  })}
              </div>
            </div>
          ))}
      </nav>

      {/* Mobile Footer */}
      <div className="lg:hidden p-6 border-t border-gray-200 bg-gray-50">
        <p className="text-center text-sm text-gray-500">
          © 2025 Procure-to-Pay System
        </p>
      </div>
    </aside>
  );
};
