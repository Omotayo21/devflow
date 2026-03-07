import api from './axios';

export const taskApi = {
  getByProject: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }).then(res => res.data),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data).then(res => res.data),
  update: (projectId, taskId, data) => api.patch(`/projects/${projectId}/tasks/${taskId}`, data).then(res => res.data),
  delete: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`).then(res => res.data),
  
  // Comments
  getComments: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}/comments`).then(res => res.data),
  addComment: (projectId, taskId, data) => api.post(`/projects/${projectId}/tasks/${taskId}/comments`, data).then(res => res.data),
  deleteComment: (projectId, taskId, commentId) => api.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`).then(res => res.data),
};
