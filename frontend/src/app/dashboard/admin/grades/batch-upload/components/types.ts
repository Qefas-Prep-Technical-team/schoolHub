export interface GradeRecord {
  studentId: string;
  studentName: string;
  subjectCode: string;
  grade: number;
  comments: string;
  errors?: string[];
}

export interface UploadValidation {
  isValid: boolean;
  totalRows: number;
  errorCount: number;
  warnings: number;
  errors: string[];
}

export interface FileUploadState {
  file: File | null;
  isDragging: boolean;
  isProcessing: boolean;
  validation: UploadValidation;
  records: GradeRecord[];
}
