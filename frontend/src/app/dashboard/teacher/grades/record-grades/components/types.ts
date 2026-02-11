export interface StudentGrade {
  id: string;
  name: string;
  studentId: string;
  caScore: number;
  assignmentScore: number;
  examScore: number;
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