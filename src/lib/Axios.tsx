import axios from 'axios';

const api = axios.create({
  // With Vite proxy, /api/* → om-laravel.test/api/* — no cross-origin, cookies work
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,  // Send session cookie on every request
});

// Response interceptor — 401 = session expired → redirect to login
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
