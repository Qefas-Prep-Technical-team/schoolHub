export interface Document {
  id: number;
  title: string;
  fileType: "PDF" | "DOCX" | "PPTX" | "XLSX" | "TXT" | "OTHER";
  fileSize: string;
  uploadedBy: string;
  dateAdded: string;
  isSharedWithParents: boolean;
  downloadUrl?: string;
  previewUrl?: string;
}

export interface Breadcrumb {
  label: string;
  href: string;
  isCurrent?: boolean;
}
