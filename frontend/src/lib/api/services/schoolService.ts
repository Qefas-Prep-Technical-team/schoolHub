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
  recentExams: Record<string, unknown>[];
  unassignedCount: number;
  unassignedTeachers: Record<string, unknown>[];
  classesSummary: {
    id: string;
    name: string;
    studentCount: number;
    teacherCount: number;
  }[];
}

export interface SchoolBilling {
  subscription: {
    plan: string;
    subscriptionStatus: string;
    subscriptionEnd: string | null;
    isTrialActive: boolean;
    lastPaymentDate: string | null;
    paystackCustomerCode: string | null;
    billingCycle: string | null;
    subscriptionPlanId?: string;
    amount: number;
    features: string[];
  };
  usage: {
    students: number;
    teachers: number;
    classes: number;
    exams: number;
    subjects: number;
    storageBytes: number;
  };
  transactions: {
    id: number;
    reference: string;
    amount: number;
    status: string;
    paymentMethod: string | null;
    paidAt: string | null;
    plan: string | null;
    billingCycle: string | null;
    createdAt: string;
  }[];
  totalTransactions: number;
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

  getStudents: async (schoolId: string, params?: Record<string, unknown>) => {
    const response = await apiClient.get(`/schools/${schoolId}/students`, { params });
    return response.data.data;
  },

  getProfile: async (schoolId: string) => {
    const response = await apiClient.get(`/schools/${schoolId}/profile`);
    return response.data.data;
  },

  updateProfile: async (schoolId: string, data: Record<string, unknown>) => {
    const response = await apiClient.patch(`/schools/${schoolId}/profile`, data);
    return response.data.data;
  },

  getSettings: async (schoolId: string) => {
    const response = await apiClient.get(`/schools/${schoolId}/settings`);
    return response.data.data;
  },

  updateSettings: async (schoolId: string, data: Record<string, unknown>) => {
    const response = await apiClient.patch(`/schools/${schoolId}/settings`, data);
    return response.data.data;
  },

  getDashboardSummary: async (schoolId: string): Promise<DashboardSummary> => {
    const response = await apiClient.get(`/schools/${schoolId}/dashboard-summary`);
    return response.data.data;
  },

  getBilling: async (schoolId: string, params?: { page?: number; limit?: number }): Promise<SchoolBilling> => {
    const response = await apiClient.get(`/schools/${schoolId}/billing`, { params });
    return response.data.data;
  },
};
