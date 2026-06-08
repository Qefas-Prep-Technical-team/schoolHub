export interface Assignment {
  id: string;
  title: string;
  subject: { id: string; name: string };
  teacher: { firstName: string; lastName: string; user?: { avatarUrl?: string } };
  status: string;
  dueDate: string;
  instructions: string;
  totalMarks: number;
  attachmentUrl?: string | null;
  videoUrl?: string | null;
  referenceUrl?: string | null;
  questions: any[];
  submissions: any[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'document' | 'video' | 'image' | 'spreadsheet' | 'presentation';
  size: string;
  url: string;
  iconColor: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
}

export interface RubricItem {
  id: string;
  category: string;
  description: string;
  points: number;
  criteria: string;
}

export interface Material {
  id: string;
  title: string;
  type: 'book' | 'notes' | 'video' | 'article' | 'guide' | 'link';
  description: string;
  url: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}