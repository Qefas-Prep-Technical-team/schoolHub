export type StudentPerformance = 'Excelling' | 'Meeting' | 'Developing' | 'Concern';
export type TrendDirection = 'up' | 'down' | 'neutral';

export interface Student {
  id: number;
  name: string;
  grade: string;
  age: number;
  avatarUrl: string;
  performance: StudentPerformance;
  parentName: string;
  teacherName: string;
  teacherRole: string;
  teacherAvatarUrl: string;
}

export interface StatCardT {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    direction: TrendDirection;
    value: string;
  };
  status?: 'success' | 'warning' | 'danger' | 'neutral';
}

export interface Tab {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

export interface SubjectScore {
  name: string;
  score: number;
  maxScore: number;
}

export interface GradePoint {
  month: string;
  grade: number;
}