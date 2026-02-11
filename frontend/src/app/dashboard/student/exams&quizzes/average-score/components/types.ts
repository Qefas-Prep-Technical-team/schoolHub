// src/types/index.ts
export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export interface StatCardData {
  title: string;
  value: string;
  subtitle?: string;
}

export interface SubjectData {
  subject: string;
  testAvg: string;
  examScore: string;
  finalScore: string;
  grade: string;
  comment: string;
}

export interface TrendPoint {
  label: string;
  percentage: number;
  height: string;
}

export interface InsightCard {
  icon: string;
  title: string;
  description: string;
  color: 'green' | 'amber' | 'blue' | 'red';
}

export interface ActionButton {
  label: string;
  icon: string;
  variant: 'primary' | 'secondary';
  onClick?: () => void;
}