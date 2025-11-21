import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestService } from '../services/requests';
import type { PurchaseRequest } from '../types';
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Request Detail</h1>
          <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
        </div>
        <div className="card text-center py-12">
          <div className="text-gray-500">Loading request details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Request Detail</h1>
          <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
        </div>
        <div className="card text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button className="btn-primary" onClick={load}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!req) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Detail</h1>
          <p className="text-gray-600">ID: {req.id}</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* Clarification Alert */}
      {req.clarification_requested && (
        <ClarificationManager request={req} onUpdate={load} />
      )}

      {/* Receipt Upload Alert */}
      {needsReceipt && (
        <div className="card bg-purple-50 border-purple-200">
          <h3 className="font-semibold text-purple-800 mb-4">Receipt Required</h3>
          <p className="text-purple-700 mb-4">Your request has been paid. Please upload your receipt.</p>
          <ReceiptUpload requestId={req.id} onUploadComplete={load} />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Overview */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{req.title}</h2>
                <p className="text-gray-600 mt-1">
                  Created by {req.created_by_username} • {new Date(req.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={req.status} />
                {req.payment_status !== 'pending' && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    req.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                    req.payment_status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {req.payment_status.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
            
            {req.description && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{req.description}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">${req.total_amount}</div>
              <div className="text-sm text-gray-600">Total Amount</div>
            </div>
          </div>

          {/* Items Table */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Items ({req.items.length})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {req.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">${item.unit_price}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${item.total_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Approvals */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Approval History</h3>
            {req.approvals?.length ? (
              <div className="space-y-3">
                {req.approvals.map((approval) => (
                  <div key={approval.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Level {approval.level}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          approval.action === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {approval.action}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(approval.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      By: {approval.approver_details?.username || approval.approver}
                    </p>
                    {approval.comment && (
                      <p className="text-sm text-gray-700 mt-2 italic">"{approval.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No approvals yet</p>
            )}
          </div>
        </div>

        {/* Right Column - Documents & Actions */}
        <div className="space-y-6">
          {/* Proforma Document */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Proforma Document</h3>
            {req.proforma_file_url ? (
              <div className="space-y-3">
                <DocumentViewer url={req.proforma_file_url} />
                {canEdit && (
                  <Upload
                    label="Replace Document"
                    accept="application/pdf,image/*"
                    onSelect={() => {}}
                    onUpload={async (file, onProgress) => {
                      if (!id) return;
                      await fileService.uploadTo(`/requests/${id}/upload_proforma/`, file, {
                        onProgress,
                      });
                      toast.success('Document uploaded successfully');
                      await load();
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-3">No document uploaded</p>
                {canEdit && (
                  <Upload
                    label="Upload Document"
                    accept="application/pdf,image/*"
                    onSelect={() => {}}
                    onUpload={async (file, onProgress) => {
                      if (!id) return;
                      await fileService.uploadTo(`/requests/${id}/upload_proforma/`, file, {
                        onProgress,
                      });
                      toast.success('Document uploaded successfully');
                      await load();
                    }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Receipt Document */}
          {req.receipt_file_url && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Receipt</h3>
              <DocumentViewer url={req.receipt_file_url} />
            </div>
          )}

          {/* Payment Proof */}
          {req.payment_proof_url && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Proof</h3>
              <DocumentViewer url={req.payment_proof_url} />
            </div>
          )}

          {/* Extracted Metadata */}
          {req.proforma_metadata && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Extracted Data</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    req.proforma_metadata.extraction_status === 'success' 
                      ? 'bg-green-100 text-green-800'
                      : req.proforma_metadata.extraction_status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {req.proforma_metadata.extraction_status}
                  </span>
                </div>
                {req.proforma_metadata.vendor_name && (
                  <div>
                    <span className="font-medium text-gray-700">Vendor:</span>
                    <span className="ml-2 text-gray-900">{req.proforma_metadata.vendor_name}</span>
                  </div>
                )}
                {req.proforma_metadata.total_amount && (
                  <div>
                    <span className="font-medium text-gray-700">Amount:</span>
                    <span className="ml-2 text-gray-900">${req.proforma_metadata.total_amount}</span>
                  </div>
                )}
                {req.proforma_metadata.error_message && (
                  <div className="text-red-600 text-xs">
                    Error: {req.proforma_metadata.error_message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Finance Payment Management */}
          {isFinance && req.status === 'approved' && (
            <PaymentManager request={req} onUpdate={load} />
          )}

          {/* Clarification Actions */}
          {(canApprove || req.clarification_requested) && (
            <ClarificationManager request={req} onUpdate={load} />
          )}

          {/* Approval Actions */}
          {canApprove && !req.clarification_requested && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Review Request</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment (Optional)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add your review comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    onClick={() => doAction('reject')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    onClick={() => doAction('approve')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
