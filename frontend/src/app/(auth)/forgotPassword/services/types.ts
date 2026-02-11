/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/auth/forgot-password/types.ts
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface VerifyTokenResponse {
 success: boolean,
  message: string,
    data: {
        email: string
    }
}