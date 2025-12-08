// src/types/index.ts
export interface NavItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  fill?: boolean;
}

export interface ExamDetail {
  label: string;
  value: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  disabled?: boolean;
}

export interface Question {
  id: string;
  number: number;
  totalQuestions: number;
  text: string;
  equation?: string;
  options: QuestionOption[];
}
