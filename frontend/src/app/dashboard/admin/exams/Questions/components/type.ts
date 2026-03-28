export type QuestionType =
  | "Multiple Choice"
  | "True/False"
  | "Short Answer"
  | "Essay";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface QuestionOption {
  id: number;
  text: string;
  correct: boolean;
  letter: string;
}

export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options: QuestionOption[];
  marks: number;
  difficulty: Difficulty;
  shuffleOptions: boolean;
}

export interface QuestionListItemT {
  id: number;
  title: string;
  type: QuestionType;
  marks: number;
  active: boolean;
}
