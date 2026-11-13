export type GradeStatus = 'Graded' | 'Pending' | 'Missing' | 'Excused' | 'PUBLISHED' | 'DRAFT';
export type GradeLetter = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' | 'F9' | '-' | string;

export interface PaperQuestionReviewItem {
  id: string;
  question: string;
  type: string;
  images?: string[];
  optionA?: string | null;
  optionB?: string | null;
  optionC?: string | null;
  optionD?: string | null;
  correctAnswer: string;
  explanation?: string | null;
  marks: number;
  studentAnswer?: string | null;
  isCorrect?: boolean | null;
  scoreAwarded?: number | null;
  requiresManualReview?: boolean;
  manuallyReviewed?: boolean;
  reviewNote?: string | null;
}

export interface StudentAnswerRecord {
  id?: string;
  questionId: string;
  answer?: string | null;
  isCorrect?: boolean | null;
  scoreAwarded?: number | null;
  requiresManualReview?: boolean;
  manuallyReviewed?: boolean;
  reviewNote?: string | null;
}

export interface StudentGrade {
  id: string;
  studentId: string;
  name: string;
  studentCode: string;
  subjectPaper: string;
  assessmentType: string;
  score: string;
  rawScore: number;
  maxMarks: number;
  totalScore: string;
  grade: GradeLetter;
  status: GradeStatus;
  remarks?: string;
  profilePicture?: string;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  examId?: string | null;
  subjectPaperId?: string | null;
  examAttemptId?: string | null;
  subjectExamAttemptId?: string | null;
  className?: string | null;
  creatorName?: string | null;
  submissionType?: 'ONLINE' | 'MANUAL' | 'OVERRIDE' | string;
  submittedAt?: string | Date | null;
  preloadedQuestions?: PaperQuestionReviewItem[];
  papers?: { id: string; name: string }[];
}

export interface FilterOption {
  label: string;
  value: string;
  icon?: string;
  options?: { label: string; value: string }[];
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
