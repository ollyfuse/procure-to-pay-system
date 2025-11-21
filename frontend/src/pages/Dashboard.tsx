// Enhanced Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboard';
import { 
  DocumentTextIcon, 
  ClipboardDocumentCheckIcon, 
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, isStaff, isApprover, isFinance } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (isStaff) {
          const data = await dashboardService.getStaffStats();
          setStats(data);
        } else if (isApprover) {
          const data = await dashboardService.getApproverStats();
          setStats(data);
        } else if (isFinance) {
          const data = await dashboardService.getFinanceStats();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [isStaff, isApprover, isFinance]);

  const getWelcomeMessage = () => {
    const firstName = user?.first_name || user?.username;
    switch (user?.role) {
      case 'staff':
        return `Welcome back, ${firstName}! Track your requests and submit receipts.`;
      case 'approver_level_1':
        return `Welcome back, ${firstName}! You have requests awaiting your approval.`;
      case 'approver_level_2':
        return `Welcome back, ${firstName}! Final approvals await your decision.`;
      case 'finance':
        return `Welcome back, ${firstName}! Manage payments and validate receipts.`;
      default:
        return `Welcome back, ${firstName}!`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
          <p className="text-teal-100">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-teal-100">{getWelcomeMessage()}</p>
      </div>

      {/* Staff Dashboard */}
      {isStaff && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/requests?status=pending" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-500 text-white mr-4">
                <DocumentTextIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.pending_requests.length}</div>
                <div className="text-sm text-gray-600">Pending Requests</div>
              </div>
            </div>
          </Link>

          <Link to="/requests?status=approved" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500 text-white mr-4">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.approved_requests.length}</div>
                <div className="text-sm text-gray-600">Approved Requests</div>
              </div>
            </div>
          </Link>

          <Link to="/requests?status=rejected" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-500 text-white mr-4">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.rejected_requests.length}</div>
                <div className="text-sm text-gray-600">Rejected Requests</div>
              </div>
            </div>
          </Link>

          <Link to="/requests?receipts_pending=true" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500 text-white mr-4">
                <ReceiptPercentIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.receipts_pending.length}</div>
                <div className="text-sm text-gray-600">Receipts Pending</div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Approver Dashboard */}
      {isApprover && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/approvals" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-500 text-white mr-4">
                <ClipboardDocumentCheckIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.waiting_for_approval.length}</div>
                <div className="text-sm text-gray-600">Waiting for My Approval</div>
              </div>
            </div>
          </Link>

          <Link to="/approval-history?action=approved" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500 text-white mr-4">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.approved_by_me.length}</div>
                <div className="text-sm text-gray-600">Approved by Me</div>
              </div>
            </div>
          </Link>

          <Link to="/approval-history?action=rejected" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-500 text-white mr-4">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.rejected_by_me.length}</div>
                <div className="text-sm text-gray-600">Rejected by Me</div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Finance Dashboard */}
      {isFinance && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/finance?status=awaiting_review" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500 text-white mr-4">
                <BanknotesIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.awaiting_finance_review.length}</div>
                <div className="text-sm text-gray-600">Awaiting Review</div>
              </div>
            </div>
          </Link>

          <Link to="/finance?status=paid" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500 text-white mr-4">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.paid_requests.length}</div>
                <div className="text-sm text-gray-600">Paid Requests</div>
              </div>
            </div>
          </Link>

          <Link to="/finance?status=on_hold" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500 text-white mr-4">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.on_hold_requests.length}</div>
                <div className="text-sm text-gray-600">On Hold</div>
              </div>
            </div>
          </Link>

          <Link to="/finance?missing_receipts=true" className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-500 text-white mr-4">
                <ReceiptPercentIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.missing_receipts.length}</div>
                <div className="text-sm text-gray-600">Missing Receipts</div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isStaff && (
            <Link to="/requests/new" className="btn-primary text-center">
              Create New Request
            </Link>
          )}
          {isApprover && (
            <Link to="/approvals" className="btn-primary text-center">
              Review Pending Approvals
            </Link>
          )}
          {isFinance && (
            <Link to="/finance" className="btn-primary text-center">
              Manage Payments
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
