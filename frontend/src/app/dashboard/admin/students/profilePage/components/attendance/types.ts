// types/index.ts
export interface Tab {
  id: string;
  label: string;
}

export interface StatCard {
  label: string;
  value: string;
  color: 'present' | 'absent' | 'late' | 'excused';
}

export interface CalendarDay {
  day: number;
  status: 'present' | 'absent' | 'late' | 'excused' | null;
  isCurrentMonth: boolean;
  isToday?: boolean;
}