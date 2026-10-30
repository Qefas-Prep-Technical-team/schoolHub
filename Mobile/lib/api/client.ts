import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../auth/secure-store";
import { authEvents } from "../auth/authEvents";
import { networkEvents } from "./networkEvents";

import { Platform, AppState, AppStateStatus } from "react-native";
import * as Device from 'expo-device';

// Set the base API URL (could be injected via environment variable EXPO_PUBLIC_API_URL)
const fallbackUrl = 'http://192.168.0.182:5000/api'; // Local backend IP from ipconfig
const API_URL = process.env.EXPO_PUBLIC_API_URL || fallbackUrl;

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15s — allows backend reconnect+retry to complete
  headers: {
    "Content-Type": "application/json",
  },
});

// Single-flight refresh promise for mobile
let refreshPromise: Promise<string> | null = null;

// Definitive terminal error codes
const TERMINAL_AUTH_CODES = new Set([
  "NO_REFRESH_TOKEN",
  "REFRESH_INVALID",
  "REFRESH_EXPIRED",
  "REFRESH_REUSED",
  "USER_INACTIVE",
  "DEVICE_UNAUTHORIZED",
  "NO_SESSION_ROW",
]);

/**
 * Execute a single-flight token refresh on Mobile.
 */
export async function executeMobileRefreshToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw { isTerminalAuth: true, code: "NO_REFRESH_TOKEN", message: "No refresh token available" };
      }

      // Use raw axios to bypass interceptor recursion
      const response = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken,
      });

      const newAccessToken =
        response.data?.data?.accessToken || response.data?.accessToken;
      const newRefreshToken =
        response.data?.data?.refreshToken || response.data?.refreshToken || refreshToken;

      if (!newAccessToken) {
        throw new Error("Failed to get new access token");
      }

      await setTokens(newAccessToken, newRefreshToken);
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
      return newAccessToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.headers) {
      config.headers["x-device-type"] = "mobile";
      const deviceName = Device.modelName || Device.deviceName || (Platform.OS === "ios" ? "iPhone" : "Android Device");
      config.headers["x-device-model"] = `${deviceName} (Mobile App)`;
      config.headers["x-os-version"] = `${Device.osName || (Platform.OS === "ios" ? "iOS" : "Android")} ${Device.osVersion || Platform.Version}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // Detect network-level errors (backend unreachable)
    if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      networkEvents.emitOffline();
    }

    const isAuthRoute =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/password") ||
      originalRequest.url?.includes("/health");

    if (isAuthRoute) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const data = error.response?.data;
    const code = data?.code;

    // Check for direct terminal auth rejection
    if (code && TERMINAL_AUTH_CODES.has(code)) {
      await clearTokens();
      authEvents.emit();
      return Promise.reject(error);
    }

    // Never refresh-loop on /auth/refresh itself
    if (originalRequest.url?.includes("/auth/refresh")) {
      if ((status === 401 || status === 403) && (!code || TERMINAL_AUTH_CODES.has(code))) {
        await clearTokens();
        authEvents.emit();
      }
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors (At most 1 retry per request)
    if (status === 401 && !originalRequest._retried) {
      originalRequest._retried = true;

      try {
        const newAccessToken = await executeMobileRefreshToken();
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        const refreshStatus = refreshError.response?.status;
        const refreshCode = refreshError.response?.data?.code || refreshError?.code;

        // ONLY clear tokens and logout if the refresh was definitively rejected (terminal code or 401/403)
        if (
          refreshError.isTerminalAuth ||
          ((refreshStatus === 401 || refreshStatus === 403) && (!refreshCode || TERMINAL_AUTH_CODES.has(refreshCode)))
        ) {
          await clearTokens();
          authEvents.emit();
        }
        // Do NOT clear tokens on 500, 503, or network outage
        return Promise.reject(refreshError);
      }
    }

    // Exponential backoff retry for GET requests on temporary network/5xx glitches
    const isNetworkOr5xx = !status || status >= 500;
    const retryCount = originalRequest._retryCount || 0;
    if (isNetworkOr5xx && retryCount < 2 && originalRequest.method?.toLowerCase() === "get") {
      originalRequest._retryCount = retryCount + 1;
      const delayMs = 600 * Math.pow(2, retryCount);
      await new Promise((res) => setTimeout(res, delayMs));
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  },
);

// AppState check: Proactively refresh token on app foreground
AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
  if (nextAppState === "active") {
    getAccessToken().then((token) => {
      if (!token) return;
      try {
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          // React Native standard base64 atob fallback
          const decodedStr = typeof atob === "function" ? atob(payloadBase64) : Buffer.from(payloadBase64, "base64").toString("utf-8");
          const decoded = JSON.parse(decodedStr);
          if (decoded.exp && decoded.exp * 1000 - Date.now() < 120000) {
            executeMobileRefreshToken().catch(() => {});
          }
        }
      } catch {
        // Silent ignore
      }
    });
  }
});

