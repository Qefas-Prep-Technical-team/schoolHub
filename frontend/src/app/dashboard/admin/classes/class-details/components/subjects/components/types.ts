export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  teacherId: string;
  teacherName: string;
  color?: string;
  icon: string;
  assignments: number;
  exams: number;
  averageScore: number;
  classPerformance: number;
  enrolledStudents: number;
  credits: number;
  semester: 'fall' | 'spring' | 'summer';
  academicYear: string;
  schedule?: {
    day: string;
    time: string;
    room: string;
  }[];
}

export interface ClassInfo {
  id: string;
  name: string;
  section: string;
  grade: string;
  semester: string;
  academicYear: string;
  totalStudents: number;
  teacherId: string;
  teacherName: string;
}