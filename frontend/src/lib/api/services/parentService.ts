import { apiClient } from "../client";

export interface SchoolInfo {
  id?: string;
  name: string;
  schoolCode?: string;
  plan?: string;
  subscriptionStatus?: string;
  isTrialActive?: boolean;
  subscriptionEnd?: string | Date;
  logo?: string;
  schoolLogo?: string;
  address?: string;
  schoolEmail?: string;
  contactEmail?: string;
  phone?: string;
  contactPhone?: string;
  motto?: string;
  [key: string]: unknown;
}

export interface ChildSummary {
  id: string;
  name: string;
  studentCode: string;
  profileImage?: string;
  school?: SchoolInfo;
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
  examId?: string;
  assessmentType?: string;
  category?: string;
  subjectPaperId?: string;
  teacher?: {
    id?: string;
    name?: string;
  };
  remarks?: string;
  term?: string;
  session?: {
    id?: string;
    name?: string;
  };
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
  school?: SchoolInfo;
  department?: {
    id?: string;
    name: string;
    code?: string;
    subjects?: {
      id?: string;
      subjectId?: string;
      subject?: {
        id?: string;
        name: string;
        code?: string;
      };
    }[];
  };
  classes?: {
    class?: {
      name: string;
      subjects?: {
        subject?: {
          name: string;
        };
      }[];
    }
  }[];
}

export const parentService = {
  getChildren: async () => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ChildSummary[];
      }>("/parents/children");
      const list = response.data?.data || (Array.isArray(response.data) ? response.data : []);
      return Array.isArray(list) ? list : [];
    } catch (error) {
      console.warn("[parentService.getChildren] returning empty list on failure:", error);
      return [];
    }
  },

  getChildDetails: async (childId: string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: ChildDetails;
    }>(`/parents/children/${childId}`);
    return response.data.data;
  },

  getChildResults: async (childId: string) => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>(`/parents/children/${childId}/results`);
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
