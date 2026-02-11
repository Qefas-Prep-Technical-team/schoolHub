export type PublishStatus = "draft" | "publish-now" | "schedule-later";

export interface AssignmentFormData {
  title: string;
  subject: string;
  classes: string[];
  instructions: string;
  attachments: File[];
  dueDate: string;
  publishStatus: PublishStatus;
  allowLateSubmissions: boolean;
  maxScore: number;
  scheduledDate?: string;
}

export interface ClassTag {
  id: string;
  name: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "docx" | "image" | "other";
  url?: string;
  file?: File;
}

export interface CreateAssignmentProps {
  onSubmit?: (data: AssignmentFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}
