/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

let isRefreshing = false;
let failedQueue: any[] = [];

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
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isLoginRequest = originalRequest.url?.includes("/auth/login");
      const isAuthPage = typeof window !== "undefined" && 
        ["/login", "/signup", "/verification", "/onboarding", "/reset-password", "/forgot-password"].some(
          path => window.location.pathname === path || window.location.pathname.startsWith(`${path}/`)
        );

      if (isLoginRequest || isAuthPage) {
        // Silently clear the old/expired tokens without triggering refresh/redirect loops
        Cookies.remove("token", { path: "/" });
        useAuthStore.getState().clearAuth();
        return Promise.reject(error);
      }

      // If the refresh call itself failed — session is truly dead, redirect gracefully.
      if (originalRequest.url?.includes("/auth/refresh")) {
        handleSessionExpiry();
        // Return a never-resolving promise so no downstream error handler fires
        // after the page redirect is already in flight.
        return new Promise(() => {});
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

      return new Promise(function (resolve, reject) {
        apiClient
          .post("/auth/refresh")
          .then(({ data }) => {
            const newToken = data.accessToken;
            Cookies.set("token", newToken, {
              expires: 1,
              path: "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            });

            const { user } = useAuthStore.getState();
            if (user) {
              useAuthStore.getState().setAuth(user, newToken);
            }

            apiClient.defaults.headers.common["Authorization"] =
              "Bearer " + newToken;
            originalRequest.headers["Authorization"] = "Bearer " + newToken;

            processQueue(null, newToken);
            resolve(apiClient(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            // The nested /auth/refresh failure is already handled by the guard above,
            // but as a safety net handle it here too.
            handleSessionExpiry();
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  },
);

export { apiClient };
