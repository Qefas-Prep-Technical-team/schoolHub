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

export interface FilterOption {
  id: string;
  label: string;
  icon?: string;
}

export interface Assessment {
  id: string;
  title: string;
  subject: string;
  score: {
    obtained: number;
    total: number;
    percentage: number;
  };
  classAverage: number;
  status: "excellent" | "passed" | "needs-improvement" | "at-risk";
  date?: string;
}
