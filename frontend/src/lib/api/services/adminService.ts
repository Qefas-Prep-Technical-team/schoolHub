import { apiClient } from "../client";

export const adminService = {
  /**
   * Get current admin full profile with school affiliations
   */
  getProfile: async () => {
    const response = await apiClient.get("/admin/profile");
    return response.data.data;
  },

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
  getTeacherTimetable: async (teacherId: string, termPeriodId?: string, schoolId?: string) => {
    const response = await apiClient.get(`/admin/teachers/${teacherId}/timetable`, {
      params: { termPeriodId, schoolId }
    });
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
   * Assign teacher to a class
   */
  assignTeacherToClass: async (teacherId: string, classId: string) => {
    const response = await apiClient.post(`/admin/teachers/${teacherId}/assign-class`, { classId });
    return response.data;
  },

  /**
   * Assign teacher to a subject
   */
  assignTeacherToSubject: async (teacherId: string, subjectId: string) => {
    const response = await apiClient.post(`/admin/teachers/${teacherId}/assign-subject`, { subjectId });
    return response.data;
  },

  /**
   * Unassign teacher from subject
   */
  removeTeacherFromSubject: async (teacherId: string, subjectId: string) => {
    const response = await apiClient.delete(`/admin/teachers/${teacherId}/remove-subject/${subjectId}`);
    return response.data;
  },

  /**
   * Unassign teacher from class
   */
  removeTeacherFromClass: async (teacherId: string, classId: string) => {
    const response = await apiClient.delete(`/admin/teachers/${teacherId}/remove-class/${classId}`);
    return response.data;
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
  updateTeacher: async (teacherId: string, data: { name?: string; email?: string; phone?: string; department?: string; role?: string; gender?: string }) => {
    const response = await apiClient.patch(`/admin/teachers/${teacherId}`, data);
    return response.data.data;
  },

  /**
   * Get school teachers (for dropdowns, etc.)
   */
  getSchoolTeachers: async (schoolId: string, params?: { page?: number; limit?: number; search?: string; isClaimed?: boolean }) => {
    const response = await apiClient.get("/admin/teachers", {
      params: { schoolId, ...params },
    });
    return response.data;
  },

  /**
   * Get teacher attendance history
   */
  getTeacherAttendance: async (teacherId: string, schoolId: string, month?: string) => {
    const response = await apiClient.get(`/admin/teachers/${teacherId}/attendance`, {
      params: { schoolId, month },
    });
    return response.data.data;
  },

  /**
   * Mark teacher attendance
   */
  markTeacherAttendance: async (teacherId: string, data: { schoolId: string; date: string; status: string; note?: string }) => {
    const response = await apiClient.post(`/admin/teachers/${teacherId}/attendance`, data);
    return response.data.data;
  },

  /**
   * Mark bulk teacher attendance
   */
  markBulkTeacherAttendance: async (data: { schoolId: string; records: { teacherId: string; date: string; status: string; note?: string }[] }) => {
    const response = await apiClient.post(`/admin/teachers/attendance/bulk`, data);
    return response.data.data;
  },

  /**
   * Get all school teachers' attendance for a specific date or date range
   */
  getSchoolTeacherAttendanceByDate: async (schoolId: string, date?: string, startDate?: string, endDate?: string) => {
    const response = await apiClient.get(`/admin/teachers/attendance/by-date`, {
      params: { schoolId, date, startDate, endDate }
    });
    return response.data.data;
  },

  /**
   * Get school teacher attendance trend (present/absent/late counts per day)
   */
  getSchoolTeacherAttendanceTrend: async (schoolId: string, days?: number) => {
    const response = await apiClient.get(`/admin/teachers/attendance/trend`, {
      params: { schoolId, days: days || 5 }
    });
    return response.data.data;
  },

  /**
   * Invite a teacher via email
   */
  inviteTeacher: async (teacherId: string, email: string) => {
    const response = await apiClient.post(`/admin/teachers/invite`, { teacherId, email });
    return response.data;
  },

  /**
   * Resend teacher claim email (acts as invite)
   */
  resendTeacherClaimEmail: async (teacherId: string, email: string) => {
    const response = await apiClient.post(`/admin/teachers/${teacherId}/resend-claim-email`, { email });
    return response.data;
  },

  // === TEAM MANAGEMENT ===

  /**
   * Get all school admins (active and pending)
   */
  getSchoolAdmins: async (schoolId: string) => {
    const response = await apiClient.get("/admin/team", {
      params: { schoolId },
    });
    return response.data;
  },

  /**
   * Get pending admin join requests
   */
  getPendingAdmins: async (schoolId: string) => {
    const response = await apiClient.get("/admin/pending", {
      params: { schoolId },
    });
    return response.data;
  },

  /**
   * Approve a pending admin
   */
  approveAdmin: async (adminId: string, role: string, schoolId?: string) => {
    const response = await apiClient.put(`/admin/${adminId}/approve`, { role, schoolId });
    return response.data;
  },

  /**
   * Reject a pending admin
   */
  rejectAdmin: async (adminId: string, reason?: string, schoolId?: string) => {
    const response = await apiClient.put(`/admin/${adminId}/reject`, { reason, schoolId });
    return response.data;
  },

  /**
   * Update an admin's role
   */
  updateAdminRole: async (adminId: string, role: string, schoolId?: string) => {
    const response = await apiClient.patch(`/admin/team/${adminId}/role`, { role, schoolId });
    return response.data;
  },

  /**
   * Transfer school ownership
   */
  transferOwnership: async (newOwnerId: string, schoolId?: string) => {
    const response = await apiClient.post(`/admin/team/${newOwnerId}/transfer-ownership`, { schoolId });
    return response.data;
  },

  /**
   * Remove an admin
   */
  removeAdmin: async (adminId: string, schoolId?: string) => {
    const response = await apiClient.delete(`/admin/team/${adminId}`, {
      params: { schoolId },
    });
    return response.data;
  },
};
