export type SubmissionStatus = 'graded' | 'ungraded' | 'late' | 'not-submitted';

export interface StudentSubmission {
  id: string;
  studentId: string;
  name: string;
  avatarUrl: string;
  submittedAt: string | null;
  fileUrl: string | null;
  status: SubmissionStatus;
  score: number | null;
  maxScore: number;
  feedback?: string;
  allowResubmission?: boolean;
  notifyParent?: boolean;
}

export interface AssignmentStats {
  totalStudents: number;
  graded: number;
  ungraded: number;
  averageScore: number | null;
}

export interface AssignmentInfo {
  id: string;
  title: string;
  dueDate: string;
  maxScore: number;
  subject: string;
  description?: string;
}

export interface BulkGradingProps {
  assignment: AssignmentInfo;
  submissions: StudentSubmission[];
  stats: AssignmentStats;
  onSaveAll?: (submissions: StudentSubmission[]) => Promise<void>;
  onSaveStudent?: (submissionId: string, data: Partial<StudentSubmission>) => Promise<void>;
  onDownloadFile?: (submissionId: string) => void;
  onViewStudent?: (submissionId: string) => void;
}