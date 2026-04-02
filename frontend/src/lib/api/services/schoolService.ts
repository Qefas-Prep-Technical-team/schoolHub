import { apiClient } from "../client";

export interface SchoolStats {
  students: number;
  teachers: number;
  classes: number;
  exams: number;
  subjects: number;
}

export interface PerformanceAnalysis {
  averageScore: number;
  totalAssessments: number;
  subjectBreakdown: { name: string; average: number }[];
  insight: string;
}

export interface DashboardSummary {
  recentExams: any[];
  unassignedCount: number;
  unassignedTeachers: any[];
  classesSummary: {
    id: string;
    name: string;
    studentCount: number;
    teacherCount: number;
  }[];
}

export const schoolService = {
  getStats: async (schoolId: string): Promise<SchoolStats> => {
    const response = await apiClient.get(`/schools/${schoolId}/stats`);
    return response.data.data;
  },

  getPerformanceAnalysis: async (schoolId: string): Promise<PerformanceAnalysis> => {
    const response = await apiClient.get(`/schools/${schoolId}/performance-analysis`);
    return response.data.data;
  },

  getTeachers: async (schoolId: string) => {
    const response = await apiClient.get(`/schools/${schoolId}/teachers`);
    return response.data.data;
  },

  getStudents: async (schoolId: string, params?: any) => {
    const response = await apiClient.get(`/schools/${schoolId}/students`, { params });
    return response.data.data;
  },

  getProfile: async (schoolId: string) => {
    const response = await apiClient.get(`/schools/${schoolId}/profile`);
    return response.data.data;
  },

  updateProfile: async (schoolId: string, data: any) => {
    const response = await apiClient.patch(`/schools/${schoolId}/profile`, data);
    return response.data.data;
  },

  getSettings: async (schoolId: string) => {
    const response = await apiClient.get(`/schools/${schoolId}/settings`);
    return response.data.data;
  },

  updateSettings: async (schoolId: string, data: any) => {
    const response = await apiClient.patch(`/schools/${schoolId}/settings`, data);
    return response.data.data;
  },

  getDashboardSummary: async (schoolId: string): Promise<DashboardSummary> => {
    const response = await apiClient.get(`/schools/${schoolId}/dashboard-summary`);
    return response.data.data;
  },
};
