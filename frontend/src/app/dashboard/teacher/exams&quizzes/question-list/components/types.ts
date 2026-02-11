export interface Question {
  id: string;
  number: number;
  text: string;
  marks: number;
  type: 'mcq' | 'essay' | 'true_false' | 'calculation' | 'matching' | 'short_answer';
  status: 'draft' | 'incomplete' | 'saved' | 'published';
  examId: string;
  options?: QuestionOption[];
  correctAnswer?: string | string[];
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface BulkAction {
  id: string;
  label: string;
  action: (questionIds: string[]) => void;
}