// types/index.ts
export interface Tab {
  id: string;
  label: string;
}

export interface StatCard {
  label: string;
  value: number;
}

export interface TimelineEvent {
  id: string;
  type: 'incident' | 'note' | 'merit' | 'demerit';
  title: string;
  date: string;
  description: string;
  loggedBy: string;
}

export interface FilterOption {
  label: string;
  value: string;
}