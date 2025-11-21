import React, { useState } from 'react';
import { requestService } from '../services/requests';
import type { PurchaseRequest, PaymentStatus } from '../types';
import toast from 'react-hot-toast';

interface PaymentManagerProps {
  request: PurchaseRequest;
  onUpdate: () => void;
}

export const PaymentManager: React.FC<PaymentManagerProps> = ({ request, onUpdate }) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(request.payment_status);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await requestService.updatePaymentStatus(request.id, paymentStatus, paymentProof || undefined);
      toast.success('Payment status updated successfully!');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="card">
      <h3 className="font-semibold mb-4">Payment Management</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Status
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="pending">Pending Payment</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Proof (Optional)
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <button
          onClick={handleStatusUpdate}
          disabled={updating}
          className="btn-primary disabled:opacity-50"
        >
          {updating ? 'Updating...' : 'Update Payment Status'}
        </button>
      </div>
    </div>
  );
};
