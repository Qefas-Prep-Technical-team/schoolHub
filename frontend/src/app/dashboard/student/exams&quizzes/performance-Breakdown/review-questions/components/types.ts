export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  filled?: boolean;
}

export interface FilterOption {
  label: string;
  value: 'all' | 'correct' | 'wrong' | 'unanswered';
}

export interface Question {
  id: string;
  number: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  status: 'correct' | 'wrong' | 'partially-correct';
  points?: number;
  maxPoints?: number;
}

export interface QuizInfo {
  title: string;
  description: string;
  totalQuestions: number;
  score: number;
  maxScore: number;
  date: string;
}