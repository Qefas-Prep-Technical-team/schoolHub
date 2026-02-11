export interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  fileSize: string;
  uploadedBy: string;
  uploadDate: Date;
  previewImage: string;
  fileType: 'pdf' | 'doc' | 'image' | 'txt';
  downloadUrl: string;
}

export interface RelatedDocument {
  id: string;
  title: string;
  icon: string;
  href: string;
  active?: boolean;
  iconColor?: string;
}

export interface MetadataItem {
  label: string;
  value:  React.ReactNode;
  icon?: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}