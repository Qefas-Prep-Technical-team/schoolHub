export type AssignmentStatus = "published" | "draft" | "scheduled";

export type SubmissionStatus = "on-time" | "late" | "missing" | "graded";

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  classes: string[]; // <-- exists here
  dueDate: string;
  status: AssignmentStatus;
  instructions: string;
  attachments: Attachment[];
  teacher: {
    id: string;
    name: string;
    avatarUrl: string;
  };
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "docx" | "image" | "other";
  url: string;
}

export interface StudentSubmission {
  id: string;
  student: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  submissionTime: string | null;
  status: SubmissionStatus;
  score: number | null;
  maxScore: number;
  graded: boolean;
}

export interface SubmissionsOverviewT {
  totalStudents: number;
  submitted: number;
  graded: number;
  missing: number;
  averageScore: number | null;
}
