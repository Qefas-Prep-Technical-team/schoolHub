import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../auth/secure-store";
import { authEvents } from "../auth/authEvents";

import { Platform } from "react-native";

// Set the base API URL (could be injected via environment variable EXPO_PUBLIC_API_URL)
const fallbackUrl = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
const API_URL = process.env.EXPO_PUBLIC_API_URL || fallbackUrl;

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 90000, // 90s — allows backend reconnect+retry to complete
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.headers) {
      config.headers["x-device-type"] = "mobile";
      config.headers["x-device-model"] =
        Platform.OS === "ios" ? "iPhone" : "Android Device";
      config.headers["x-os-version"] =
        `${Platform.OS === "ios" ? "iOS" : "Android"} ${Platform.Version}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/password");

    if (isAuthRoute) {
      // Do NOT clear tokens here — clearing on a failed login attempt would
      // erase a valid session if the user has one and just mis-typed their password.
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorMessage = error.response?.data?.message || "";
      const shouldLogoutImmediately = 
        errorMessage.toLowerCase().includes("user account no longer exists") ||
        errorMessage.toLowerCase().includes("session expired") ||
        errorMessage.toLowerCase().includes("device no longer authorized") ||
        errorMessage.toLowerCase().includes("invalid token");

      if (shouldLogoutImmediately) {
        processQueue(error, null);
        await clearTokens();
        authEvents.emit();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Use base axios to bypass the interceptors so we don't end up in an infinite loop
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        // The exact structure depends on our API response formatting
        const newAccessToken =
          response.data?.data?.accessToken || response.data?.accessToken;
        const newRefreshToken =
          response.data?.data?.refreshToken || response.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error("Failed to get new access token");
        }

        await setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearTokens();
        // Token refresh failed — force logout
        authEvents.emit();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
