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
// console.log("API Client initialized with base URL:", process.env.NEXT_PUBLIC_API_URL);
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

    // Handle common errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/refresh")) {
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
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
            useAuthStore.getState().clearAuth();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
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
