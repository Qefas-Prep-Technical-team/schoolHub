export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  bold?: boolean;
}

export interface Assessment {
  id: string;
  name: string;
  score: string;
  weight: string;
  status: 'graded' | 'pending' | 'missing';
}

export interface Term {
  id: string;
  label: string;
  active?: boolean;
}

export interface SubjectInfo {
  title: string;
  teacher: string;
  subjectCode?: string;
}

export interface PerformanceData {
  id: string;
  label: string;
  value: number;
  color?: string;
}