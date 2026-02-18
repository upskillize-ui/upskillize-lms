import axios from 'axios';

// API Base URL - hardcoded fallback to avoid process error
const API_BASE_URL = window.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`✅ API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    // Log error response
    console.error('❌ API Error:', error.response?.data || error.message);

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          console.error('🔒 Unauthorized - Invalid or expired token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Only redirect if not already on login page
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
      // Request made but no response received
      console.error('📡 Network Error - No response from server');
      console.error('Is the backend running on', API_BASE_URL, '?');
    } else {
      // Error in request setup
      console.error('⚙️ Request Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };