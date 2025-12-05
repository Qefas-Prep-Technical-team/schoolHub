export interface Assignment {
  id: string;
  title: string;
  subject: string;
  instructor: {
    name: string;
    avatarUrl: string;
  };
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'overdue';
  dueDate: string;
  description: string;
  points: number;
  submissionType: 'file_upload' | 'text_entry' | 'both';
  allowedFormats?: string[];
  maxFileSize?: string;
  instructions: {
    objective: string;
    requirements: { label: string; value: string }[];
    guidingQuestions: string[];
    additionalNotes: string;
  };
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