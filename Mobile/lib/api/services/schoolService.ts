import { apiClient } from "../client";

export interface SchoolStats {
  students: number;
  teachers: number;
  classes: number;
  exams: number;
  subjects: number;
}

export const schoolService = {
  getMyStats: async (): Promise<SchoolStats> => {
    const response = await apiClient.get(`/schools/my/stats`);
    return response.data.data;
  },
  getMyPerformanceAnalysis: async (): Promise<any> => {
    const response = await apiClient.get(`/schools/my/performance-analysis`);
    return response.data.data ?? null;
  },
  getPerformanceAnalysis: async (schoolId?: string): Promise<any> => {
    if (!schoolId) return null;
    const response = await apiClient.get(
      `/schools/${schoolId}/performance-analysis`,
    );
    return response.data.data ?? null;
  },
  getSessions: async (schoolId?: string): Promise<any[]> => {
    if (!schoolId) return [];
    const response = await apiClient.get(`/sessions?schoolId=${schoolId}`);
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },
  getMyDashboardSummary: async (): Promise<any> => {
    const response = await apiClient.get(`/schools/my/dashboard-summary`);
    return response.data.data ?? null;
  },
  getMyTodayAttendance: async (date?: string): Promise<any[]> => {
    const params = date ? { date } : undefined;
    const response = await apiClient.get(`/schools/my/today-attendance`, {
      params,
    });
    return response.data.data || [];
  },
};
