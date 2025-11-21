import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { requestService } from '../services/requests';
import { StatusBadge } from '../components';
import type { PurchaseRequest } from '../types';

export const Requests: React.FC = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  const receiptsFilter = searchParams.get('receipts_pending');

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await requestService.getRequests();
        let filteredRequests = data;
        
        // Apply filters based on URL params
        if (statusFilter) {
          filteredRequests = filteredRequests.filter(req => req.status === statusFilter);
        } else if (receiptsFilter === 'true') {
          filteredRequests = filteredRequests.filter(req => 
            req.payment_status === 'paid' && !req.receipt_submitted && req.receipt_required
          );
        }
        
        setRequests(filteredRequests);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [statusFilter, receiptsFilter]);

  const getPageTitle = () => {
    if (statusFilter === 'pending') return 'Pending Requests';
    if (statusFilter === 'approved') return 'Approved Requests';
    if (statusFilter === 'rejected') return 'Rejected Requests';
    if (receiptsFilter === 'true') return 'Receipts Pending';
    return 'My Requests';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <Link to="/requests/new" className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Request
          </Link>
        </div>
        <div className="card text-center py-12">
          <div className="text-gray-500">Loading requests...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <Link to="/requests/new" className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Request
          </Link>
        </div>
        <div className="card text-center py-12">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          {(statusFilter || receiptsFilter) && (
            <Link to="/requests" className="text-sm text-teal-600 hover:text-teal-800">
              ← View All Requests
            </Link>
          )}
        </div>
        <Link to="/requests/new" className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Request
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">
            {statusFilter || receiptsFilter ? 'No requests found for this filter' : 'No requests found'}
          </p>
          <Link to="/requests/new" className="btn-primary">
            Create Your First Request
          </Link>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {receiptsFilter === 'true' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt Status
                    </th>
                  )}
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
                      ${request.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} />
                    </td>
                    {receiptsFilter === 'true' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="text-red-600 font-medium">Receipt Required</span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/requests/${request.id}`}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        {receiptsFilter === 'true' ? 'Upload Receipt' : 'View'}
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
