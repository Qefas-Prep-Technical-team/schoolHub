export interface ExamSubjectDetail {
  id: string;
  name: string;
  score: number;
  totalMarks: number;
  percentage: number;
  teacher?: string;
  remarks?: string;
}

export interface ExamQuestionDetail {
  id: string;
  subjectPaperId?: string;
  subjectName?: string;
  paperTitle?: string;
  number: string | number;
  title: string;
  points: string;
  scoreAwarded: number;
  maxMarks: number;
  isCorrect: boolean | null;
  userAnswer?: string;
  correctAnswer?: string;
  explanation?: string;
  reviewNote?: string;
}

export interface ExamDetailData {
  id: string;
  title: string;
  category: string;
  date: string;
  term?: string;
  session?: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  studentImage?: string;
  currentClass?: string;
  schoolName?: string;
  schoolProfile?: Record<string, unknown>;
  score: number;
  totalScore: number;
  percentage: number;
  grade: string;
  proficiency?: string;
  classAverage?: number;
  position?: string;
  globalStanding?: number;
  velocity?: number;
  papersCount: number;
  subjects: ExamSubjectDetail[];
  questions: ExamQuestionDetail[];
  strengths: string[];
  weaknesses: { name: string; description: string }[];
  teacherNote?: {
    teacherName: string;
    subject?: string;
    avatarUrl?: string;
    note: string;
  };
}
