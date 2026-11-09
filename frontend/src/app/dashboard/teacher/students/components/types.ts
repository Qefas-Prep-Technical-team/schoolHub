export type PerformanceLevel = 'High' | 'Medium' | 'Low';
export type ViewType = 'Grid View' | 'List View';

export interface Student {
  id: string | number;
  name: string;
  grade: string;
  studentCode?: string;
  email?: string;
  avatarUrl?: string;
  performance: PerformanceLevel;
  attendance: number;
  lastExam: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
