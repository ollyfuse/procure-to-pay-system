import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { requestService } from '../services/requests';
import type { PurchaseRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline';

export const ApprovalHistory: React.FC = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const actionFilter = searchParams.get('action');

  const filteredRequests = useMemo(() => {
    if (!actionFilter) return requests;
    
    return requests.filter(request => {
      const myApproval = request.approvals?.find(a => a.approver === user?.id);
      return myApproval?.action === actionFilter;
    });
  }, [requests, actionFilter, user?.id]);

  const pageTitle = actionFilter === 'approved' ? 'Approved by Me' : 
                   actionFilter === 'rejected' ? 'Rejected by Me' : 
                   'My Approval History';

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await requestService.getMyApprovals();
        setRequests(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load approval history');
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 px-4 sm:px-0">{pageTitle}</h1>
        <div className="bg-white sm:rounded-lg sm:shadow p-6 sm:p-12 text-center mx-4 sm:mx-0">
          <div className="text-gray-500">Loading approval history...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 px-4 sm:px-0">{pageTitle}</h1>
        <div className="bg-white sm:rounded-lg sm:shadow p-6 sm:p-12 text-center mx-4 sm:mx-0">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 px-4 sm:px-0">{pageTitle}</h1>
      
      {filteredRequests.length === 0 ? (
        <div className="bg-white sm:rounded-lg sm:shadow p-8 sm:p-12 text-center mx-4 sm:mx-0">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {actionFilter ? `No ${actionFilter} requests found` : 'No approval history found'}
          </p>
        </div>
      ) : (
        <div className="bg-white sm:rounded-lg sm:shadow mx-4 sm:mx-0">
          {/* Mobile Card View */}
          <div className="sm:hidden divide-y divide-gray-200">
            {filteredRequests.map((request) => {
              const myApproval = request.approvals?.find(a => a.approver === user?.id);
              return (
                <div key={request.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{request.title}</h3>
                      <p className="text-sm text-gray-600">by {request.created_by_username}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold text-gray-900">RWF{request.total_amount}</div>
                      {myApproval && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          myApproval.action === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {myApproval.action}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-3">
                    Decision made: {new Date(request.updated_at).toLocaleDateString()}
                  </div>
                  
                  <Link
                    to={`/requests/${request.id}`}
                    className="btn-primary w-full text-center text-sm"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Request
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Request
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    My Decision
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => {
                  const myApproval = request.approvals?.find(a => a.approver === user?.id);
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          by {request.created_by_username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        RWF{request.total_amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {myApproval && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            myApproval.action === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {myApproval.action}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/requests/${request.id}`}
                          className="text-teal-600 hover:text-teal-900 font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
