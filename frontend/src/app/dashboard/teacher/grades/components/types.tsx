export type GradeStatus = 'Graded' | 'Pending' | 'Missing' | 'Excused';
export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'F' | '-';

export interface StudentGrade {
  id: number;
  name: string;
  studentId: string;
  caScore: string; // Continuous Assessment
  assignmentScore: string;
  examScore: string;
  totalScore: string;
  grade: GradeLetter;
  status: GradeStatus;
}

export interface FilterOption {
  label: string;
  value: string;
  icon: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}