// src/types/index.ts
export interface NavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  fill?: boolean;
}

export interface SubjectData {
  id: string;
  name: string;
  percentage: number;
  trend: "up" | "down";
  trendValue: string;
  color?: string;
  classesHeld: number;
  classesAttended: number;
}

export interface StatsCardData {
  title: string;
  value: string | number;
  trend?: {
    direction: "up" | "down";
    value: string;
    color: string;
  };
}

export interface FilterOption {
  label: string;
  value: string;
  icon: string;
}
