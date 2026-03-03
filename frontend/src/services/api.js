import axios from 'axios';

// Auto-switches: localhost in dev, live URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://upskillize-lms-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL, // ✅ FIXED: was using import.meta.env directly, now uses the fallback variable
  timeout: 60000,        // ✅ 60s handles Render cold starts
  headers: { 'Content-Type': 'application/json' }
});

// ─────────────────────────────────────────
// REQUEST INTERCEPTOR — attach token + log
// ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Only log in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`🌐 Base URL: ${API_BASE_URL}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────
// RESPONSE INTERCEPTOR — error handling + retry
// ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', error.response?.data || error.message);
    }

    // ✅ Auto-retry ONCE on timeout — handles Render cold start wakeup
    if (error.code === 'ECONNABORTED' && !error.config._retry) {
      console.warn('⏳ Request timed out — server may be waking up, retrying...');
      error.config._retry = true;
      // Wait 3 seconds before retry — gives server time to wake
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return api(error.config);
    }

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.error('🔒 Unauthorized - token expired or invalid');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Only redirect if not already on login/register page
          if (
            window.location.pathname !== '/login' &&
            window.location.pathname !== '/register'
          ) {
            window.location.href = '/login';
          }
          break;

        case 403:
          console.error('🚫 Forbidden - Insufficient permissions');
          break;

        case 404:
          console.error('🔍 Not Found - Resource does not exist');
          break;

        case 429:
          // ✅ NEW: Handle rate limiting explicitly
          console.error('🛑 Rate Limited - Too many requests');
          error.message = 'Too many attempts. Please wait a moment and try again.';
          break;

        case 500:
          console.error('💥 Server Error - Something went wrong on the server');
          break;

        default:
          console.error(`⚠️ Error ${status}:`, data?.message || 'Unknown error');
      }
    } else if (error.request) {
      // ✅ Network error — no response at all
      console.error('📡 Network Error - No response from server');
      console.error('🌐 API URL:', API_BASE_URL);
      error.message = 'Cannot connect to server. Please check your internet connection.';
    } else {
      console.error('⚙️ Request Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };