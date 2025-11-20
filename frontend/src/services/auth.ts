import api from './api';
import type { LoginCredentials, AuthResponse, User } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await api.post<AuthResponse>('/auth/login/', credentials);
      const { access, refresh, user } = response.data;
      
      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  },

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return null;

      const response = await api.post('/auth/refresh/', {
        refresh: refreshToken
      });
      
      const { access } = response.data;
      localStorage.setItem('access_token', access);
      
      return access;
    } catch (error) {
      // Refresh failed, logout user
      authService.logout();
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }
};
