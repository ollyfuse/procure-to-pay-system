import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboard';
import { 
  DocumentTextIcon, 
  ClipboardDocumentCheckIcon, 
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ReceiptPercentIcon,
  ClockIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  EyeIcon
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
    switch (user?.role) {
      case 'staff':
        return `Track your requests and submit receipts`;
      case 'approver_level_1':
        return `Review and approve pending requests`;
      case 'approver_level_2':
        return `Final approvals await your decision`;
      case 'finance':
        return `Manage payments and validate receipts`;
      default:
        return `Welcome to your dashboard`;
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, href, priority = false }: any) => (
    <Link 
      to={href} 
      className={`group bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 ${
        priority ? 'ring-2 ring-blue-500 ring-opacity-20' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 sm:p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
    </Link>
  );

  const QuickActionCard = ({ title, description, buttonText, buttonIcon: ButtonIcon, href, color }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <Link 
          to={href} 
          className={`inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 ${color} text-white font-medium rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base w-full sm:w-auto`}
        >
          <ButtonIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          {buttonText}
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 sm:p-8">
          <div className="animate-pulse">
            <div className="h-6 sm:h-8 bg-blue-500 rounded w-48 mb-3"></div>
            <div className="h-3 sm:h-4 bg-blue-400 rounded w-64"></div>
          </div>
        </div>
        
        {/* Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-24 mb-2"></div>
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.first_name || user?.username}!
              </h1>
              <p className="text-blue-100 text-base sm:text-lg">{getWelcomeMessage()}</p>
            </div>
            <div className="flex items-center space-x-2 text-blue-100">
              <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Dashboard */}
      {isStaff && stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Pending"
              value={stats.pending_requests.length}
              icon={ClockIcon}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              href="/requests?status=pending"
              priority={stats.pending_requests.length > 0}
            />
            <StatCard
              title="Approved"
              value={stats.approved_requests.length}
              icon={CheckCircleIcon}
              color="bg-gradient-to-br from-green-500 to-green-600"
              href="/requests?status=approved"
            />
            <StatCard
              title="Rejected"
              value={stats.rejected_requests.length}
              icon={ExclamationTriangleIcon}
              color="bg-gradient-to-br from-red-500 to-red-600"
              href="/requests?status=rejected"
            />
            <StatCard
              title="Receipts Due"
              value={stats.receipts_pending.length}
              icon={ReceiptPercentIcon}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              href="/requests?receipts_pending=true"
              priority={stats.receipts_pending.length > 0}
            />
          </div>

          <QuickActionCard
            title="Ready to create a new request?"
            description="Start your procurement process with a few clicks"
            buttonText="Create Request"
            buttonIcon={PlusIcon}
            href="/requests/new"
            color="bg-blue-600 hover:bg-blue-700"
          />
        </>
      )}

      {/* Approver Dashboard */}
      {isApprover && stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              title="Awaiting Approval"
              value={stats.waiting_for_approval.length}
              icon={ClipboardDocumentCheckIcon}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              href="/approvals"
              priority={stats.waiting_for_approval.length > 0}
            />
            <StatCard
              title="Approved by Me"
              value={stats.approved_by_me.length}
              icon={CheckCircleIcon}
              color="bg-gradient-to-br from-green-500 to-green-600"
              href="/approvals/history?action=approved"
            />
            <StatCard
              title="Rejected by Me"
              value={stats.rejected_by_me.length}
              icon={ExclamationTriangleIcon}
              color="bg-gradient-to-br from-red-500 to-red-600"
              href="/approvals/history?action=rejected"
            />
          </div>

          <QuickActionCard
            title="Pending approvals need your attention"
            description="Review and approve requests efficiently"
            buttonText="Review Approvals"
            buttonIcon={ClipboardDocumentCheckIcon}
            href="/approvals"
            color="bg-orange-600 hover:bg-orange-700"
          />
        </>
      )}

      {/* Finance Dashboard - Simplified */}
      {isFinance && stats && (
        <>
          {/* Priority Cards - Mobile: 2 columns, Desktop: 4 columns */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Review Needed"
              value={stats.awaiting_finance_review.length}
              icon={BanknotesIcon}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              href="/finance?status=awaiting_review"
              priority={stats.awaiting_finance_review.length > 0}
            />
            <StatCard
              title="Missing Receipts"
              value={stats.missing_receipts.length}
              icon={ReceiptPercentIcon}
              color="bg-gradient-to-br from-red-500 to-red-600"
              href="/finance?missing_receipts=true"
              priority={stats.missing_receipts.length > 0}
            />
            <StatCard
              title="Paid"
              value={stats.paid_requests.length}
              icon={CheckCircleIcon}
              color="bg-gradient-to-br from-green-500 to-green-600"
              href="/finance?status=paid"
            />
            <StatCard
              title="On Hold"
              value={stats.on_hold_requests.length}
              icon={ExclamationTriangleIcon}
              color="bg-gradient-to-br from-yellow-500 to-yellow-600"
              href="/finance?status=on_hold"
            />
          </div>

          {/* Quick Actions - Consolidated */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <QuickActionCard
              title="Process Payments"
              description="Review and process pending payments"
              buttonText="Manage Payments"
              buttonIcon={BanknotesIcon}
              href="/finance?status=awaiting_review"
              color="bg-green-600 hover:bg-green-700"
            />
            <QuickActionCard
              title="View All Finance"
              description="Complete overview of financial operations"
              buttonText="View All"
              buttonIcon={EyeIcon}
              href="/finance"
              color="bg-blue-600 hover:bg-blue-700"
            />
          </div>
        </>
      )}
    </div>
  );
};
