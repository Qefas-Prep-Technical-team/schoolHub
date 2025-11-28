export interface StudentExam {
  id: string;
  title: string;
  subject: string;
  className: string;
  dateTime: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  teacher: string;
  attempts: string;
  instructions: string[];
  startTime?: string;
}

export interface CountdownTimer {
  hours: number;
  minutes: number;
  seconds: number;
}
