import api from './api';
import type { User } from '../types';

export const userService = {
  async updateProfile(data: { first_name: string; last_name: string; email: string }): Promise<User> {
    const response = await api.put<User>('/auth/profile/', data);
    return response.data;
  },

  async changePassword(data: { old_password: string; new_password: string }): Promise<void> {
    await api.post('/auth/change-password/', data);
  }
};
