import axios from "axios";
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore";

const platformClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 60000,
  withCredentials: true,
});

// Request interceptor to add platform token
platformClient.interceptors.request.use(
  (config) => {
    const { platform_token } = usePlatformStaffStore.getState();
    if (platform_token) {
      config.headers.Authorization = `Bearer ${platform_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle platform-specific errors
platformClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401 on a platform route, clear staff and redirect to PLATFORM login
    if (error.response?.status === 401) {
      usePlatformStaffStore.getState().clearStaff();
      if (typeof window !== "undefined") {
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes("/auth/login")) {
          window.location.href = "/auth/login?type=platform";
        }
      }
    }
    return Promise.reject(error);
  }
);

export { platformClient };
