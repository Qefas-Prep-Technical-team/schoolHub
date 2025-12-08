// src/types/index.ts
export interface QuizStat {
  icon: string;
  value: string | number;
  label: string;
}

export interface InstructionItem {
  icon: string;
  text: string;
}

export interface AttemptHistoryT {
  attempt: number;
  score: string;
  date: string;
  isBestScore?: boolean;
}

export interface CountdownTime {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}
