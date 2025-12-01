export type PerformanceLevel = 'High' | 'Medium' | 'Low';
export type ViewType = 'Grid View' | 'List View';

export interface Student {
  id: number;
  name: string;
  grade: string;
  avatarUrl: string;
  performance: PerformanceLevel;
  attendance: number;
  lastExam: string;
}

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
}

export interface FilterOption {
  label: string;
  icon: string;
}