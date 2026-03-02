import axios from 'axios';

// Auto-switches: localhost in dev, live URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://upskillize-lms-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // ✅ 60s to handle Render free tier cold starts
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`🌐 Base URL: ${API_BASE_URL}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - global error handling + retry on timeout
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);

    // ✅ Auto-retry once on timeout (handles Render cold start)
    if (error.code === 'ECONNABORTED' && !error.config._retry) {
      console.warn('⏳ Request timed out — server may be waking up, retrying...');
      error.config._retry = true;
      return api(error.config);
    }

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.error('🔒 Unauthorized - Invalid or expired token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;

        case 403:
          console.error('🚫 Forbidden - Insufficient permissions');
          break;

        case 404:
          console.error('🔍 Not Found - Resource does not exist');
          break;

        case 500:
          console.error('💥 Server Error - Something went wrong on the server');
          break;

        default:
          console.error(`⚠️ Error ${status}:`, data?.message || 'Unknown error');
      }
    } else if (error.request) {
      console.error('📡 Network Error - No response from server');
      console.error('🌐 API URL:', API_BASE_URL);
    } else {
      console.error('⚙️ Request Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };