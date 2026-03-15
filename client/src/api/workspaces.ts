import api from './axios';
import { ApiResponse, Workspace } from '../types';

export const getWorkspaces = async (): Promise<ApiResponse<Workspace[]>> => {
  const { data } = await api.get('/workspaces');
  return data;
};

export const getWorkspaceById = async (id: string): Promise<ApiResponse<Workspace>> => {
  const { data } = await api.get(`/workspaces/${id}`);
  return data;
};

export const createWorkspace = async (workspace: { name: string, description?: string }): Promise<ApiResponse<Workspace>> => {
  const { data } = await api.post('/workspaces', workspace);
  return data;
};

export const getWorkspaceMembers = async (workspaceId: string): Promise<ApiResponse<{ members: any[] }>> => {
  const { data } = await api.get(`/workspaces/${workspaceId}/members`);
  return data;
};

export const inviteMember = async (workspaceId: string, email: string, role: string): Promise<ApiResponse<any>> => {
  const { data } = await api.post(`/workspaces/${workspaceId}/invite`, { email, role });
  return data;
};
