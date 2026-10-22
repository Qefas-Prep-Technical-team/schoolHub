export type OfflineAssessmentCategory = 'CA' | 'QUIZ' | 'MIDTERM' | 'ASSIGNMENT' | 'EXAM';

export interface StudentRosterItem {
  id: string;
  name: string;
  studentCode: string;
  profileImage?: string | null;
  gender?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
}

export interface OfflineStudentGradeEntry {
  studentId: string;
  studentName: string;
  studentCode: string;
  profileImage?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  score: string | number;
  remarks?: string;
  existingGradeId?: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface OfflineGradesBatchConfig {
  classId: string;
  className?: string;
  departmentId?: string;
  departmentName?: string;
  subject: string;
  category: OfflineAssessmentCategory;
  assessmentType: string;
  maxMarks: number;
  weight: number;
  term: string;
  sessionId: string;
  sessionName?: string;
  releaseDate?: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export interface GradeBatchSummary {
  id: string;
  classId: string;
  className: string;
  subject: string;
  category: OfflineAssessmentCategory;
  assessmentType: string;
  maxMarks: number;
  term: string;
  sessionId: string;
  sessionName?: string;
  releaseDate?: string;
  totalStudents: number;
  gradedStudents: number;
  averageScore: number;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
}
