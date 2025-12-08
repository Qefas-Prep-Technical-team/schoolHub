// src/types/index.ts
export interface NavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}

export interface StatCard {
  title: string;
  value: string;
}

export interface SubjectPosition {
  position: string;
  subject: string;
  percentage: number;
  color: string;
  darkColor: string;
}

export interface Insight {
  icon: string;
  text: string;
  color: string;
}

export interface TrendData {
  term: string;
  position: number;
  height: string;
  isCurrent?: boolean;
}

export interface LeaderboardEntry {
  position: number;
  name: string;
  score: string;
  performance: string;
  remarks: string;
  isCurrentUser?: boolean;
}
