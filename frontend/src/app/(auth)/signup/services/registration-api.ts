/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/lib/api/client";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface ParentRegistrationResponse {
  parent: {
    id: string;
    fullName: string;
    email: string;
  };
  linking: {
    status?: string;
    message: string;
  };
}

export const registrationAPI = {
  // Parent registration - matches your backend function
  registerParent: async (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    studentCode?: string;
  }) => {
    const response = await apiClient.post<
      ApiResponse<ParentRegistrationResponse>
    >(
      "/auth/register/parents", // Your backend endpoint
      data
    );
    return response;
  },

  // School registration - matches your backend function
  registerSchool: async (data: {
    schoolName: string;
    adminName: string;
    email: string;
    password: string;
    confirmPassword: string;
    subdomain?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/auth/register/school",
      data
    );
    return response;
  },
  // Teacher registration - matches your backend function
  registerTeacher: async (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    tenantId?: string;
    isIndependent?: boolean;
  }) => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/auth/register/teacher",
      data
    );
    return response;
  },
  // Student registration - matches your backend function
  registerStudent: async (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    tenantId?: string;
    teacherCode?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/auth/register/student",
      data
    );
    return response;
  },
};
