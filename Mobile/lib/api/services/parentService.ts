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
      phone?: string;
    };
  };
}

export interface ChildDetails {
  id: string;
  name: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  studentCode: string;
  profileImage?: string;
  verified?: boolean;
  gradeLevel?: string;
  grades: Grade[];
  attendances?: {
    date: string;
    status: string;
  }[];
  school?: {
    name: string;
  };
  department?: {
    name: string;
  };
  classes?: {
    class?: {
      id?: string;
      name: string;
      section?: string;
      teachers?: any[];
    }
  }[];
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
}

export interface UpcomingExam {
  id: string;
  title: string;
  startDate: string;
  durationMinutes?: number;
  category: string;
  subject?: { name: string };
}

export interface DashboardChild {
  id: string;
  name: string;
  studentCode: string;
  profileImage?: string;
  school?: { id: string; name: string; schoolCode: string };
  currentClass?: { id: string; name: string; section?: string };
  recentGrades: {
    id: string;
    subject: string;
    score: number;
    maxMarks: number;
    assessmentType?: string;
    createdAt: string;
  }[];
  assignments?: any[];
}

export interface ParentDashboardData {
  child: DashboardChild | null;
  stats: {
    attendanceRate: number;
    averageGrade: number;
    attendanceBreakdown: { date: string; present: boolean }[];
  };
  upcomingExams: UpcomingExam[];
  notifications: DashboardNotification[];
  payments: {
    totalPaid: number;
    totalOutstanding: number;
    totalFees: number;
  };
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

  getChildAssignments: async (childId: string, page = 1, limit = 10) => {
    const response = await apiClient.get<{
      success: boolean;
      data: any;
    }>(`/parents/children/${childId}/assignments?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  getChildAssignmentDetails: async (childId: string, assignmentId: string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: any;
    }>(`/parents/children/${childId}/assignments/${assignmentId}`);
    return response.data.data;
  },

  getParentDashboard: async (childId?: string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: ParentDashboardData;
    }>("/parents/dashboard", {
      params: childId ? { childId } : {},
    });
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
