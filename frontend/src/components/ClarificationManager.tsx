import React, { useState } from 'react';
import { requestService } from '../services/requests';
import type { PurchaseRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface ClarificationManagerProps {
  request: PurchaseRequest;
  onUpdate: () => void;
}

export const ClarificationManager: React.FC<ClarificationManagerProps> = ({ request, onUpdate }) => {
  const { isApprover } = useAuth();
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestClarification = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      await requestService.requestClarification(request.id, message.trim());
      toast.success('Clarification requested successfully!');
      setMessage('');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to request clarification');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToClarification = async () => {
    if (!response.trim()) return;
    
    setLoading(true);
    try {
      await requestService.respondToClarification(request.id, response.trim());
      toast.success('Response submitted successfully!');
      setResponse('');
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit response');
    } finally {
      setLoading(false);
    }
  };

  if (request.clarification_requested && !isApprover) {
    // Staff view - respond to clarification
    return (
      <div className="card bg-yellow-50 border-yellow-200">
        <h3 className="font-semibold text-yellow-800 mb-2">Clarification Required</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2">Message from approver:</p>
          <p className="text-gray-900 bg-white p-3 rounded border">{request.clarification_message}</p>
        </div>
        
        <div className="space-y-3">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Provide the requested information..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleRespondToClarification}
            disabled={loading || !response.trim()}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Response'}
          </button>
        </div>
      </div>
    );
  }

  if (isApprover && request.status === 'pending') {
    // Approver view - request clarification
    return (
      <div className="card">
        <h3 className="font-semibold mb-4">Request More Information</h3>
        <div className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What additional information do you need?"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleRequestClarification}
            disabled={loading || !message.trim()}
            className="btn-secondary disabled:opacity-50"
          >
            {loading ? 'Requesting...' : 'Request Clarification'}
          </button>
        </div>
      </div>
    );
  }

  return null;
};
