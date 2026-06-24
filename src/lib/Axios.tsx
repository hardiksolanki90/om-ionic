import axios from 'axios';

const api = axios.create({
  // With Vite proxy, /api/* → om-laravel.test/api/* — no cross-origin, cookies work
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Response interceptor — 401 on authenticated requests = session expired → redirect to login.
// Skip /admin/me (session probe on refresh) so ProtectedRoute handles the unauthenticated state
// instead of hard-navigating and causing a login flash on every refresh.
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const url: string = error.config?.url ?? ''
    const isSessionProbe = url.includes('/admin/me')
    const isAuthRoute = window.location.pathname === '/login'
    if (error.response?.status === 401 && !isSessionProbe && !isAuthRoute) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
