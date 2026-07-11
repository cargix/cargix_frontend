import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cargix_user');
    const token  = localStorage.getItem('cargix_token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        clearStorage();
      }
    }
    setLoading(false);
  }, []);

  const clearStorage = () => {
    localStorage.removeItem('cargix_user');
    localStorage.removeItem('cargix_token');
  };

  const saveSession = (userData) => {
    localStorage.setItem('cargix_token', userData.token);
    localStorage.setItem('cargix_user', JSON.stringify(userData));
    setUser(userData);
    setError(null);
  };

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      saveSession(data.data);
      return { success: true, user: data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', formData);
      return { success: true, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('cargix_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isAdmin   = user?.role === 'admin';
  const isCompany = user?.role === 'company';

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, updateUser, isAdmin, isCompany }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
