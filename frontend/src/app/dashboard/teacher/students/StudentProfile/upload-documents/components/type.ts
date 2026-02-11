export interface ClassOption {
  id: number;
  name: string;
  subject: string;
  grade: string;
  selected: boolean;
}

export interface UploadFormData {
  title: string;
  description: string;
  classes: ClassOption[];
  shareWithParents: boolean;
  file?: File;
}

export interface UploadStatus {
  isLoading: boolean;
  isSuccess: boolean;
  error?: string;
}