import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../services/requests';
import type { PurchaseRequest } from '../types';
import { DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline';

export const Approvals: React.FC = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await requestService.getRequests();
        setRequests(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 px-4 sm:px-0">Pending Approvals</h1>
        <div className="bg-white sm:rounded-lg sm:shadow p-6 sm:p-12 text-center mx-4 sm:mx-0">
          <div className="text-gray-500">Loading approvals...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 px-4 sm:px-0">Pending Approvals</h1>
        <div className="bg-white sm:rounded-lg sm:shadow p-6 sm:p-12 text-center mx-4 sm:mx-0">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 px-4 sm:px-0">Pending Approvals</h1>
      
      {requests.length === 0 ? (
        <div className="bg-white sm:rounded-lg sm:shadow p-8 sm:p-12 text-center mx-4 sm:mx-0">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No pending approvals</p>
        </div>
      ) : (
        <div className="bg-white sm:rounded-lg sm:shadow mx-4 sm:mx-0">
          {/* Mobile Card View */}
          <div className="sm:hidden divide-y divide-gray-200">
            {requests.map((request) => (
              <div key={request.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{request.title}</h3>
                    <p className="text-sm text-gray-600">by {request.created_by_username}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-semibold text-gray-900">RWF{request.total_amount}</div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                      Level {request.current_approval_level}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 mb-3">
                  Created: {new Date(request.created_at).toLocaleDateString()}
                </div>
                
                <Link
                  to={`/requests/${request.id}`}
                  className="btn-primary w-full text-center text-sm"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Review Request
                </Link>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.description?.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.created_by_username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      RWF{request.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Level {request.current_approval_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/requests/${request.id}`}
                        className="text-teal-600 hover:text-teal-900 font-medium"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
