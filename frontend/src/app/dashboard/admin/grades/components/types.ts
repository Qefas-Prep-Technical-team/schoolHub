export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  examType: string;
  score: number;
  grade: string;
  remarks: string;
  status: "pass" | "fail";
  date: string;
}

export interface GradeFilters {
  class: string;
  term: string;
  subject: string;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
