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

export interface ClassTodayAttendance {
  classId: string;
  className: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  rate: number;
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
  
  getLandingPage: async (schoolId: string) => {
    const response = await apiClient.get(`/schools/${schoolId}/landing-page`);
    return response.data.data;
  },

  getLandingPageBySubdomain: async (subdomain: string) => {
    const response = await apiClient.get(`/schools/subdomain/${subdomain}/landing-page`);
    return response.data.data;
  },

  updateLandingPage: async (schoolId: string, data: Record<string, unknown>) => {
    const response = await apiClient.patch(`/schools/${schoolId}/landing-page`, data);
    return response.data.data;
  },

  getTodayAttendance: async (schoolId: string, date?: string): Promise<ClassTodayAttendance[]> => {
    const params = date ? { date } : undefined;
    const response = await apiClient.get(`/schools/${schoolId}/today-attendance`, { params });
    return response.data.data;
  },

  getSubjects: async (schoolId: string) => {
    const response = await apiClient.get(`/academic/subjects`, { params: { schoolId } });
    return response.data.data;
  },

  getDepartments: async (schoolId: string) => {
    const response = await apiClient.get(`/academic/departments`, { params: { schoolId } });
    return response.data.data;
  },

  submitInquiry: async (subdomain: string, data: Record<string, unknown>) => {
    const response = await apiClient.post(`/schools/subdomain/${subdomain}/inquiry`, data);
    return response.data;
  },

  getInquiries: async (schoolId: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(`/schools/${schoolId}/inquiries`, { params });
    return response.data;
  },
};
