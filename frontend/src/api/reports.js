import apiClient from './client';

export const reportsAPI = {
  getDashboard: async () => {
    const response = await apiClient.get('/dashboard/');
    return response.data;
  },

  getApplicationReports: async (params = {}) => {
    const response = await apiClient.get('/reports/applications/', { params });
    return response.data;
  },

  getJobReports: async (params = {}) => {
    const response = await apiClient.get('/reports/jobs/', { params });
    return response.data;
  },

  getAIAnalysisReports: async (params = {}) => {
    const response = await apiClient.get('/reports/ai-analyses/', { params });
    return response.data;
  },

  downloadCSV: (endpoint, filename) => {
    const token = localStorage.getItem('hiresmart_token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const url = `${baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}export=csv`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      })
      .catch((err) => console.error('CSV export failed:', err));
  },
};
