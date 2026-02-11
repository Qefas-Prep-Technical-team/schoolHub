export interface QuestionFormData {
  id?: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  options?: QuestionOption[];
  marks: number;
  explanation?: string;
  media?: {
    url: string;
    type: 'image' | 'video' | 'audio';
    name: string;
  };
  tags?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  hint?: string;
  questionBank?: string;
  createdAt?: Date;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order?: number;
}