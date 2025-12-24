// lib/axios.ts
import axios from "axios";

// export const API_BASE_URL = "http://localhost:3000/api/";
export const API_BASE_URL = "https://api.tushevents.online/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to get token from auth storage
const getTokenFromStorage = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const authData = localStorage.getItem("auth-storage");
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.state?.token || null;
    }
  } catch (error) {
    console.error("Error reading auth token:", error);
  }
  return null;
};

// Helper function to get refresh token from auth storage
const getRefreshTokenFromStorage = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const authData = localStorage.getItem("auth-storage");
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.state?.refreshToken || null;
    }
  } catch (error) {
    console.error("Error reading refresh token:", error);
  }
  return null;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromStorage();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't handle auth errors for login requests
    if (originalRequest.url?.includes("/auth/login")) {
      return Promise.reject(error);
    }

    // Handle token expiration (401) for other requests
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshTokenFromStorage();
        if (refreshToken) {
          // Try to refresh token
          const response = await api.post("/auth/refresh-token", {
            refreshToken: refreshToken,
          });
          const newToken = response.data.token;
          const newRefreshToken = response.data.refreshToken;

          localStorage.setItem(newRefreshToken, "auth-token");

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // No refresh token available, redirect to login
          redirectToLogin();
        }
      } catch (refreshError) {
        console.log("Token refresh failed, logging out user");
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    // Handle other auth errors
    if (
      (error.response?.status === 403 || error.response?.status === 401) &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      console.log("Auth error detected, logging out user");
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

// Function to redirect to login page
const redirectToLogin = () => {
  // Clear auth data using the store's logout method
  if (typeof window !== "undefined") {
    // Import and use the store's logout function

    // Redirect to login page
    window.location.href = "/signin";
  }
};

export default api;
