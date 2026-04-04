/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "../client";

export const adminService = {
  /**
   * Update current admin profile
   */
  updateProfile: async (data: { name?: string; gender?: string; profileImage?: string; bannerImage?: string }) => {
    const response = await apiClient.patch("/admin/profile", data);
    return response.data;
  },

  /**
   * Get school students (paginated)
   */
  getSchoolStudents: async (schoolId: string, page: number = 1, limit: number = 10) => {
    const response = await apiClient.get("/admin/students", {
      params: { schoolId, page, limit },
    });
    return response.data;
  },

  /**
   * Manually verify a student
   */
  verifyStudent: async (studentId: string) => {
    const response = await apiClient.patch(`/admin/students/${studentId}/verify`);
    return response.data;
  },
};
