export interface User {
  name: string;
  role: string;
  avatarUrl: string;
}

export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  fill?: boolean;
}

export interface Question {
  id: number;
  title: string;
  //   content: string;
  equation?: string;
  options: {
    id: string;
    text: string;
    correct?: boolean;
    selected?: boolean;
  }[];
  disabled?: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  subject: string;
  grade: string;
  totalQuestions: number;
  currentQuestion: number;
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

// Re-export all types
