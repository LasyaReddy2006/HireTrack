import api from './api';

export const authService = {
  // Register a new user
  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  // Log in user
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Get currently authenticated user data
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
