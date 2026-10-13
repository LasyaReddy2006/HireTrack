import api from './api';

export const applicationService = {
  // Fetch applications with query parameters (search, status, job_type, sortBy, page, limit)
  async getApplications(params = {}) {
    const response = await api.get('/applications', { params });
    return response.data;
  },

  // Fetch single application by ID
  async getApplicationById(id) {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  // Create a new application
  async createApplication(data) {
    const response = await api.post('/applications', data);
    return response.data;
  },

  // Update existing application by ID
  async updateApplication(id, data) {
    const response = await api.put(`/applications/${id}`, data);
    return response.data;
  },

  // Delete application by ID
  async deleteApplication(id) {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },

  // Get aggregated dashboard statistics
  async getDashboardStats() {
    const response = await api.get('/applications/dashboard/stats');
    return response.data;
  }
};
