export interface AttendanceStats {
  studentPresence: number;
  teacherPresence: number;
  studentAbsentees: number;
  teacherAbsentees: number;
  studentTrend: {
    value: string;
    isPositive: boolean;
  };
  teacherTrend: {
    value: string;
    isPositive: boolean;
  };
}

export interface AttendanceDataPoint {
  date: string;
  studentAttendance: number;
  teacherAttendance: number;
}

export interface LowAttendanceClass {
  id: string;
  name: string;
  attendance: number;
  severity: "severe" | "warning" | "moderate";
  teacher?: string;
  department?: string;
}

export interface AbsentStaff {
  id: string;
  name: string;
  department: string;
  leaveType: "sick" | "personal" | "vacation" | "unexcused" | "other";
  imageUrl: string;
  notes?: string;
}

export interface DateFilter {
  id: string;
  label: string;
  value: string;
  isActive: boolean;
}
