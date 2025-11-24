import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  DocumentArrowUpIcon,
  CalendarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { requestService } from '../services/requests';
import { StatusBadge } from '../components';
import type { PurchaseRequest } from '../types';

export const Requests: React.FC = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  const receiptsFilter = searchParams.get('receipts_pending');

  useEffect(() => {
  const loadRequests = async () => {
    try {
      const data = await requestService.getRequests();
      let filteredRequests = data;
      
      // DEBUG: Log all requests and their payment status
      console.log('All requests:', data.map(r => ({
        id: r.id,
        title: r.title,
        payment_status: r.payment_status,
        receipt_submitted: r.receipt_submitted,
        receipt_required: r.receipt_required,
        status: r.status
      })));
      
      // Apply filters based on URL params
      if (statusFilter) {
        filteredRequests = filteredRequests.filter(req => req.status === statusFilter);
      } else if (receiptsFilter === 'true') {
        // DEBUG: Log the filtering criteria
        console.log('Filtering for receipts pending...');
        const receiptsPending = filteredRequests.filter(req => {
          const matches = req.payment_status === 'paid' && !req.receipt_submitted && req.receipt_required;
          console.log(`Request ${req.title}: payment_status=${req.payment_status}, receipt_submitted=${req.receipt_submitted}, receipt_required=${req.receipt_required}, matches=${matches}`);
          return matches;
        });
        filteredRequests = receiptsPending;
        console.log('Receipts pending requests:', receiptsPending);
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

  const getFilterBadge = () => {
    if (statusFilter) return statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
    if (receiptsFilter === 'true') return 'Receipts Pending';
    return null;
  };

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const RequestCard = ({ request }: { request: PurchaseRequest }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
            {request.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {request.description}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span className="font-medium">RWF{request.total_amount}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>{new Date(request.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {receiptsFilter === 'true' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">Receipt Required</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          to={`/requests/${request.id}`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          {receiptsFilter === 'true' ? (
            <>
              <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
              Upload Receipt
            </>
          ) : (
            <>
              <EyeIcon className="h-4 w-4 mr-2" />
              View Details
            </>
          )}
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <Link to="/requests/new" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Request
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-900 font-medium mb-2">Something went wrong</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
            {getFilterBadge() && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <FunnelIcon className="h-3 w-3 mr-1" />
                {getFilterBadge()}
              </span>
            )}
          </div>
          {(statusFilter || receiptsFilter) && (
            <Link 
              to="/requests" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ← View All Requests
            </Link>
          )}
        </div>
        <Link 
          to="/requests/new" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Request
        </Link>
      </div>

      {/* Search Bar */}
      {requests.length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Content */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching requests found' : 
             statusFilter || receiptsFilter ? 'No requests found for this filter' : 'No requests yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first purchase request'}
          </p>
          {!searchTerm && (
            <Link 
              to="/requests/new" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Your First Request
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block lg:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {request.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {request.description}
                          </div>
                          {receiptsFilter === 'true' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                              Receipt Required
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          RWF{request.total_amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          to={`/requests/${request.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                        >
                          {receiptsFilter === 'true' ? (
                            <>
                              <DocumentArrowUpIcon className="h-4 w-4 mr-1" />
                              Upload
                            </>
                          ) : (
                            <>
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View
                            </>
                          )}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
