import api from './api';

export const profileService = {
  // Get logged-in user profile details and stats
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  // Update profile name and optionally password
  async updateProfile(data) {
    const response = await api.put('/profile', data);
    return response.data;
  }
};
