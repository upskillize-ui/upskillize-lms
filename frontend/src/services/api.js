/**
 * services/api.js — FIXED
 *
 * ISSUE: Authorization header not being sent
 * CAUSE: API interceptor not adding token to requests
 * FIX: Added request interceptor to attach token
 */

import axios from "axios";

// ✅ Create API instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ REQUEST INTERCEPTOR - Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or sessionStorage
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("authToken") ||
      sessionStorage.getItem("token");

    if (token) {
      // ✅ Add Authorization header
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[API] ✓ Token attached to request:", config.url);
    } else {
      console.warn("[API] ⚠ No token found for request:", config.url);
    }

    return config;
  },
  (error) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  },
);

// ✅ RESPONSE INTERCEPTOR - Handle errors and auth failures
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    // ✅ Handle 401 - Token expired/invalid
    if (status === 401) {
      console.error("[API] 401 Unauthorized:", message);

      // Clear stored token
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("token");

      // Redirect to login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // ✅ Handle 403 - Forbidden/Permission denied
    if (status === 403) {
      console.error("[API] 403 Forbidden:", message);
    }

    // ✅ Handle 404 - Not found
    if (status === 404) {
      console.warn("[API] 404 Not Found:", error.config.url);
    }

    return Promise.reject(error);
  },
);

export default api;
