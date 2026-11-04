import apiClient from './client';

export const interviewsAPI = {
  getQuestionSets: async (params = {}) => {
    const response = await apiClient.get('/interviews/', { params });
    return response.data;
  },

  getQuestionSet: async (id) => {
    const response = await apiClient.get(`/interviews/${id}/`);
    return response.data;
  },

  generateQuestions: async (payload) => {
    const response = await apiClient.post('/interviews/generate/', payload);
    return response.data;
  },

  updateQuestionSet: async (id, data) => {
    const response = await apiClient.patch(`/interviews/${id}/`, data);
    return response.data;
  },

  deleteQuestionSet: async (id) => {
    const response = await apiClient.delete(`/interviews/${id}/`);
    return response.data;
  },
};
