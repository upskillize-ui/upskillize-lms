import axios from "axios";

// Profile Agent API — deployed on Hugging Face Spaces
const PROFILE_API_URL =
  import.meta.env.VITE_PROFILE_API_URL || "https://upskill25-ai-enhancer.hf.space";

const profileApi = axios.create({
  baseURL: PROFILE_API_URL,
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

// Attach the same JWT token from localStorage
profileApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-retry once on timeout (HF Spaces may sleep)
profileApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === "ECONNABORTED" && !error.config._retry) {
      console.warn("Profile agent waking up, retrying...");
      error.config._retry = true;
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return profileApi(error.config);
    }
    return Promise.reject(error);
  }
);

export const generateProfile = (forceRegenerate = false) =>
  profileApi.post("/api/v1/profile/generate", {
    force_regenerate: forceRegenerate,
  });

export const getMyProfile = () =>
  profileApi.get("/api/v1/profile/me");

export const toggleVisibility = (visibility) =>
  profileApi.post("/api/v1/profile/toggle-visibility", { visibility });

export const getPublicProfile = (slug) =>
  profileApi.get(`/api/v1/profile/public/${slug}`);

export default profileApi;
