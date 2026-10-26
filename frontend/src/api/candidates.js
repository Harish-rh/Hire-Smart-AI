import apiClient from './client';

export const candidatesAPI = {
  getCandidates: async (params = {}) => {
    const response = await apiClient.get('/candidates/', { params });
    return response.data;
  },

  getCandidate: async (id) => {
    const response = await apiClient.get(`/candidates/${id}/`);
    return response.data;
  },

  createCandidate: async (candidateData) => {
    const response = await apiClient.post('/candidates/', candidateData);
    return response.data;
  },

  updateCandidate: async (id, candidateData) => {
    const response = await apiClient.patch(`/candidates/${id}/`, candidateData);
    return response.data;
  },

  deleteCandidate: async (id) => {
    const response = await apiClient.delete(`/candidates/${id}/`);
    return response.data;
  },

  uploadResume: async (id, file) => {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await apiClient.post(`/candidates/${id}/upload-resume/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getResumeText: async (id) => {
    const response = await apiClient.get(`/candidates/${id}/resume-text/`);
    return response.data;
  },
};
