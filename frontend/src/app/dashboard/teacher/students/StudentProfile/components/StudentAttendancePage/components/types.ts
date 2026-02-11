export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused' | 'none';
export type DayType = 'current-month' | 'previous-month' | 'next-month';

export interface Day {
  date: number;
  type: DayType;
  status: AttendanceStatus;
  hasNote?: boolean;
  isSelected?: boolean;
}

export interface StatCard {
  count: number;
  label: string;
  status: AttendanceStatus;
  icon: string;
}

export interface AttendanceRecord {
  date: Date;
  status: AttendanceStatus;
  comment?: string;
}