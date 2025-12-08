// src/types/index.ts
export interface NavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  fill?: boolean;
}

export interface ClassItem {
  id: string;
  icon: string;
  title: string;
  time: string;
  teacher: string;
  status: "present" | "absent" | "late";
  comment?: string;
}

export interface AbsenceDetails {
  reason: string;
  note?: string;
}

export interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  maxSize?: number; // in MB
  accept?: string;
}
