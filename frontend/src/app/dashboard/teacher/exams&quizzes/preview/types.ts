export interface ExamPreviewData {
  id: string;
  title: string;
  class: string;
  duration: number; // in minutes
  subject: string;
  totalQuestions: number;
  description?: string;
  instructions?: string;
  passingScore?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
}

export interface Question {
  id: number;
  text: string;
  type: 'mcq' | 'true-false' | 'short-answer' | 'essay';
  marks: number;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
  };
}

export interface ExamSession {
  examId: string;
  currentQuestion: number;
  selectedAnswers: Record<number, number | string>;
  startTime: Date;
  timeRemaining: number; // in seconds
  isSubmitted: boolean;
}