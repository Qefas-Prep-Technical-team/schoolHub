export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  filled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AssessmentStats {
  label: string;
  value: string;
  subValue?: string;
  badge?: string;
}

export interface RubricItem {
  category: string;
  score: string;
  maxScore: number;
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  icon: string;
  iconColor: string;
  downloadUrl: string;
}

export interface FeedbackItem {
  id: string;
  content: string;
  type: 'strength' | 'improvement';
  icon: string;
  iconColor: string;
}