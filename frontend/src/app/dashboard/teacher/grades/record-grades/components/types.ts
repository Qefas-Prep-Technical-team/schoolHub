export interface StudentGrade {
  id: string;
  name: string;
  studentCode: string;
  subjectPaper: string;
  assessmentType: string;
  score: number;
  total: number;
  grade: string;
  isSelected: boolean;
  hasError?: boolean;
}

export interface Term {
  id: string;
  name: string;
}

export interface Class {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface GradeLevel {
  score: number;
  grade: string;
  color: string;
}