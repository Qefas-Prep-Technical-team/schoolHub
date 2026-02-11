export interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  className: string;
  subject: string;
  avatarUrl: string;
  overallGrade: string;
  overallPerformance: string;
}

export interface AssessmentScore {
  component: 'classwork' | 'assignment' | 'exam';
  label: string;
  maxScore: number;
  score: number;
  oldScore?: number;
  percentage: number;
}

export interface ScoreHistoryT {
  component: string;
  oldScore: string;
  newScore: string;
}

export interface GradeSummary {
  totalScore: number;
  totalMaxScore: number;
  finalGrade: string;
  performance: string;
}

export interface Teacher {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface GradeFormData {
  classwork: number;
  assignment: number;
  exam: number;
  comment: string;
  notifyParent: boolean;
}