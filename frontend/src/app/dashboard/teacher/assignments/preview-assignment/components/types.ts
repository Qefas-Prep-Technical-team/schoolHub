export interface Student {
  id: string;
  name: string;
  studentId: string;
  grade: string;
  subject: string;
  avatarUrl: string;
  submittedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  maxScore: number;
  description?: string;
}

export interface Submission {
  id: string;
  student: Student;
  assignment: Assignment;
  fileUrl: string;
  previewUrl: string;
  submittedAt: string;
  status: 'submitted' | 'late' | 'missing';
  score?: number;
  feedback?: string;
  allowResubmission?: boolean;
  notifyParent?: boolean;
}

export interface GradingFormData {
  score: number;
  feedback: string;
  allowResubmission: boolean;
  notifyParent: boolean;
}

export interface GradingPageProps {
  submission: Submission;
  onSubmit: (data: GradingFormData) => Promise<void>;
  onCancel: () => void;
}