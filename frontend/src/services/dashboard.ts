// services/dashboard.ts
import api from './api';

interface DashboardStats {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/requests/');
    const data = response.data;
    
    // Log the actual structure to see what we're getting
    console.log('API response structure:', data);
    
    // Handle paginated response (common Django REST pattern)
    const requests = data.results || data;
    
    if (!Array.isArray(requests)) {
      console.error('Requests is not an array:', requests);
      return {
        total_requests: 0,
        pending_requests: 0,
        approved_requests: 0,
        rejected_requests: 0,
      };
    }
    
    return {
      total_requests: requests.length,
      pending_requests: requests.filter((r: any) => r.status === 'pending').length,
      approved_requests: requests.filter((r: any) => r.status === 'approved').length,
      rejected_requests: requests.filter((r: any) => r.status === 'rejected').length,
    };
  }
};
