export interface Subject {
  id: string;
  name: string;
  teacher: string;
  score: number;
  grade: string;
  gradeColor: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  progressColor: string;
  classAverage: number;
  comment: string;
  needsAttention: boolean;
}

export interface PerformanceStats {
  overallAverage: number;
  totalSubjects: number;
  topSubject: string;
  needsFocus: string;
  topSubjectScore: number;
  needsFocusScore: number;
}

export interface FilterOptions {
  term: string;
  assessmentType: string;
  searchQuery: string;
}

export interface Teacher {
  name: string;
  subject: string;
  contactEmail: string;
}