export interface User {
  name: string;
  studentId: string;
  avatarUrl: string;
  role: string;
}

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  fill?: boolean;
}

export interface Document {
  id: string;
  title: string;
  type: 'assignment' | 'results' | 'study_materials' | 'school_letters' | 'certificate';
  category: string;
  uploadDate: Date;
  fileSize?: string;
  fileType: 'pdf' | 'doc' | 'image' | 'txt' | 'other';
  icon: string;
  iconColor: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'indigo';
  isFavorited: boolean;
  downloadUrl?: string;
  viewUrl?: string;
}

export interface FilterChip {
  id: string;
  label: string;
  active: boolean;
  count?: number;
}

export interface SortOption {
  id: string;
  label: string;
  value: string;
}