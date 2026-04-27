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
  grade?: string;
  section?: string;
  teacher?: {
    name: string;
    avatarUrl?: string;
  };
  teachers?: Array<{
    teacherId: string;
    isLead: boolean;
    teacher: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
  }>;
  _count?: {
    enrollments: number;
    subjects: number;
  };
  studentCount: number;
  subjectCount: number;
  timetableStatus: 'complete' | 'incomplete' | 'pending';
  color?: string;
  classCode?: string;
  departments?: Array<{ id: string; name: string }>;
  currentActivity?: string;
  isLive?: boolean;
}
