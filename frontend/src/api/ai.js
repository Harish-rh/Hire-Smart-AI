import apiClient from './client';

export const aiAPI = {
  getHealth: async () => {
    const response = await apiClient.get('/ai/health/');
    return response.data;
  },

  getAnalyses: async (params = {}) => {
    const response = await apiClient.get('/analyses/', { params });
    return response.data;
  },

  getAnalysis: async (id) => {
    const response = await apiClient.get(`/analyses/${id}/`);
    return response.data;
  },

  analyzeApplication: async (applicationId) => {
    const response = await apiClient.post(`/applications/${applicationId}/analyze/`);
    return response.data;
  },

  retryAnalysis: async (analysisId) => {
    const response = await apiClient.post(`/analyses/${analysisId}/retry/`);
    return response.data;
  },
};
