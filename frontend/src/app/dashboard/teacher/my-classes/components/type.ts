export interface Class {
  id: string;
  name: string;
  subject: string;
  level: string;
  section: string;
  studentCount: number;
  schedule: string[];
  image: string;
  assignments: number;
  exams: number;
  attendance: number;
  averageGrade: number;
  teacherId?: string;
  academicYear?: string;
  term?: string;
  room?: string;
  description?: string;
}

export interface ClassFilter {
  academicYear: string;
  term: string;
  level: string;
  class: string;
  subject: string;
}

export interface ClassStats {
  totalClasses: number;
  totalStudents: number;
  averageAttendance: number;
  pendingGrading: number;
  upcomingExams: number;
}
