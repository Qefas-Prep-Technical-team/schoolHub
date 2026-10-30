/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { getClientDeviceInfo } from "@/lib/utils/deviceDetector";

// Single-flight refresh promise: all concurrent 401s await the exact same promise
let refreshPromise: Promise<string> | null = null;

// Codes that definitively signal the session is dead and cannot be recovered
const TERMINAL_AUTH_CODES = new Set([
  "NO_REFRESH_TOKEN",
  "REFRESH_INVALID",
  "REFRESH_EXPIRED",
  "REFRESH_REUSED",
  "USER_INACTIVE",
  "DEVICE_UNAUTHORIZED",
  "NO_SESSION_ROW",
]);

/** Clears auth state and redirects to the login page with a session-expired notice. */
const handleSessionExpiry = () => {
  useAuthStore.getState().clearAuth();
  if (typeof window !== "undefined") {
    // Only redirect if not already on a login/public page to prevent redirect loops.
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login?session=expired";
    }
  }
};

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 60000,
  withCredentials: true,
});

/**
 * Execute a single-flight token refresh.
 * Guaranteed to run only one network request at a time; callers share the promise.
 */
export async function executeRefreshToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      // Use raw axios instance with credentials so we don't trigger the interceptor recursively
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newToken = response.data?.accessToken;
      if (!newToken) throw new Error("No access token returned from refresh");

      Cookies.set("token", newToken, {
        expires: 7, // 7 days alignment
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      const { user } = useAuthStore.getState();
      if (user) {
        useAuthStore.getState().setAuth(user, newToken);
      }

      apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      return newToken;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Request interceptor to add auth token and device tracking headers
apiClient.interceptors.request.use(
  async (config) => {
    const storeToken = useAuthStore.getState().accessToken;
    const cookieToken = Cookies.get("token");
    const token = storeToken || cookieToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof window !== "undefined") {
      try {
        const deviceInfo = await getClientDeviceInfo();
        if (deviceInfo) {
          config.headers["x-device-type"] = deviceInfo.deviceType;
          config.headers["x-device-model"] = deviceInfo.deviceModel;
          config.headers["x-os-version"] = deviceInfo.osVersion;
          config.headers["x-device-location"] = localStorage.getItem("qefas_device_location") || deviceInfo.location;
          config.headers["x-client-timezone"] = deviceInfo.timeZone;
          config.headers["x-location-permission"] = localStorage.getItem("qefas_location_granted") === "true" ? "granted" : "denied";
        }
      } catch {
        // Fallback silently if device detection is unavailable
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;
    const data = error.response?.data;
    const code = data?.code;

    // Check if terminal auth failure occurred directly on this request
    if (code && TERMINAL_AUTH_CODES.has(code)) {
      handleSessionExpiry();
      return Promise.reject(error);
    }

    // Never refresh-loop: do NOT intercept or retry /auth/refresh itself
    if (originalRequest.url?.includes("/auth/refresh")) {
      if ((status === 401 || status === 403) && (!code || TERMINAL_AUTH_CODES.has(code))) {
        handleSessionExpiry();
      }
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized on standard requests (Retry at most once via _retried flag)
    if (status === 401 && !originalRequest._retried) {
      const isLoginRequest = originalRequest.url?.includes("/auth/login");
      const isCallbackPage = typeof window !== "undefined" && window.location.pathname.includes("/login/callback");
      const isAuthPage = typeof window !== "undefined" && !isCallbackPage && 
        ["/login", "/signup", "/verification", "/onboarding", "/reset-password", "/forgot-password"].some(
          path => window.location.pathname === path || window.location.pathname.startsWith(`${path}/`)
        );

      if (isLoginRequest || isAuthPage) {
        Cookies.remove("token", { path: "/" });
        const url = originalRequest?.url || "";
        if (!url.includes("login/2fa")) {
          useAuthStore.getState().clearAuth();
        }
        return Promise.reject(error);
      }

      originalRequest._retried = true;

      try {
        const newToken = await executeRefreshToken();
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr: any) {
        const refreshStatus = refreshErr.response?.status;
        const refreshCode = refreshErr.response?.data?.code;

        // ONLY clear auth if the refresh failed with a terminal code or 401/403
        if ((refreshStatus === 401 || refreshStatus === 403) && (!refreshCode || TERMINAL_AUTH_CODES.has(refreshCode))) {
          handleSessionExpiry();
        }
        // If it's a 500, 503, network drop or timeout, DO NOT log the user out!
        return Promise.reject(refreshErr);
      }
    }

    // For 503 Service Unavailable or network errors, retry up to 3 times with exponential backoff
    const isNetworkOr5xx = !status || status >= 500;
    const retryCount = originalRequest._retryCount || 0;
    if (isNetworkOr5xx && retryCount < 3 && originalRequest.method?.toLowerCase() === "get") {
      originalRequest._retryCount = retryCount + 1;
      const delayMs = 500 * Math.pow(2, retryCount);
      await new Promise((res) => setTimeout(res, delayMs));
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  },
);

// Tab Focus Check: Proactively refresh if token is near expiration or missing
if (typeof window !== "undefined") {
  window.addEventListener("focus", () => {
    const { isAuthenticated, accessToken } = useAuthStore.getState();
    if (!isAuthenticated) return;

    let shouldRefresh = false;
    if (!accessToken) {
      shouldRefresh = true;
    } else {
      try {
        const payloadBase64 = accessToken.split(".")[1];
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));
          // If less than 2 minutes left on access token, refresh proactively
          if (decoded.exp && decoded.exp * 1000 - Date.now() < 120000) {
            shouldRefresh = true;
          }
        }
      } catch {
        shouldRefresh = true;
      }
    }

    if (shouldRefresh) {
      executeRefreshToken().catch(() => {});
    }
  });
}

export { apiClient };
export default apiClient;

