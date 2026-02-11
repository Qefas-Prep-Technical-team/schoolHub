export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  points: number;
  instructor: string;
  course: string;
  instructions: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'document' | 'image' | 'video' | 'archive' | 'other';
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  url?: string;
  file?: File;
  error?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}