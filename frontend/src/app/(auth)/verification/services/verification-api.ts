/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiClient } from "@/lib/api/client"


interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

interface RequestCodeResponse {
  success: boolean
  message: string
  expiresIn?: number
}

interface VerifyCodeResponse {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    name: string
    isVerified: boolean
  }
  token?: string
}

export const verificationAPI = {
  // Request verification code
  requestCode: async (email: string) => {
    const response = await apiClient.post<ApiResponse<RequestCodeResponse>>(
      '/auth/request-code',
      { email }
    )
    return response
  },

  // Verify code
  verifyCode: async (email: string, code: string) => {
    const response = await apiClient.post<ApiResponse<VerifyCodeResponse>>(
      '/auth/verify-code',
      { email, code }
    )
    return response
  },

  // Resend verification code
  resendCode: async (email: string) => {
    const response = await apiClient.post<ApiResponse<RequestCodeResponse>>(
      '/auth/request-code',
      { email }
    )
    return response
  }
}