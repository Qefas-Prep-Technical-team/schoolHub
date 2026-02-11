export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  filled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AssessmentInfo {
  title: string;
  date: string;
  score: number;
  total: number;
  percentage: number;
}

export interface Metric {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "positive" | "negative" | "neutral";
}

export interface TopicPerformanceT {
  topic: string;
  percentage: number;
  color: "green" | "yellow" | "red";
}

export interface ScoreRange {
  range: string;
  percentage: number;
  isUserRange?: boolean;
}

export interface Feedback {
  general: string;
  suggestions: string[];
}
