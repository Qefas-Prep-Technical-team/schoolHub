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
   * Get students for the teacher, optionally filtered by school
   */
  getStudents: async (schoolId?: string) => {
    const response = await apiClient.get("/schools/teacher/students", {
      params: { schoolId },
    });
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
  }
};
