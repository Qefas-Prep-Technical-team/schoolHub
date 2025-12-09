export interface User {
  name: string;
  studentId: string;
  avatarUrl: string;
}

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  fill?: boolean;
}

export interface ImportantDocument {
  id: string;
  title: string;
  description: string;
  from: string;
  uploadDate: Date;
  icon: string;
  iconColor?: string;
  isStarred: boolean;
  isUnread?: boolean;
  fileType?: string;
  fileSize?: string;
}