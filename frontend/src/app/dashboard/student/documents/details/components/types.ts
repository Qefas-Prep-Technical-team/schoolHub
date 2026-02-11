export interface User {
  name: string;
  grade: string;
  avatarUrl: string;
}

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  fill?: boolean;
}

export interface DocumentDetails {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  uploader: string;
  description: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
  fileSize: string;
  fileType: string;
  downloadUrl: string;
  viewUrl: string;
}

export interface Version {
  id: string;
  number: string;
  isCurrent: boolean;
  uploadDate: Date;
  fileSize: string;
}

export interface Tag {
  id: string;
  label: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo' | 'pink';
}

export interface RelatedMaterial {
  id: string;
  title: string;
  icon: string;
  href: string;
}