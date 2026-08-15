import { apiClient } from "../client";

export const adminService = {
  getSchoolStudents: async (
    schoolId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    filters?: Record<string, unknown>
  ) => {
    const response = await apiClient.get("/admin/students", {
      params: {
        schoolId,
        page,
        limit,
        search,
        ...filters,
      },
    });
    return response.data;
  },

  getSchoolTeachers: async (
    schoolId: string,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      isClaimed?: string;
    }
  ) => {
    const response = await apiClient.get("/admin/teachers", {
      params: { schoolId, ...params },
    });
    return response.data;
  },

  resendTeacherClaimEmail: async (teacherId: string) => {
    const response = await apiClient.post(
      `/admin/teachers/${teacherId}/resend-claim-email`
    );
    return response.data;
  },

  getSchoolTeacherAttendanceTrend: async (schoolId: string, days = 5) => {
    const response = await apiClient.get(`/admin/teachers/attendance/trend`, {
      params: { schoolId, days },
    });
    return response.data.data;
  },
};
