export type ExamType = 'exam' | 'ca' | 'quiz' | 'assignment';
export type ExamStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'graded' | 'unpublished' | 'expired';

export interface Exam {
  id: string;
  title: string;
  description?: string;
  type: ExamType;
  status: ExamStatus;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  totalMarks: number;
  duration: number;
  date: string;
  dueDate?: string;
  questions: number;
  totalStudents: number;
  completedStudents: number;
  averageScore?: number;
  passingMarks?: number;
  instructions?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Unified row type for the assessments table (covers Exam + Assignment)
export interface AssessmentItem {
  id: string;
  title: string;
  type: ExamType;
  status: string;
  subjectName: string;
  subjectNames?: string[];
  totalMarks: number;
  duration?: number;
  dueDate?: string;
  date: string;
  endDate?: string;
  totalStudents: number;
  completedStudents: number;
  source: 'exam' | 'assignment';
}

export interface Question {
  id: string;
  examId: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer: string | string[];
  marks: number;
  explanation?: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  score: number;
  percentage: number;
  grade?: string;
  submittedAt: string;
  gradedAt?: string;
  answers: {
    questionId: string;
    answer: string;
    isCorrect: boolean;
    marksObtained: number;
  }[];
}