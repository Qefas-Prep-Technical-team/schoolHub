import { apiClient } from "@/lib/api/client";

interface LoginCredentials {
  email: string;
  password?: string;
  userType: string;
  preAuthToken?: string;
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
    userRole: string;
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

  claimAccount: async (data: any): Promise<any> => {
    const response = await apiClient.post("/auth/claim-account", data);
    return response.data;
  },
};
