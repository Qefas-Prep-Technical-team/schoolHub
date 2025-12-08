// src/types/index.ts
export interface NavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  fill?: boolean;
}

export interface DayData {
  date: number;
  status: "present" | "absent" | "late" | "no-class" | "future" | "today";
  subject?: string;
  comment?: string;
  tooltip?: {
    title: string;
    description: string;
  };
}

export interface LegendItem {
  label: string;
  color: string;
  description: string;
}

export interface CalendarDayProps extends DayData {
  isToday?: boolean;
  onClick?: () => void;
}
