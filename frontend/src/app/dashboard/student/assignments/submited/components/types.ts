export interface Submission {
  id: string;
  assignment: string;
  course: string;
  submittedAt: string;
  status: 'awaiting_grade' | 'graded' | 'returned' | 'draft';
  points: number;
  dueDate: string;
  grade?: string;
  feedback?: string;
  gradedAt?: string;
  instructor?: string;
}

export interface SubmittedFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'document' | 'image' | 'video' | 'archive' | 'other';
  iconColor: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
  url?: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}