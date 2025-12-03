export interface Exam {
  id: string;
  title: string;
  class: string;
  subject: string;
  marks: number;
  questions: number;
  status: 'published' | 'completed' | 'draft';
  dateCreated: string;
  type: 'exam' | 'quiz';
  description?: string;
  duration?: number; // in minutes
  passingScore?: number;
  averageScore?: number;
  submissions?: number;
  totalStudents?: number;
}