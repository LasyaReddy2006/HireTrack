import api from './api';

export const jobService = {
  // Fetch curated job listings with filters
  async getJobListings(params = {}) {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  // Fetch single job listing
  async getJobListingById(id) {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Add listing directly to user's application tracker
  async trackJob(id) {
    const response = await api.post(`/jobs/${id}/track`);
    return response.data;
  }
};
