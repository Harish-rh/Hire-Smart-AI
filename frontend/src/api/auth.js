import apiClient from './client';

export const authAPI = {
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login/', { username, password });
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout/');
    } finally {
      localStorage.removeItem('hiresmart_token');
      localStorage.removeItem('hiresmart_refresh');
      localStorage.removeItem('hiresmart_user');
    }
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.patch('/auth/me/', data);
    return response.data;
  },

  changePassword: async (old_password, new_password) => {
    const response = await apiClient.post('/auth/change-password/', {
      old_password,
      new_password,
    });
    return response.data;
  },

  getUsers: async () => {
    const response = await apiClient.get('/auth/users/');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await apiClient.post('/auth/users/', userData);
    return response.data;
  },
};
