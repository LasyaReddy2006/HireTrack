import axios from 'axios';

/**
 * Centralized Axios Instance for HireTrack
 * 
 * Why this is standard in software development:
 * 1. Base URL is configured in one place from environment variables.
 * 2. Request Interceptor automatically attaches the JWT Bearer token to every HTTP request.
 * 3. Response Interceptor handles centralized error responses (like 401 Unauthorized token expiry).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hiretrack_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If token has expired or is invalid (401), clear local storage
    if (error.response && error.response.status === 401) {
      // Clear token only if we're not already on the login or register page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('hiretrack_token');
        localStorage.removeItem('hiretrack_user');
        // Optional redirect if needed
      }
    }
    return Promise.reject(error);
  }
);

export default api;
