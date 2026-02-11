// lib/auth/forgot-password/api.ts
import { apiClient } from "@/lib/api/client";
import type { 
  PasswordResetRequest, 
  PasswordResetResponse, 
  ResetPasswordData, 
  ResetPasswordResponse,
  VerifyTokenResponse 
} from "./types";

export const forgotPasswordAPI = {
  /**
   * Request password reset for a user
   */
  requestPasswordReset: async (email: string): Promise<PasswordResetResponse> => {
    const response = await apiClient.post<PasswordResetResponse>("/auth/password/reset/request", { email });
    return response.data;
  },

  /**
   * Reset password with token and new password
   */
  resetPassword: async (token: string, newPassword: string,confirmPassword:string): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>("/auth/password/reset/complete", { 
      token, 
      newPassword ,
      confirmPassword
    });
    return response.data;
  },

  /**
   * Verify if a reset token is valid
   */
  validateResetToken: async (token: string): Promise<VerifyTokenResponse> => {
    const response = await apiClient.get<VerifyTokenResponse>(`/auth/password/reset/validate/${token}`);
    return response.data;
  },
  /**
   * Resend reset password email
   */
  resendResetEmail: async (email: string): Promise<PasswordResetResponse> => {
    const response = await apiClient.post<PasswordResetResponse>("/auth/resend-reset-email", { email });
    return response.data;
  }
};