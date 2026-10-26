import apiClient from './client';

export const jobsAPI = {
  getJobs: async (params = {}) => {
    const response = await apiClient.get('/jobs/', { params });
    return response.data;
  },

  getJob: async (id) => {
    const response = await apiClient.get(`/jobs/${id}/`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await apiClient.post('/jobs/', jobData);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await apiClient.patch(`/jobs/${id}/`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await apiClient.delete(`/jobs/${id}/`);
    return response.data;
  },

  getJobApplications: async (id) => {
    const response = await apiClient.get(`/jobs/${id}/applications/`);
    return response.data;
  },
};
