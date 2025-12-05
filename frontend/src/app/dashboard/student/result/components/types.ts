export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  filled?: boolean;
}

export interface StatCard {
  title: string;
  value: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface FilterOption {
  label: string;
  value: string;
  icon?: string;
}

export interface SubjectPerformance {
  id: string;
  subject: string;
  score: string;
  grade: string;
  gradeColor: 'green' | 'blue' | 'yellow' | 'orange' | 'red';
  progress: number;
  performance: 'Excellent' | 'Good' | 'Average' | 'Needs Work';
  performanceColor: 'green' | 'blue' | 'yellow' | 'orange';
}