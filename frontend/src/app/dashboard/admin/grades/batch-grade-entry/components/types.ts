export interface StudentGrade {
  id: string;
  studentName: string;
  studentId: string;
  score: number | null;
  remarks: string;
  hasError?: boolean;
}

export interface BatchGradeEntry {
  className: string;
  subject: string;
  assessment: string;
  maxScore: number;
  students: StudentGrade[];
}

export interface SaveStatus {
  isSaved: boolean;
  lastSaved?: Date;
  isSaving?: boolean;
}
