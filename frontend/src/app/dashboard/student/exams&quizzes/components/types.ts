export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  filled?: boolean;
}

export interface StatCard {
  label: string;
  value: string;
  icon: string;
  link:string;
  trend?: {
    value: string;
    color: "green" | "red";
  };
}

export interface TimeFilterOption {
  id: string;
  label: string;
  active?: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  subject: string;
  date: string;
  score: string | null;
  status: "upcoming" | "graded" | "submitted" | "missing";
  type: "exam" | "quiz";
}
