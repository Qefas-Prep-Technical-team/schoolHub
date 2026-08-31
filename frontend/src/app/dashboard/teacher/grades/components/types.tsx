export type GradeStatus = 'Graded' | 'Pending' | 'Missing' | 'Excused';
export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | '-';

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
