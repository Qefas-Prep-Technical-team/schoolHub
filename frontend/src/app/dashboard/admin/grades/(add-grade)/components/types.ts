export interface GradeFormData {
  studentId: string;
  classId: string;
  subjectId: string;
  assessmentType: string;
  score: number | null;
  maxMarks: number;
  remarks: string;
}

export interface Student {
  id: string;
  name: string;
  studentId: string;
}

export interface Class {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
}
