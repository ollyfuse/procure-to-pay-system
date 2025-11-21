import api from './api';
import type { PurchaseRequest } from '../types';

export const requestService = {
  async getRequests(): Promise<PurchaseRequest[]> {
    const response = await api.get('/requests/');
    return response.data.results || [];
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
    console.log('Approving request:', id, 'with data:', data);
    console.log('Full URL:', `/requests/${id}/approve/`);
    const response = await api.patch(`/requests/${id}/approve/`, data);
    console.log('Response:', response);
    },
    
    async getMyApprovals(): Promise<PurchaseRequest[]> {
    const response = await api.get('/requests/my_approvals/');
    return response.data.results || response.data;
    },

  async rejectRequest(id: string, data?: { comment?: string }): Promise<void> {
    await api.patch(`/requests/${id}/reject/`, data);
  },
  async uploadProforma(id: string, file: File): Promise<PurchaseRequest> {
    const formData = new FormData();
    formData.append('proforma_file', file);
    
    const response = await api.post(`/requests/${id}/upload-proforma/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
