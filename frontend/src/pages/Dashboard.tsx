import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  DocumentTextIcon, 
  ClipboardDocumentCheckIcon, 
  BanknotesIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

export const Dashboard: React.FC = () => {
  const { user, isStaff, isApprover, isFinance } = useAuth();

  const getWelcomeMessage = () => {
    const firstName = user?.first_name || user?.username;
    switch (user?.role) {
      case 'staff':
        return `Welcome back, ${firstName}! Ready to create new purchase requests?`;
      case 'approver_level_1':
        return `Welcome back, ${firstName}! You have pending requests to review.`;
      case 'approver_level_2':
        return `Welcome back, ${firstName}! Final approvals await your decision.`;
      case 'finance':
        return `Welcome back, ${firstName}! Monitor approved requests and purchase orders.`;
      default:
        return `Welcome back, ${firstName}!`;
    }
  };

  const getDashboardCards = () => {
    if (isStaff) {
      return [
        {
          title: 'My Requests',
          description: 'View and manage your purchase requests',
          icon: DocumentTextIcon,
          href: '/requests',
          color: 'bg-blue-500',
        },
        {
          title: 'Create Request',
          description: 'Submit a new purchase request',
          icon: DocumentTextIcon,
          href: '/requests/new',
          color: 'bg-green-500',
        },
      ];
    }

    if (isApprover) {
      return [
        {
          title: 'Pending Approvals',
          description: 'Review requests awaiting your approval',
          icon: ClipboardDocumentCheckIcon,
          href: '/approvals',
          color: 'bg-orange-500',
        },
      ];
    }

    if (isFinance) {
      return [
        {
          title: 'Approved Requests',
          description: 'View all approved purchase requests',
          icon: CheckCircleIcon,
          href: '/finance',
          color: 'bg-green-500',
        },
        {
          title: 'Purchase Orders',
          description: 'Manage generated purchase orders',
          icon: BanknotesIcon,
          href: '/finance',
          color: 'bg-purple-500',
        },
      ];
    }

    return [];
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Dashboard
        </h1>
        <p className="text-primary-100">
          {getWelcomeMessage()}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getDashboardCards().map((card, index) => (
          <div
            key={index}
            className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => window.location.href = card.href}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.color} text-white mr-4`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {card.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">0</div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-warning-600">0</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-success-600">0</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-danger-600">0</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>
    </div>
  );
};
