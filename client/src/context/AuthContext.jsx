import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on application load
  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem('hiretrack_token');
      const storedUser = localStorage.getItem('hiretrack_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token validity by calling /auth/me
          const response = await authService.getCurrentUser();
          if (response.success && response.user) {
            setUser(response.user);
            localStorage.setItem('hiretrack_user', JSON.stringify(response.user));
          }
        } catch (error) {
          console.warn('Session expired or invalid, logging out:', error);
          logout();
        }
      }
      setLoading(false);
    }

    checkAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('hiretrack_token', data.token);
      localStorage.setItem('hiretrack_user', JSON.stringify(data.user));
    }
    return data;
  };

  // Register handler
  const register = async (name, email, password) => {
    const data = await authService.register(name, email, password);
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('hiretrack_token', data.token);
      localStorage.setItem('hiretrack_user', JSON.stringify(data.user));
    }
    return data;
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hiretrack_token');
    localStorage.removeItem('hiretrack_user');
  };

  // Update current user state (e.g. after profile edit)
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('hiretrack_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume AuthContext cleanly in components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
