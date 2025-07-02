import { apiClient } from './client';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User } from '../types/auth';

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ user: User }>('/users/profile');
    return response.data.user;
  },
};
