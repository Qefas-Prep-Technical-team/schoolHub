export type CalendarEventType = 'upcoming' | 'completed' | 'pending' | 'missed';

export interface ExamEvent {
  id: string;
  examId?: string;
  title: string;
  subject?: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: CalendarEventType;
  category?: string;
  durationMinutes?: number;
  score?: number;
  maxScore?: number;
  percentage?: number;
  grade?: string;
  teacher?: string;
  remarks?: string;
  icon?: string;
  colorClass?: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface CalendarDay {
  date: Date;
  dateStr: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasEvents: boolean;
  events: ExamEvent[];
}

export interface CalendarStats {
  upcomingCount: number;
  completedCount: number;
  totalAssessments: number;
  averageScore: number;
}
