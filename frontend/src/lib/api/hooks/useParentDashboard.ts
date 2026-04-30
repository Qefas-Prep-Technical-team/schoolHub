import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";

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
}

export interface AttendanceDay {
  date: string;
  present: boolean;
}

export interface UpcomingExam {
  id: string;
  title: string;
  startDate: string;
  durationMinutes?: number;
  category: string;
  subject?: { name: string };
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
}

export interface ParentDashboardData {
  child: DashboardChild | null;
  stats: {
    attendanceRate: number;
    averageGrade: number;
    attendanceBreakdown: AttendanceDay[];
  };
  upcomingExams: UpcomingExam[];
  notifications: DashboardNotification[];
  payments: {
    totalPaid: number;
    totalOutstanding: number;
    totalFees: number;
  };
}

export const useParentDashboard = (childId?: string | null) => {
  return useQuery<ParentDashboardData>({
    queryKey: ["parent-dashboard", childId],
    queryFn: async () => {
      const { data } = await apiClient.get("/parents/dashboard", {
        params: { childId }
      });
      return data.data as ParentDashboardData;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
};

