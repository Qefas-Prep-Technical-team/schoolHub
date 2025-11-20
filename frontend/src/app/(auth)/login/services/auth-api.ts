import { apiClient } from "@/lib/api/client";

interface LoginCredentials {
  email: string;
  password: string;
  userType: string; // Always "PARENT"
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      role: string | null;
    };
  };
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },
};
