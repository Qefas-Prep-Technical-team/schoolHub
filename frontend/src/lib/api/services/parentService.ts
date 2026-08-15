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
  status: "IN_PROGRESS" | "SUBMITTED" | "SCORED" | "EXPIRED";
  stats: {
    averageGrade: number;
    attendanceRate: number;
    totalGrades: number;
    todayAttendance?: string;
  };
  linkStatus: string;
  relationship: string;
}

export interface Grade {
  id: string;
  score: number;
  maxMarks: number;
  createdAt: string;
  subject?: string;
  exam?: {
    id: string;
    title: string;
  };
  subjectPaper?: {
    id: string;
    title: string;
    subject?: {
      id: string;
      name: string;
    };
    teacher?: {
      id: string;
      name: string;
    };
  };
}

export interface ChildDetails {
  id: string;
  name: string;
  studentCode: string;
  profileImage?: string;
  grades: Grade[];
  school?: {
    name: string;
  };
  classes?: {
    class?: {
      name: string;
    }
  }[];
}

export const parentService = {
  getChildren: async () => {
    const response = await apiClient.get<{
      success: boolean;
      data: ChildSummary[];
    }>("/parents/children");
    return response.data.data;
  },

  getChildDetails: async (childId: string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: ChildDetails;
    }>(`/parents/children/${childId}`);
    return response.data.data;
  },

  updateProfile: async (data: {
    name?: string;
    email?: string;
    phone?: string;
    profileImage?: string;
    bannerImage?: string;
  }) => {
    const response = await apiClient.patch<{
      success: boolean;
      data: Record<string, unknown>;
    }>("/parents/profile", data);
    return response.data.data;
  },

  updateChild: async (
    childId: string,
    data: { name?: string; profileImage?: string },
  ) => {
    const response = await apiClient.patch<{
      success: boolean;
      data: Record<string, unknown>;
    }>(`/parents/children/${childId}`, data);
    return response.data.data;
  },
};
