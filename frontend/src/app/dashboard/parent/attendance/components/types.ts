export interface Student {
  id: string;
  name: string;
  grade: string;
  studentId: string;
  imageUrl: string;
  parentName: string;
  parentImageUrl: string;
}

export interface AttendanceStats {
  overall: number;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
}

export interface MonthlyData {
  month: string;
  attendance: number;
  isCurrent: boolean;
}

export interface Activity {
  id: string;
  date: string;
  status: 'present' | 'late' | 'absent';
  description: string;
  time?: string;
  lateMinutes?: number;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  isActive: boolean;
  badge?: number;
}