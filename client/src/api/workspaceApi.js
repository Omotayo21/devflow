import api from './axios';

export const workspaceApi = {
  getAll: () => api.get('/workspaces').then(res => res.data),
  getById: (id) => api.get(`/workspaces/${id}`).then(res => res.data),
  create: (data) => api.post('/workspaces', data).then(res => res.data),
  getMembers: (id) => api.get(`/workspaces/${id}/members`).then(res => res.data),
  invite: (id, data) => api.post(`/workspaces/${id}/invite`, data).then(res => res.data),
};
