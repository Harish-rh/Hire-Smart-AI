import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('hiresmart_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('hiresmart_token'));
  const [loading, setLoading] = useState(true);

  // Validate session on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('hiresmart_token');
      if (storedToken) {
        try {
          const freshUser = await authAPI.getMe();
          setUser(freshUser);
          localStorage.setItem('hiresmart_user', JSON.stringify(freshUser));
        } catch (err) {
          console.error("Token verification failed:", err);
          localStorage.removeItem('hiresmart_token');
          localStorage.removeItem('hiresmart_refresh');
          localStorage.removeItem('hiresmart_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    const data = await authAPI.login(username, password);
    localStorage.setItem('hiresmart_token', data.access);
    localStorage.setItem('hiresmart_refresh', data.refresh);
    localStorage.setItem('hiresmart_user', JSON.stringify(data.user));
    setToken(data.access);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('hiresmart_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'ADMIN' || user?.is_admin,
    isRecruiter: user?.role === 'RECRUITER' || user?.role === 'ADMIN',
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
