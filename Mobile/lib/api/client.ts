import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../auth/secure-store';

import { Platform } from 'react-native';

// Set the base API URL (could be injected via environment variable EXPO_PUBLIC_API_URL)
// Remember: For physical devices and Emulators, using the precise Wi-Fi IPv4 address is the most reliable method.
const fallbackUrl = 'http://192.168.0.171:5000/api';
const API_URL = process.env.EXPO_PUBLIC_API_URL || fallbackUrl;

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: any) => void }> = [];

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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
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
          throw new Error('No refresh token available');
        }

        // Use base axios to bypass the interceptors so we don't end up in an infinite loop
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        // The exact structure depends on our API response formatting
        const newAccessToken = response.data?.data?.accessToken || response.data?.accessToken;
        const newRefreshToken = response.data?.data?.refreshToken || response.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error('Failed to get new access token');
        }

        await setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);
        
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearTokens();
        // Future: Trigger app state reset/navigation to Login screen
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
