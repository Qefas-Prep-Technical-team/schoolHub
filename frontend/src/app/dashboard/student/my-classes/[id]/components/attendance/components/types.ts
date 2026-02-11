export type AttendanceStatus = "present" | "absent" | "late";

export interface AttendanceRecord {
  id: string;
  date: string;
  status: AttendanceStatus;
  classTopic: string;
  time?: string;
  notes?: string;
}

export interface AttendanceStatsType {
  overallRate: number;
  daysPresent: number;
  daysAbsent: number;
  lateArrivals: number;
  changeFromPrevious: {
    rate: number;
    absent: number;
    late: number;
  };
}

export interface MonthlyData {
  month: string;
  present: number;
  absent: number;
  late: number;
  isCurrent?: boolean;
}

export interface AttendanceInsight {
  type: "positive" | "warning" | "info";
  icon: string;
  message: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
}
