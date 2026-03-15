import api from './axios';
import { ApiResponse, User, Workspace } from '../types';

export const login = async (credentials: any): Promise<ApiResponse<{ user: User, accessToken: string }>> => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const register = async (userData: any): Promise<ApiResponse<User>> => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const logout = async (): Promise<ApiResponse<null>> => {
  const { data } = await api.post('/auth/logout');
  return data;
};

export const forgotPassword = async (email: string): Promise<ApiResponse<null>> => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (payload: any): Promise<ApiResponse<null>> => {
  const { data } = await api.post('/auth/reset-password', payload);
  return data;
};
