import axios from 'axios';

// Use environment variable for API base URL
// VITE_API_URL can be set in .env.local or .env.production
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

console.log('🌐 API Base URL:', baseURL);

// ── Request interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cargix_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cargix_token');
      localStorage.removeItem('cargix_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
