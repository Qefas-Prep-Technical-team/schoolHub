// src/types/index.ts
export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export interface ExamStat {
  label: string;
  value: string | number;
}

export interface InstructionItem {
  icon: string;
  text: string;
}

export interface ScheduleItem {
  label: string;
  value: string;
}

export interface TechnicalRequirement {
  icon: string;
  text: string;
}
