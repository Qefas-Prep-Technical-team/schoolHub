export interface User {
  name: string;
  role: string;
  avatarUrl: string;
}

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  fill?: boolean;
}

export interface StatCard {
  id: string;
  title: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon?: string;
}

export interface FilterChip {
  id: string;
  label: string;
  value: string;
  options?: string[];
}

export interface ClassData {
  id: string;
  name: string;
  grade: string;
  section: string;
  teacher: {
    name: string;
    avatarUrl: string;
  };
  studentCount: number;
  subjectCount: number;
  timetableStatus: 'complete' | 'incomplete' | 'pending';
  color?: string;
}