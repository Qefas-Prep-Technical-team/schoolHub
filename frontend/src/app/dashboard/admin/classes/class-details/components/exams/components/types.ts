export type ExamType = 'quiz' | 'test' | 'midterm' | 'final' | 'practice';
export type ExamStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'graded';

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
  duration: number; // in minutes
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