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

  login2FA: async (data: { tempToken: string; code: string }): Promise<LoginResponse> => {
    const response = await apiClient.post("/auth/login/2fa", data);
    return response.data;
  },

  send2FAEmail: async (data: { tempToken: string }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post("/auth/login/2fa/email", data);
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
