import React from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  PauseCircleIcon
} from '@heroicons/react/24/outline';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  showIcon = true 
}) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, {
      label: string;
      className: string;
      icon: React.ComponentType<{ className?: string }>;
    }> = {
      'pending': {
        label: 'Pending',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: ClockIcon
      },
      'approved': {
        label: 'Approved',
        className: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircleIcon
      },
      'rejected': {
        label: 'Rejected',
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircleIcon
      },
      'draft': {
        label: 'Draft',
        className: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: DocumentIcon
      },
      'under_review': {
        label: 'Under Review',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: ClockIcon
      },
      'on_hold': {
        label: 'On Hold',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: PauseCircleIcon
      },
      'cancelled': {
        label: 'Cancelled',
        className: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: XCircleIcon
      },
      'paid': {
        label: 'Paid',
        className: 'bg-green-50 text-green-700 border-green-200',
        icon: CheckCircleIcon
      },
      'awaiting_payment': {
        label: 'Awaiting Payment',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: ClockIcon
      },
      'requires_clarification': {
        label: 'Needs Clarification',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        icon: ExclamationTriangleIcon
      }
    };

    return configs[status] || {
      label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      className: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: DocumentIcon
    };
  };

  const getSizeClasses = (size: string) => {
    const sizes = {
      'sm': 'px-2 py-0.5 text-xs',
      'md': 'px-2.5 py-1 text-xs',
      'lg': 'px-3 py-1.5 text-sm'
    };
    return sizes[size as keyof typeof sizes] || sizes.md;
  };

  const getIconSize = (size: string) => {
    const sizes = {
      'sm': 'h-3 w-3',
      'md': 'h-3.5 w-3.5',
      'lg': 'h-4 w-4'
    };
    return sizes[size as keyof typeof sizes] || sizes.md;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border
      ${config.className}
      ${getSizeClasses(size)}
    `}>
      {showIcon && (
        <Icon className={`${getIconSize(size)} mr-1.5`} />
      )}
      {config.label}
    </span>
  );
};
