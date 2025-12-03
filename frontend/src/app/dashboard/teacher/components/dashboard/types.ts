export interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  upcomingLessons: number;
  assignmentsPending: number;
  attendanceRate: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'due_soon' | 'recent' | 'graded';
  type: 'assignment' | 'exam' | 'quiz';
  dueDate?: Date;
  submissions?: number;
  totalStudents?: number;
  action?: string;
}

export interface Message {
  id: string;
  title: string;
  description: string;
  sender: string;
  timestamp: Date;
  isUnread: boolean;
  isAnnouncement: boolean;
}

export interface AttendanceData {
  overallPercentage: number;
  present: number;
  absent: number;
  late: number;
  classes: Array<{
    name: string;
    attendance: number;
    absences: number;
    status: 'good' | 'warning' | 'critical';
  }>;
}

export interface PerformanceData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
}