import api from './axios';
import { ApiResponse, Task, Comment } from '../types';

export const getTasks = async (projectId: string, params?: any): Promise<ApiResponse<{ tasks: Task[] }>> => {
  const response = await api.get(`/projects/${projectId}/tasks`, { params });
  return response.data;
};

export const createTask = async (projectId: string, data: Partial<Task>): Promise<ApiResponse<{ task: Task }>> => {
  const response = await api.post(`/projects/${projectId}/tasks`, data);
  return response.data;
};

export const updateTask = async (projectId: string, taskId: string, data: Partial<Task>): Promise<ApiResponse<{ task: Task }>> => {
  const response = await api.patch(`/projects/${projectId}/tasks/${taskId}`, data);
  return response.data;
};

export const deleteTask = async (projectId: string, taskId: string): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
  return response.data;
};

export const getComments = async (projectId: string, taskId: string): Promise<ApiResponse<{ comments: Comment[] }>> => {
  const response = await api.get(`/projects/${projectId}/tasks/${taskId}/comments`);
  return response.data;
};

export const addComment = async (projectId: string, taskId: string, data: Partial<Comment>): Promise<ApiResponse<{ comment: Comment }>> => {
  const response = await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, data);
  return response.data;
};

export const deleteComment = async (projectId: string, taskId: string, commentId: string): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`);
  return response.data;
};
