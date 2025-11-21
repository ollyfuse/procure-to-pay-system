import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { requestService } from '../services/requests';
import { StatusBadge } from '../components';
import type { PurchaseRequest } from '../types';

export const Finance: React.FC = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await requestService.getRequests();
        let filteredRequests = data.filter(req => req.status === 'approved');
        
        // Apply additional filters based on URL params
        if (statusFilter === 'awaiting_review') {
          filteredRequests = filteredRequests.filter(req => req.payment_status === 'pending');
        } else if (statusFilter === 'paid') {
          filteredRequests = filteredRequests.filter(req => req.payment_status === 'paid');
        } else if (statusFilter === 'on_hold') {
          filteredRequests = filteredRequests.filter(req => req.payment_status === 'on_hold');
        } else if (searchParams.get('missing_receipts') === 'true') {
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
  }, [statusFilter, searchParams]);

  const getStats = () => {
    const allApproved = requests; // This would need to be all approved requests, not filtered
    return {
      awaiting_review: allApproved.filter(r => r.payment_status === 'pending').length,
      paid: allApproved.filter(r => r.payment_status === 'paid').length,
      on_hold: allApproved.filter(r => r.payment_status === 'on_hold').length,
      missing_receipts: allApproved.filter(r => 
        r.payment_status === 'paid' && !r.receipt_submitted && r.receipt_required
      ).length
    };
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      partially_paid: 'bg-blue-100 text-blue-800',
      on_hold: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
        <div className="card text-center py-12">
          <div className="text-gray-500">Loading finance data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
        <div className="card text-center py-12">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const totalValue = requests.reduce((sum, req) => sum + parseFloat(req.total_amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
        <Link to="/finance" className="btn-secondary">
          View All
        </Link>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/finance?status=awaiting_review" className="card hover:shadow-lg transition-shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.awaiting_review}</div>
          <div className="text-sm text-gray-600">Awaiting Review</div>
        </Link>
        <Link to="/finance?status=paid" className="card hover:shadow-lg transition-shadow">
          <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          <div className="text-sm text-gray-600">Paid Requests</div>
        </Link>
        <Link to="/finance?status=on_hold" className="card hover:shadow-lg transition-shadow">
          <div className="text-2xl font-bold text-red-600">{stats.on_hold}</div>
          <div className="text-sm text-gray-600">On Hold</div>
        </Link>
        <Link to="/finance?missing_receipts=true" className="card hover:shadow-lg transition-shadow">
          <div className="text-2xl font-bold text-purple-600">{stats.missing_receipts}</div>
          <div className="text-sm text-gray-600">Missing Receipts</div>
        </Link>
      </div>

      {/* Requests Table */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">
          {statusFilter === 'awaiting_review' ? 'Awaiting Finance Review' :
           statusFilter === 'paid' ? 'Paid Requests' :
           statusFilter === 'on_hold' ? 'On Hold Requests' :
           searchParams.get('missing_receipts') === 'true' ? 'Missing Receipts' :
           'All Approved Requests'}
        </h2>
        
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Requester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Receipt
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${request.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(request.payment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {request.receipt_submitted ? (
                        <span className="text-green-600">✓ Submitted</span>
                      ) : request.payment_status === 'paid' && request.receipt_required ? (
                        <span className="text-red-600">Missing</span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/requests/${request.id}`}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
