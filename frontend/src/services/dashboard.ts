// services/dashboard.ts
import api from './api';
import type { PurchaseRequest } from '../types';

interface StaffDashboardStats {
  pending_requests: PurchaseRequest[];
  approved_requests: PurchaseRequest[];
  rejected_requests: PurchaseRequest[];
  receipts_pending: PurchaseRequest[];
}

interface ApproverDashboardStats {
  waiting_for_approval: PurchaseRequest[];
  approved_by_me: PurchaseRequest[];
  rejected_by_me: PurchaseRequest[];
}

interface FinanceDashboardStats {
  awaiting_finance_review: PurchaseRequest[];
  paid_requests: PurchaseRequest[];
  on_hold_requests: PurchaseRequest[];
  missing_receipts: PurchaseRequest[];
}

export const dashboardService = {
  async getStaffStats(): Promise<StaffDashboardStats> {
    const response = await api.get('/requests/');
    const requests = response.data.results || response.data;
    
    return {
      pending_requests: requests.filter((r: PurchaseRequest) => r.status === 'pending'),
      approved_requests: requests.filter((r: PurchaseRequest) => r.status === 'approved'),
      rejected_requests: requests.filter((r: PurchaseRequest) => r.status === 'rejected'),
      receipts_pending: requests.filter((r: PurchaseRequest) => 
        r.payment_status === 'paid' && !r.receipt_submitted && r.receipt_required
      )
    };
  },

  async getApproverStats(): Promise<ApproverDashboardStats> {
    const [pendingResponse, historyResponse] = await Promise.all([
      api.get('/requests/'),
      api.get('/requests/my_approvals/')
    ]);
    
    const pendingRequests = pendingResponse.data.results || pendingResponse.data;
    const myApprovals = historyResponse.data.results || historyResponse.data;
    
    return {
      waiting_for_approval: pendingRequests,
      approved_by_me: myApprovals.filter((r: PurchaseRequest) => 
        r.approvals.some(a => a.action === 'approved')
      ),
      rejected_by_me: myApprovals.filter((r: PurchaseRequest) => 
        r.approvals.some(a => a.action === 'rejected')
      )
    };
  },

  async getFinanceStats(): Promise<FinanceDashboardStats> {
    const response = await api.get('/requests/');
    const requests = response.data.results || response.data;
    
    return {
      awaiting_finance_review: requests.filter((r: PurchaseRequest) => 
        r.status === 'approved' && r.payment_status === 'pending'
      ),
      paid_requests: requests.filter((r: PurchaseRequest) => 
        r.payment_status === 'paid'
      ),
      on_hold_requests: requests.filter((r: PurchaseRequest) => 
        r.payment_status === 'on_hold'
      ),
      missing_receipts: requests.filter((r: PurchaseRequest) => 
        r.payment_status === 'paid' && !r.receipt_submitted && r.receipt_required
      )
    };
  }
};
