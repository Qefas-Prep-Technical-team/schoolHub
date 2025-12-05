export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  filled?: boolean;
}

export interface TermFilter {
  id: string;
  label: string;
  active?: boolean;
}

export interface StatCard {
  label: string;
  value: string;
  trend?: {
    value: string;
    icon: string;
    color: 'green' | 'primary' | 'red';
  };
}

export interface SubjectPerformance {
  subject: string;
  score: number;
  category: 'strength' | 'weakness';
}

export interface PerformanceData {
  term: string;
  score: number;
}

export interface ComparisonSubject {
  name: string;
  yourScore: number;
  classAverage: number;
}

export interface Goal {
  id: string;
  text: string;
  completed?: boolean;
}