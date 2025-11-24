import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { requestService } from '../services/requests';
import type { PurchaseRequest } from '../types';

export const Finance: React.FC = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [allApprovedRequests, setAllApprovedRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all requests and filter for approved ones
        const allRequests = await requestService.getRequests();
        const approvedRequests = allRequests.filter(req => req.status === 'approved');
        
        // Store all approved requests for stats calculation
        setAllApprovedRequests(approvedRequests);
        
        // Filter for display based on current tab
        let filteredRequests = approvedRequests;
        
        if (statusFilter === 'awaiting_review') {
          filteredRequests = approvedRequests.filter(req => req.payment_status === 'pending');
        } else if (statusFilter === 'paid') {
          filteredRequests = approvedRequests.filter(req => req.payment_status === 'paid');
        } else if (statusFilter === 'on_hold') {
          filteredRequests = approvedRequests.filter(req => req.payment_status === 'on_hold');
        } else if (searchParams.get('missing_receipts') === 'true') {
          filteredRequests = approvedRequests.filter(req => 
            req.payment_status === 'paid' && !req.receipt_submitted && req.receipt_required
          );
        }
        
        setRequests(filteredRequests);
      } catch (err: any) {
        console.error('Finance page error:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [statusFilter, searchParams]);

  // Calculate stats from ALL approved requests, not filtered ones
  const getStats = () => {
    return {
      awaiting_review: allApprovedRequests.filter(r => r.payment_status === 'pending').length,
      paid: allApprovedRequests.filter(r => r.payment_status === 'paid').length,
      on_hold: allApprovedRequests.filter(r => r.payment_status === 'on_hold').length,
      missing_receipts: allApprovedRequests.filter(r => 
        r.payment_status === 'paid' && !r.receipt_submitted && r.receipt_required
      ).length
    };
  };

  const getProcessingStats = () => {
    return {
      successful_extractions: allApprovedRequests.filter(r => 
        r.proforma_metadata?.extraction_status === 'success'
      ).length,
      failed_extractions: allApprovedRequests.filter(r => 
        r.proforma_metadata?.extraction_status === 'failed'
      ).length,
      pending_validations: allApprovedRequests.filter(r => 
        r.receipt_submitted && r.receipt_metadata?.validation_status === 'pending'
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
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 px-4 sm:px-0">Finance Dashboard</h1>
        <div className="bg-white sm:rounded-lg sm:shadow p-6 sm:p-12 text-center mx-4 sm:mx-0">
          <div className="text-gray-500">Loading finance data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 px-4 sm:px-0">Finance Dashboard</h1>
        <div className="bg-white sm:rounded-lg sm:shadow p-6 sm:p-12 text-center mx-4 sm:mx-0">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const processingStats = getProcessingStats();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Finance Dashboard</h1>
        <Link to="/finance" className="btn-secondary w-full sm:w-auto text-center">
          View All
        </Link>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6 px-4 sm:px-0">
        <Link to="/finance?status=awaiting_review" className="bg-white sm:rounded-lg sm:shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.awaiting_review}</div>
          <div className="text-xs sm:text-sm text-gray-600">Awaiting Review</div>
        </Link>
        <Link to="/finance?status=paid" className="bg-white sm:rounded-lg sm:shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.paid}</div>
          <div className="text-xs sm:text-sm text-gray-600">Paid Requests</div>
        </Link>
        <Link to="/finance?status=on_hold" className="bg-white sm:rounded-lg sm:shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="text-lg sm:text-2xl font-bold text-red-600">{stats.on_hold}</div>
          <div className="text-xs sm:text-sm text-gray-600">On Hold</div>
        </Link>
        <Link to="/finance?missing_receipts=true" className="bg-white sm:rounded-lg sm:shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="text-lg sm:text-2xl font-bold text-purple-600">{stats.missing_receipts}</div>
          <div className="text-xs sm:text-sm text-gray-600">Missing Receipts</div>
        </Link>
        <div className="bg-white sm:rounded-lg sm:shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{processingStats.successful_extractions}</div>
          <div className="text-xs sm:text-sm text-gray-600">Successful AI Extractions</div>
        </div>
        <div className="bg-white sm:rounded-lg sm:shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="text-lg sm:text-2xl font-bold text-red-600">{processingStats.failed_extractions}</div>
          <div className="text-xs sm:text-sm text-gray-600">Failed Extractions</div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white sm:rounded-lg sm:shadow mx-4 sm:mx-0">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold">
            {statusFilter === 'awaiting_review' ? 'Awaiting Finance Review' :
             statusFilter === 'paid' ? 'Paid Requests' :
             statusFilter === 'on_hold' ? 'On Hold Requests' :
             searchParams.get('missing_receipts') === 'true' ? 'Missing Receipts' :
             'All Approved Requests'}
          </h2>
        </div>
        
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No requests found</p>
          </div>
        ) : (
          <>
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
                      <div className="mt-1">{getPaymentStatusBadge(request.payment_status)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">PO:</span>
                      <div className="font-medium">
                        {request.purchase_order ? (
                          <span className="text-green-600">{request.purchase_order.po_number}</span>
                        ) : (
                          <span className="text-gray-400">Not Generated</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Receipt:</span>
                      <div className="font-medium">
                        {request.receipt_submitted ? (
                          <span className="text-green-600">✓ Submitted</span>
                        ) : request.payment_status === 'paid' && request.receipt_required ? (
                          <span className="text-red-600">Missing</span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to={`/requests/${request.id}`}
                    className="btn-primary w-full text-center text-sm"
                  >
                    Manage
                  </Link>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.title}</div>
                        <div className="text-sm text-gray-500">{request.description?.substring(0, 50)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.created_by_username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">RWF{request.total_amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {request.purchase_order ? (
                          <span className="text-green-600">{request.purchase_order.po_number}</span>
                        ) : (
                          <span className="text-gray-400">Not Generated</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getPaymentStatusBadge(request.payment_status)}</td>
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
                        <Link to={`/requests/${request.id}`} className="text-teal-600 hover:text-teal-900">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
