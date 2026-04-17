import { apiClient } from "../client";

export const teacherService = {
  /**
   * Fetch teacher dashboard statistics
   * @param schoolId Optional school ID to filter data
   */
  getDashboardStats: async (schoolId?: string) => {
    const response = await apiClient.get("/schools/teacher/dashboard-stats", {
      params: { schoolId },
    });
    return response.data.data;
  },

  /**
   * Fetch schools linked to the teacher
   */
  getLinkedSchools: async () => {
    const response = await apiClient.get("/schools/teacher/linked-schools");
    return response.data.data;
  },

  /**
   * Get students for the teacher, optionally filtered by school/class, search, and paginated
   */
  getStudents: async (options: { schoolId?: string; classId?: string; search?: string; page?: number; limit?: number } = {}) => {
    const response = await apiClient.get("/schools/teacher/students", {
      params: options,
    });
    return response.data.data;
  },

  /**
   * Get classes for the teacher, optionally filtered by school
   */
  getClasses: async (options: { schoolId?: string } = {}) => {
    const response = await apiClient.get("/schools/teacher/classes", {
      params: options,
    });
    return response.data.data;
  },
  getClassDetail: async (classId: string) => {
    const response = await apiClient.get(`/schools/teacher/classes/${classId}`);
    return response.data.data;
  },

  /**
   * Get assignments for a specific class, optionally filtered by category
   */
  getClassAssignments: async (classId: string, category?: string) => {
    const response = await apiClient.get(`/schools/teacher/classes/${classId}/assignments`, {
      params: { category }
    });
    return response.data.data;
  },

  /**
   * Get grades for a specific class
   */
  getClassGrades: async (classId: string) => {
    const response = await apiClient.get(`/schools/teacher/classes/${classId}/grades`);
    return response.data.data;
  },

  /**
   * Get performance trends for the teacher
   */
  getPerformanceTrends: async (schoolId?: string, range: string = 'month') => {
    const response = await apiClient.get("/schools/teacher/performance-trends", {
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
  }
};
