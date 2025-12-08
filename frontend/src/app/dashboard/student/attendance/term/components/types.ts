// src/types/index.ts
export interface NavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  fill?: boolean;
  danger?: boolean;
}

export interface AttendanceStat {
  type: "present" | "absent" | "late" | "excused";
  count: number;
  icon: string;
  label: string;
}

export interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "late";
  class: string;
  comment: string;
}

export interface TermOption {
  label: string;
  value: string;
  defaultChecked?: boolean;
}
