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

/** Clears auth state and redirects to the login page with a session-expired notice and return URL. */
const handleSessionExpiry = () => {
  const prevState = useAuthStore.getState();
  const prevRole = prevState.userType || prevState.user?.userType;
  useAuthStore.getState().clearAuth();
  if (typeof window !== "undefined") {
    // Only redirect if not already on a login/public page to prevent redirect loops.
    if (!window.location.pathname.startsWith("/login")) {
      const currentPath = window.location.pathname + window.location.search;
      try {
        sessionStorage.setItem("pendingJoinRedirect", currentPath);
      } catch {
        // Ignore sessionStorage quota errors
      }
      const isExamRoute = window.location.pathname.startsWith("/Exams&Quizzes/exam/");
      const targetLoginBase =
        isExamRoute || prevRole === "STUDENT"
          ? "/login/student"
          : prevRole === "TEACHER"
            ? "/login/teacher"
            : prevRole === "PARENT"
              ? "/login/parent"
              : prevRole === "ADMIN"
                ? "/login/school-admin"
                : "/login";
      window.location.href = `${targetLoginBase}?session=expired&redirect=${encodeURIComponent(currentPath)}`;
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
 * Helper: Decode JWT expiration timestamp (ms) locally without network calls.
 */
function getTokenExpirationMs(token: string | null | undefined): number | null {
  if (!token) return null;
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const decoded = JSON.parse(
      atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Helper: Wait briefly for browser network reconnection if currently offline.
 */
async function waitForOnlineConnection(maxWaitMs = 12000): Promise<void> {
  if (typeof window === "undefined" || navigator.onLine !== false) return;
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      window.removeEventListener("online", onOnline);
      resolve();
    }, maxWaitMs);
    const onOnline = () => {
      clearTimeout(timeout);
      window.removeEventListener("online", onOnline);
      resolve();
    };
    window.addEventListener("online", onOnline);
  });
}

/**
 * Execute a single-flight token refresh with automatic retry + exponential backoff
 * for slow or high-packet-loss mobile networks.
 * Guaranteed to run only one network request flow at a time; concurrent callers share the promise.
 */
export async function executeRefreshToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const maxAttempts = 3;
      let lastError: unknown = null;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          if (attempt > 0) {
            await waitForOnlineConnection(10000);
          }

          const storedRefreshToken =
            typeof window !== "undefined" ? localStorage.getItem("qefas_refresh_token") : null;

          // Use raw axios instance with credentials & generous 45s timeout for slow 3G/4G connections
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/refresh`,
            storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
            {
              withCredentials: true,
              timeout: 45000,
            },
          );

          const newToken = response.data?.accessToken;
          const nextRefreshToken = response.data?.refreshToken;
          if (!newToken) throw new Error("No access token returned from refresh");

          Cookies.set("token", newToken, {
            expires: 7, // 7 days alignment
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          });
          if (typeof window !== "undefined") {
            localStorage.setItem("qefas_access_token", newToken);
            if (nextRefreshToken) {
              localStorage.setItem("qefas_refresh_token", nextRefreshToken);
            }
          }

          const { user } = useAuthStore.getState();
          if (user) {
            useAuthStore.getState().setAuth(user, newToken);
          }

          apiClient.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          return newToken;
        } catch (err: any) {
          lastError = err;
          const status = err?.response?.status;
          const code = err?.response?.data?.code;

          // If the server explicitly rejected the refresh token (401/403 terminal code), do not retry
          if (
            (status === 401 || status === 403) &&
            (!code || TERMINAL_AUTH_CODES.has(code))
          ) {
            throw err;
          }

          // Otherwise it's a slow network timeout, packet drop, or temporary 502/503/504 — wait and retry
          if (attempt < maxAttempts - 1) {
            const backoffMs = 1000 * Math.pow(2, attempt); // 1000ms, 2000ms
            await new Promise((res) => setTimeout(res, backoffMs));
          }
        }
      }

      throw lastError;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Request interceptor to add auth token, proactively refresh expiring tokens, and attach device headers
apiClient.interceptors.request.use(
  async (config) => {
    const storeToken = useAuthStore.getState().accessToken;
    const cookieToken = Cookies.get("token");
    const localToken = typeof window !== "undefined" ? localStorage.getItem("qefas_access_token") : null;
    const isCallbackRoute = typeof window !== "undefined" && window.location.pathname.includes("/login/callback");
    let token = isCallbackRoute
      ? cookieToken || storeToken || localToken
      : storeToken || cookieToken || localToken;

    const isAuthEndpoint =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/refresh") ||
      config.url?.includes("/auth/register");

    if (token && !isAuthEndpoint) {
      const expMs = getTokenExpirationMs(token);
      if (expMs !== null) {
        const msRemaining = expMs - Date.now();
        if (msRemaining <= 0) {
          // Token is already expired: refresh BEFORE sending the request to avoid a wasted 401 round-trip on slow networks
          try {
            token = await executeRefreshToken();
          } catch {
            // Fall through with existing token; response interceptor will handle terminal vs network error
          }
        } else if (msRemaining < 15 * 60 * 1000) {
          // Within 15 minutes of expiry: refresh silently in the background without delaying the current request
          void executeRefreshToken().catch(() => { });
        }
      }
    }

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

// Tab Focus & Network Reconnection Check: Proactively refresh if token is near expiration or missing
if (typeof window !== "undefined") {
  const checkAndRefreshToken = () => {
    const { isAuthenticated, accessToken } = useAuthStore.getState();
    if (!isAuthenticated) return;

    const currentToken =
      accessToken ||
      Cookies.get("token") ||
      localStorage.getItem("qefas_access_token");

    if (!currentToken) {
      executeRefreshToken().catch(() => { });
      return;
    }

    const expMs = getTokenExpirationMs(currentToken);
    // If token is expired or has less than 15 minutes left, refresh proactively
    if (expMs === null || expMs - Date.now() < 15 * 60 * 1000) {
      executeRefreshToken().catch(() => { });
    }
  };

  window.addEventListener("focus", checkAndRefreshToken);
  window.addEventListener("online", checkAndRefreshToken);
}

export { apiClient };
export default apiClient;

