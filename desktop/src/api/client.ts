import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { StorageService } from "../services/StorageService";
import { getOrCreateDeviceId } from "../utils/deviceId";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookie handling for deviceVerified cookie
});

// Request Interceptor: Inject Auth Bearer token from secure storage and device info
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await StorageService.getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Get the persistent device ID for this desktop installation
    const deviceId = getOrCreateDeviceId();

    // Send device information with each request for proper device verification
    config.headers["x-device-type"] = "desktop";
    config.headers["x-device-model"] = deviceId;
    config.headers["x-device-id"] = deviceId;
    config.headers["x-os-version"] =
      `${navigator.platform} (${navigator.userAgent.split(")")[0]})`;

    return config;
  },
  (error) => Promise.reject(error),
);

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  rawData?: unknown;
}

// Response Interceptor: Flexiti standard error parsing
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    let message = "An unexpected network error occurred.";

    if (error.response) {
      message =
        error.response.data?.error ||
        error.response.data?.message ||
        `HTTP ${error.response.status} Error`;
    } else if (error.request) {
      message = "Server is unreachable. Operating in offline mode.";
    } else {
      message = error.message || message;
    }

    return Promise.reject({
      success: false,
      error: message,
      status: error.response?.status,
      rawData: error.response?.data,
    });
  },
);
