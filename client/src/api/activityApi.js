import api from './axios';

export const activityApi = {
  getWorkspaceActivity: (workspaceId, params) => 
    api.get(`/workspaces/${workspaceId}/activities`, { params }).then(res => res.data),
};
