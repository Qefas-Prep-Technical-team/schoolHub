export interface AttendanceStat {
  label: string;
  value: number | string;
  change?: {
    value: string;
    isPositive: boolean;
  };
}

export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  attendance?: {
    status: "present" | "absent" | "late" | "holiday" | "weekend";
    lateMinutes?: number;
    notes?: string;
  };
  isToday?: boolean;
}

export interface AttendanceEvent {
  id: string;
  date: Date;
  status: "present" | "absent" | "late";
  lateMinutes?: number;
  reason?: string;
  teacherNote?: string;
}

export interface MonthNavigation {
  current: Date;
  previous: Date;
  next: Date;
}

export interface CalendarLegendItem {
  color: string;
  label: string;
  description?: string;
}
