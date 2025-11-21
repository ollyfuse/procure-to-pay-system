import api from './api';
import type { PurchaseRequest } from '../types';

export const requestService = {
  async getRequests(): Promise<PurchaseRequest[]> {
    const response = await api.get('/requests/');
    // Handle both paginated and non-paginated responses
    return response.data.results || response.data;
  },

  async getRequest(id: string): Promise<PurchaseRequest> {
    const response = await api.get(`/requests/${id}/`);
    return response.data;
  },

  async createRequest(data: Partial<PurchaseRequest>): Promise<PurchaseRequest> {
    const response = await api.post('/requests/', data);
    return response.data;
  },

  async updateRequest(id: string, data: Partial<PurchaseRequest>): Promise<PurchaseRequest> {
    const response = await api.patch(`/requests/${id}/`, data);
    return response.data;
  },

  async deleteRequest(id: string): Promise<void> {
    await api.delete(`/requests/${id}/`);
  },

  async approveRequest(id: string, data?: { comment?: string }): Promise<void> {
    await api.patch(`/requests/${id}/approve/`, data);
  },

  async rejectRequest(id: string, data?: { comment?: string }): Promise<void> {
    await api.patch(`/requests/${id}/reject/`, data);
  },

  async getMyApprovals(): Promise<PurchaseRequest[]> {
    const response = await api.get('/requests/my_approvals/');
    // Handle both paginated and non-paginated responses
    return response.data.results || response.data;
  },

  // New methods for enhanced workflow
  async requestClarification(id: string, message: string): Promise<void> {
    await api.post(`/requests/${id}/request_clarification/`, { message });
  },

  async respondToClarification(id: string, response: string): Promise<void> {
    await api.post(`/requests/${id}/respond_to_clarification/`, { response });
  },

  async uploadReceipt(id: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('receipt', file);
    await api.post(`/requests/${id}/upload_receipt/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  async updatePaymentStatus(id: string, paymentStatus: string, paymentProof?: File): Promise<void> {
    const formData = new FormData();
    formData.append('payment_status', paymentStatus);
    if (paymentProof) {
      formData.append('payment_proof', paymentProof);
    }
    await api.patch(`/requests/${id}/update_payment_status/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
