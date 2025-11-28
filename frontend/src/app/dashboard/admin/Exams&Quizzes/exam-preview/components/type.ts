export interface Exam {
  id: string;
  title: string;
  subject: string;
  className: string;
  duration: number;
  totalMarks: number;
  status: "draft" | "published" | "scheduled";
  type: "cbt" | "written";
  assignedTeacher: string;
  instructions: string[];
  questions: Question[];
  statistics: ExamStatistics;
}

export interface Question {
  id: string;
  number: number;
  type: "multiple_choice" | "true_false" | "essay";
  question: string;
  options?: string[];
  correctAnswer?: string;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

export interface ExamStatistics {
  totalQuestions: number;
  multipleChoice: number;
  trueFalse: number;
  essayQuestions: number;
  totalPoints: number;
  estimatedTime: number;
}
