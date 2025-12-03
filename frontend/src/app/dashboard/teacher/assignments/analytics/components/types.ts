export interface Student {
  id: string;
  name: string;
  score?: number;
  avatar: string;
  status: 'submitted' | 'pending';
  email?: string;
  lastActive?: Date;
}

export interface StatsCard {
  title: string;
  value: string | number;
  description?: string;
  icon?: string;
  trend?: number; // positive or negative percentage
}

export interface NavItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  isActive: boolean;
}

export interface DistributionData {
  range: string;
  percentage: number;
  count: number;
  averageScore?: number;
}

export interface SubmissionTimelineData {
  day: string;
  submissions: number;
  cumulative: number;
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  totalStudents: number;
  submittedStudents: number;
  averageScore: number;
  dueDate: Date;
  status: 'graded' | 'pending' | 'in-progress';
}