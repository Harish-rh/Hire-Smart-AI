import apiClient from './client';

export const applicationsAPI = {
  getApplications: async (params = {}) => {
    const response = await apiClient.get('/applications/', { params });
    return response.data;
  },

  getApplication: async (id) => {
    const response = await apiClient.get(`/applications/${id}/`);
    return response.data;
  },

  createApplication: async (applicationData) => {
    const response = await apiClient.post('/applications/', applicationData);
    return response.data;
  },

  updateApplication: async (id, data) => {
    const response = await apiClient.patch(`/applications/${id}/`, data);
    return response.data;
  },

  updateStatus: async (id, status, notes = '') => {
    const response = await apiClient.patch(`/applications/${id}/status/`, {
      status,
      notes,
    });
    return response.data;
  },

  getApplicationHistory: async (id) => {
    const response = await apiClient.get(`/applications/${id}/history/`);
    return response.data;
  },
};
