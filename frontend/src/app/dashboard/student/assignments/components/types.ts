export interface User {
  name: string;
  avatarUrl: string;
  grade: string;
}

export type AssignmentStatus = 'pending' | 'submitted' | 'graded' | 'overdue';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  dueDate: string;
  status: AssignmentStatus;
  progress: number;
  color: 'green' | 'blue' | 'orange' | 'red' | 'purple' | 'yellow';
  grade?: string;
  submissionDate?: string;
  dueInDays?: number;
  overdueDays?: number;
  description?: string;
  attachments?: number;
}

export interface NavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  fill?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
}