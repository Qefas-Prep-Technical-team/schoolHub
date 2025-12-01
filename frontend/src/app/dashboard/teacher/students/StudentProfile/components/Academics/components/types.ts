export type SubjectTrend = 'up' | 'down' | 'neutral';

export interface Subject {
  id: number;
  name: string;
  teacher: string;
  score: number;
  trend: SubjectTrend;
  icon: string;
  active?: boolean;
}

export interface ExpandableSectionT {
  id: number;
  title: string;
  content: string;
}

export interface PerformanceData {
  subject: string;
  imageUrl: string;
  altText: string;
}