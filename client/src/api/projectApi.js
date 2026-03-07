import api from './axios';

export const projectApi = {
  getByWorkspace: (workspaceId) => api.get(`/workspaces/${workspaceId}/projects`).then(res => res.data),
  getById: (workspaceId, projectId) => api.get(`/workspaces/${workspaceId}/projects/${projectId}`).then(res => res.data),
  create: (workspaceId, data) => api.post(`/workspaces/${workspaceId}/projects`, data).then(res => res.data),
  update: (workspaceId, projectId, data) => api.patch(`/workspaces/${workspaceId}/projects/${projectId}`, data).then(res => res.data),
};
