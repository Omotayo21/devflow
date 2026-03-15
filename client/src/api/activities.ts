import api from './axios';
import { ApiResponse, Activity } from '../types';

export const getWorkspaceActivity = async (workspaceId: string, params?: any): Promise<ApiResponse<{ activities: Activity[] }>> => {
  const response = await api.get(`/workspaces/${workspaceId}/activities`, { params });
  return response.data;
};
