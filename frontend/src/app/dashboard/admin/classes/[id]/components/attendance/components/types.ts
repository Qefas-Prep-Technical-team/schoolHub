export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type AttendanceType = 'daily' | 'period' | 'event';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  duration?: number; // in minutes
  comment?: string;
  submittedBy: string;
  submittedAt: string;
}

export interface AttendanceSummary {
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export interface MonthlyAttendance {
  month: string;
  year: number;
  summary: AttendanceSummary;
  dailyRecords: AttendanceRecord[];
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  status?: AttendanceStatus;
  hasAttendance: boolean;
  attendanceRate?: number;
}