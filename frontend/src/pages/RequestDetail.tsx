import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestService } from '../services/requests';
import type { PurchaseRequest } from '../types';
import { POReceiptComparison, DocumentProcessingStatus } from '../components';
import { 
  StatusBadge, 
  Upload, 
  DocumentViewer, 
  ClarificationManager, 
  ReceiptUpload, 
  PaymentManager 
} from '../components';
import { fileService } from '../services/files';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isApprover, isFinance } = useAuth();
  const [req, setReq] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const canApprove = useMemo(() => 
    req && req.status === 'pending' && isApprover, [req, isApprover]
  );
  const canEdit = useMemo(() => 
    req && !req.is_locked && req.created_by === user?.id, [req, user]
  );
  const needsReceipt = useMemo(() =>
    req && req.payment_status === 'paid' && !req.receipt_submitted && req.receipt_required && req.created_by === user?.id,
    [req, user]
  );

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await requestService.getRequest(id);
      setReq(data);
      setError(null);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const doAction = async (action: 'approve' | 'reject') => {
    if (!id) return;
    setActionLoading(true);
    try {
      const payload = comment.trim() ? { comment: comment.trim() } : {};
      if (action === 'approve') await requestService.approveRequest(id, payload);
      else await requestService.rejectRequest(id, payload);
      toast.success(`Request ${action}d successfully`);
      setComment('');
      await load();
    } catch (e: any) {
      toast.error(e.response?.data?.error || `Failed to ${action} request`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 sm:px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto sm:py-6">
          <div className="flex items-center justify-between px-4 sm:px-0 py-4 sm:py-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Request Detail</h1>
            <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
          </div>
          <div className="bg-white sm:rounded-lg sm:shadow p-6 mx-4 sm:mx-0 text-center">
            <div className="text-gray-500">Loading request details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 sm:px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto sm:py-6">
          <div className="flex items-center justify-between px-4 sm:px-0 py-4 sm:py-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Request Detail</h1>
            <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
          </div>
          <div className="bg-white sm:rounded-lg sm:shadow p-6 mx-4 sm:mx-0 text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button className="btn-primary" onClick={load}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (!req) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '' },
    { id: 'documents', label: 'Documents', icon: '', count: [req.proforma_file_url, req.receipt_file_url, req.payment_proof_url].filter(Boolean).length },
    { id: 'validation', label: 'Validation', icon: '', hasData: req.receipt_metadata || (req.purchase_order && req.receipt_metadata) },
    { id: 'approvals', label: 'Approvals', icon: '', count: req.approvals?.length || 0 },
    { id: 'actions', label: 'Actions', icon: '', hasData: canApprove || isFinance || req.clarification_requested }
  ].filter(tab => {
    if (tab.id === 'validation') return tab.hasData;
    if (tab.id === 'actions') return tab.hasData;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 sm:px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-0 py-4 sm:py-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Request Detail</h1>
            <p className="text-gray-600 text-sm">ID: {req.id}</p>
          </div>
          <button className="btn-secondary w-full sm:w-fit" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        {/* Alerts */}
        {req.clarification_requested && (
          <div className="px-4 sm:px-0">
            <ClarificationManager request={req} onUpdate={load} />
          </div>
        )}

        {needsReceipt && (
          <div className="bg-purple-50 border-purple-200 sm:rounded-lg sm:shadow p-6 mx-4 sm:mx-0">
            <h3 className="font-semibold text-purple-800 mb-4">Receipt Required</h3>
            <p className="text-purple-700 mb-4">Your request has been paid. Please upload your receipt.</p>
            <ReceiptUpload requestId={req.id} onUploadComplete={load} />
          </div>
        )}

        {/* Request Summary */}
        <div className="bg-white sm:rounded-lg sm:shadow p-6 mx-4 sm:mx-0">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 break-words">{req.title}</h2>
                <p className="text-gray-600 text-sm">
                  Created by {req.created_by_username} • {new Date(req.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2">
                <StatusBadge status={req.status} />
                {req.payment_status !== 'pending' && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    req.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                    req.payment_status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {req.payment_status.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 sm:p-6 border border-blue-100">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">RWF{req.total_amount}</div>
            <div className="text-sm text-gray-600 font-medium">Total Amount</div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white sm:rounded-lg sm:shadow mx-4 sm:mx-0">
          <div className="border-b border-gray-200">
            {/* Mobile Tab Selector */}
            <div className="sm:hidden px-4 py-3">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.icon} {tab.label} {tab.count !== undefined && tab.count > 0 ? `(${tab.count})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Tab Navigation */}
            <nav className="hidden sm:flex space-x-4 lg:space-x-8 px-4 sm:px-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.label.slice(0, 3)}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {req.description && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed break-words">{req.description}</p>
                  </div>
                )}

                {/* Items */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <h3 className="font-semibold text-gray-900">Request Items</h3>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium w-fit">
                      {req.items.length} items
                    </span>
                  </div>
                  
                  {/* Mobile List View */}
                  <div className="sm:hidden space-y-4">
                    {req.items.map((item, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="font-medium text-gray-900 mb-3 break-words">{item.description}</div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <span className="text-gray-500 block mb-1">Quantity</span>
                            <div className="font-semibold text-lg">{item.quantity}</div>
                          </div>
                          <div className="text-center">
                            <span className="text-gray-500 block mb-1">Unit Price</span>
                            <div className="font-mono font-semibold">RWF{item.unit_price}</div>
                          </div>
                          <div className="text-center">
                            <span className="text-gray-500 block mb-1">Total</span>
                            <div className="font-mono font-bold text-lg text-blue-600">RWF{item.total_price}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {req.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 text-sm text-gray-900 break-words max-w-xs">{item.description}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 text-right font-medium">{item.quantity}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 text-right font-mono">RWF{item.unit_price}</td>
                            <td className="px-4 py-4 text-sm font-semibold text-gray-900 text-right font-mono">RWF{item.total_price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Purchase Order Summary */}
                {req.purchase_order && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3">🏢 Purchase Order Generated</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">PO Number:</span>
                        <div className="font-mono text-gray-900 break-all">{req.purchase_order.po_number}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Vendor:</span>
                        <div className="text-gray-900 break-words">{req.purchase_order.vendor_name}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                {/* Proforma Document */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">📄 Proforma Document</h3>
                    {req.proforma_file_url && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">Uploaded</span>
                    )}
                  </div>
                  {req.proforma_file_url ? (
                    <div className="space-y-4">
                      <DocumentViewer url={req.proforma_file_url} />
                      {canEdit && (
                        <Upload
                          label="Replace Document"
                          accept="application/pdf,image/*"
                          onSelect={() => {}}
                          onUpload={async (file, onProgress) => {
                            if (!id) return;
                            await fileService.uploadTo(`/requests/${id}/upload_proforma/`, file, { onProgress });
                            toast.success('Document uploaded successfully');
                            await load();
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <div className="text-gray-400 mb-3">📄</div>
                      <p className="text-gray-500 mb-4">No document uploaded</p>
                      {canEdit && (
                        <Upload
                          label="Upload Document"
                          accept="application/pdf,image/*"
                          onSelect={() => {}}
                          onUpload={async (file, onProgress) => {
                            if (!id) return;
                            await fileService.uploadTo(`/requests/${id}/upload_proforma/`, file, { onProgress });
                            toast.success('Document uploaded successfully');
                            await load();
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* AI Processing Status for Proforma */}
                {req.proforma_metadata && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3">🤖 AI Processing Status</h4>
                    <DocumentProcessingStatus metadata={req.proforma_metadata} />
                  </div>
                )}

                {/* Receipt Document */}
                {req.receipt_file_url && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">🧾 Receipt</h3>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">Uploaded</span>
                    </div>
                    <DocumentViewer url={req.receipt_file_url} />
                    
                    {/* Receipt Processing Status */}
                    {req.purchase_order && req.receipt_submitted && !req.receipt_metadata && (
                      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                          <span className="text-yellow-800 font-medium">🤖 AI Processing in Progress</span>
                        </div>
                        <p className="text-yellow-700 text-sm mb-3">Receipt is being processed by AI...</p>
                        <button onClick={load} className="btn-secondary text-sm">🔄 Refresh Status</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Proof */}
                {req.payment_proof_url && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">💳 Payment Proof</h3>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">Uploaded</span>
                    </div>
                    <DocumentViewer url={req.payment_proof_url} />
                  </div>
                )}

                {/* Purchase Order Document */}
                {req.purchase_order?.po_document && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">🏢 Purchase Order Document</h3>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">Generated</span>
                    </div>
                    <a
                      href={req.purchase_order.po_document}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary w-full text-center"
                    >
                      📄 Download PO Document
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'validation' && (
              <div className="space-y-6">
                {req.receipt_metadata && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">🔍 Receipt Validation</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Validation Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          req.receipt_metadata.validation_status === 'valid' ? 'bg-green-100 text-green-800' :
                          req.receipt_metadata.validation_status === 'discrepancy' ? 'bg-yellow-100 text-yellow-800' :
                          req.receipt_metadata.validation_status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {req.receipt_metadata.validation_status}
                        </span>
                      </div>
                      
                      {req.receipt_metadata.discrepancies.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="font-medium text-red-800 mb-2">⚠️ Issues Found:</h4>
                          <ul className="space-y-1">
                            {req.receipt_metadata.discrepancies.map((issue, index) => (
                              <li key={index} className="text-red-700 text-sm">
                                • <strong>{issue.type.replace('_', ' ')}:</strong> Expected "{issue.expected}", Got "{issue.actual}"
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        {req.receipt_metadata.vendor_name && (
                          <div className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium text-gray-700">Receipt Vendor:</span>
                            <span className="text-gray-900 break-words">{req.receipt_metadata.vendor_name}</span>
                          </div>
                        )}
                        {req.receipt_metadata.total_amount && (
                          <div className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium text-gray-700">Receipt Amount:</span>
                            <span className="text-gray-900 font-mono">RWF{req.receipt_metadata.total_amount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {req.purchase_order && req.receipt_metadata && (
                  <POReceiptComparison 
                    purchaseOrder={req.purchase_order}
                    receiptMetadata={req.receipt_metadata}
                  />
                )}
              </div>
            )}

            {activeTab === 'approvals' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Approval History</h3>
                {req.approvals?.length ? (
                  <div className="space-y-4">
                    {req.approvals.map((approval) => (
                      <div key={approval.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                              Level {approval.level}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              approval.action === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {approval.action}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(approval.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Approver:</span> {approval.approver_details?.username || approval.approver}
                        </p>
                        {approval.comment && (
                          <div className="bg-gray-50 rounded-lg p-3 mt-2">
                            <p className="text-sm text-gray-700 italic break-words">"{approval.comment}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">📋</div>
                    <p className="text-gray-500">No approvals yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="space-y-6">
                {/* Finance Payment Management */}
                {isFinance && req.status === 'approved' && (
                  <PaymentManager request={req} onUpdate={load} />
                )}

                {/* Approval Actions */}
                {canApprove && !req.clarification_requested && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">✔️ Review Request</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comment (Optional)
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                          rows={3}
                          placeholder="Add your review comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          className="bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium transition-colors order-2 sm:order-1"
                          onClick={() => doAction('reject')}
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Processing...' : '❌ Reject'}
                        </button>
                        <button
                          className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors order-1 sm:order-2"
                          onClick={() => doAction('approve')}
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Processing...' : '✔️ Approve'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
