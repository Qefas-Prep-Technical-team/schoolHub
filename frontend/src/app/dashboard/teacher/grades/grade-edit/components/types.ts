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
  updatedAt?: string | Date;
}

export interface GradeSummary {
  totalScore: number;
  totalMaxScore: number;
  finalGrade: string;
  performance: string;
  color?: string;
  bg?: string;
}

export interface Teacher {
  id: string;
  name: string;
  avatarUrl: string;
}


