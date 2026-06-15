import { apiClient } from "../client";

export const teacherService = {
  /**
   * Fetch teacher dashboard statistics
   * @param schoolId Optional school ID to filter data
   */
  getDashboardStats: async (schoolId?: string) => {
    const response = await apiClient.get("/teacher/dashboard-stats", {
      params: { schoolId },
    });
    return response.data.data;
  },

  /**
   * Fetch schools linked to the teacher
   */
  getLinkedSchools: async () => {
    const response = await apiClient.get("/teacher/linked-schools");
    return response.data.data;
  },

  /**
   * Get students for the teacher, optionally filtered by school/class, search, and paginated
   */
  getStudents: async (options: { schoolId?: string; classId?: string; search?: string; page?: number; limit?: number } = {}) => {
    const response = await apiClient.get("/teacher/students", {
      params: options,
    });
    return response.data.data;
  },

  /**
   * Get classes for the teacher, optionally filtered by school
   */
  getClasses: async (options: { schoolId?: string } = {}) => {
    const response = await apiClient.get("/teacher/classes", {
      params: options,
    });
    return response.data.data;
  },

  getClassDetail: async (classId: string) => {
    const response = await apiClient.get(`/teacher/classes/${classId}`);
    return response.data.data;
  },

  /**
   * Get assignments for a specific class, optionally filtered by category
   */
  getClassAssignments: async (classId: string, category?: string) => {
    const response = await apiClient.get(`/teacher/classes/${classId}/assignments`, {
      params: { category }
    });
    return response.data.data;
  },

  /**
   * Get grades for a specific class
   */
  getClassGrades: async (classId: string) => {
    const response = await apiClient.get(`/teacher/classes/${classId}/grades`);
    return response.data.data;
  },

  /**
   * Update aggregate grades for a student in a class
   */
  updateClassStudentGrade: async (classId: string, studentId: string, data: {
    continuousScore?: number;
    continuousTotal?: number;
    examScore?: number;
    examTotal?: number;
    status?: string;
    notes?: string;
  }) => {
    const response = await apiClient.patch(`/teacher/classes/${classId}/grades/student/${studentId}`, data);
    return response.data;
  },

  /**
   * Get performance trends for the teacher
   */
  getPerformanceTrends: async (schoolId?: string, range: string = 'month') => {
    const response = await apiClient.get("/teacher/performance-trends", {
      params: { schoolId, range }
    });
    return response.data.data;
  },

  /**
   * Get exams/quizzes for the teacher
   */
  getExams: async (options: { schoolId?: string; classId?: string; category?: string; status?: string } = {}) => {
    const response = await apiClient.get("/exams", {
      params: options,
    });
    return response.data.data;
  },

  /**
   * Get subject papers for the teacher
   */
  getSubjectPapers: async (options: { schoolId?: string; classId?: string; unlinkedOnly?: boolean } = {}) => {
    const response = await apiClient.get("/exams/papers/all", {
      params: options,
    });
    return response.data.data;
  },

  /**
   * Get subjects assigned to the teacher
   */
  getSubjects: async (options: { schoolId?: string } = {}) => {
    const response = await apiClient.get("/teacher/subjects", {
      params: options,
    });
    return response.data.data;
  },

  /**
   * Get the profile of the authenticated teacher
   */
  getProfile: async () => {
    const response = await apiClient.get("/teacher/profile");
    return response.data.data;
  },

  /**
   * Update the teacher's profile
   */
  updateProfile: async (data: { 
    name?: string; 
    gender?: string; 
    dateOfBirth?: string | Date;
    profileImage?: string;
    bannerImage?: string;
  }) => {
    const response = await apiClient.patch("/teacher/profile", data);
    return response.data;
  },

  /**
   * Request an email update
   */
  requestEmailUpdate: async (newEmail: string) => {
    const response = await apiClient.post("/teacher/profile/email/request", { newEmail });
    return response.data;
  },

  /**
   * Verify and finalize email update
   */
  verifyEmailUpdate: async (code: string) => {
    const response = await apiClient.post("/teacher/profile/email/verify", { code });
    return response.data;
  },

  /**
   * Get teacher settings
   */
  getSettings: async () => {
    const response = await apiClient.get("/teacher/settings");
    return response.data.data;
  },

  /**
   * Update teacher settings
   */
  updateSettings: async (settings: Record<string, unknown>) => {
    const response = await apiClient.patch("/teacher/settings", settings);
    return response.data.data;
  },

  /**
   * Record quick attendance for a class
   */
  saveClassAttendance: async (schoolId: string, classId: string, date: string, attendanceRecords: { studentId: string; status: string; note?: string }[]) => {
    const response = await apiClient.post(`/teacher/schools/${schoolId}/attendance`, {
      classId,
      date,
      attendanceRecords,
    });
    return response.data;
  }
};
