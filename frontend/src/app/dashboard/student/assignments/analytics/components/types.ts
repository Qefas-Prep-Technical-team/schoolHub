export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
}

export interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

export interface Deadline {
  id: string;
  title: string;
  subject: string;
  dueIn: string;
  status: 'in-progress' | 'not-started' | 'completed';
  icon: string;
  iconColor: string;
}

export interface ImprovementTip {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBgColor: string;
  iconColor: string;
}

export interface PerformanceData {
  month: string;
  score: number;
}