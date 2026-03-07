import api from './axios';

export const userApi = {
  getProfile: () => api.get('/auth/profile').then(res => res.data), // Assuming backend has profile or use user from store
  updateProfile: (data) => api.patch('/auth/profile', data).then(res => res.data),
  changePassword: (data) => api.patch('/auth/change-password', data).then(res => res.data),
};
