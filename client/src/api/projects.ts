import api from './axios';
import { ApiResponse, Project } from '../types';

export const getProjects = async (workspaceId: string): Promise<ApiResponse<{ projects: Project[] }>> => {
  const response = await api.get(`/workspaces/${workspaceId}/projects`);
  return response.data;
};

export const getProjectById = async (workspaceId: string, projectId: string): Promise<ApiResponse<{ project: Project }>> => {
  const response = await api.get(`/workspaces/${workspaceId}/projects/${projectId}`);
  return response.data;
};

export const createProject = async (workspaceId: string, data: Partial<Project>): Promise<ApiResponse<{ project: Project }>> => {
  const response = await api.post(`/workspaces/${workspaceId}/projects`, data);
  return response.data;
};

export const updateProject = async (workspaceId: string, projectId: string, data: Partial<Project>): Promise<ApiResponse<{ project: Project }>> => {
  const response = await api.patch(`/workspaces/${workspaceId}/projects/${projectId}`, data);
  return response.data;
};

export const deleteProject = async (workspaceId: string, projectId: string): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/workspaces/${workspaceId}/projects/${projectId}`);
  return response.data;
};

