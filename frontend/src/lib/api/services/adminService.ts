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
  getSchoolStudents: async (schoolId: string, page: number = 1, limit: number = 10, search?: string, filters?: Record<string, unknown>) => {
    const response = await apiClient.get("/admin/students", {
      params: { 
        schoolId, 
        page, 
        limit, 
        search,
        ...filters
      },
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

  createStudent: async (data: { fullName: string; classId: string; schoolId: string; gender?: string }) => {
    const response = await apiClient.post("/admin/students", data);
    return response.data;
  },

  /**
   * Invite a student via email
   */
  inviteStudent: async (studentId: string, email: string) => {
    const response = await apiClient.post(`/admin/students/${studentId}/invite`, { email });
    return response.data;
  },

  /**
   * Get teacher by ID
   */
  getTeacherById: async (teacherId: string) => {
    const response = await apiClient.get(`/admin/teachers/${teacherId}`);
    return response.data.data;
  },

  /**
   * Get teacher timetable
   */
  getTeacherTimetable: async (teacherId: string) => {
    const response = await apiClient.get(`/admin/teachers/${teacherId}/timetable`);
    return response.data.data;
  },

  /**
   * Upsert timetable period
   */
  upsertTimetablePeriod: async (teacherId: string, data: Record<string, unknown>) => {
    const response = await apiClient.post(`/admin/teachers/${teacherId}/timetable`, data);
    return response.data.data;
  },

  /**
   * Delete timetable period
   */
  deleteTimetablePeriod: async (teacherId: string, periodId: string) => {
    const response = await apiClient.delete(`/admin/teachers/${teacherId}/timetable/${periodId}`);
    return response.data;
  },

  /**
   * Update teacher details
   */
  updateTeacher: async (teacherId: string, data: Record<string, unknown>) => {
    const response = await apiClient.patch(`/admin/teachers/${teacherId}`, data);
    return response.data;
  },

  /**
   * Get school teachers
   */
  getSchoolTeachers: async (schoolId: string, params?: { page?: number; limit?: number; search?: string; isClaimed?: string }) => {
    const response = await apiClient.get("/admin/teachers", {
      params: { schoolId, ...params },
    });
    return response.data;
  },

  /**
   * Resend teacher claim email (acts as invite)
   */
  resendTeacherClaimEmail: async (teacherId: string, email: string) => {
    // Some APIs expect email in body if we want to override, 
    // let's pass it just in case, or we use inviteTeacher endpoint.
    // admin.route.ts has router.post("/teachers/invite", inviteTeacher);
    // Let's use the invite route if we're creating/inviting, but for existing it's usually resend-claim-email
    const response = await apiClient.post(`/admin/teachers/${teacherId}/resend-claim-email`, { email });
    return response.data;
  },
};
