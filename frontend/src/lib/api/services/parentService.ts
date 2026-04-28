import { apiClient } from "../client";

export interface ChildSummary {
  id: string;
  name: string;
  studentCode: string;
  profileImage?: string;
  school?: {
    id: string;
    name: string;
    schoolCode: string;
  };
  currentClass?: {
    id: string;
    name: string;
    section?: string;
  };
  stats: {
    averageGrade: number;
    attendanceRate: number;
    totalGrades: number;
  };
  linkStatus: string;
  relationship: string;
}

export const parentService = {
  getChildren: async () => {
    const response = await apiClient.get<{ success: boolean; data: ChildSummary[] }>("/parents/children");
    return response.data.data;
  },

  getChildDetails: async (childId: string) => {
    const response = await apiClient.get<{ success: boolean; data: any }>(`/parents/children/${childId}`);
    return response.data.data;
  },
};
