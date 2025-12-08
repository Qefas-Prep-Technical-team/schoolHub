export interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  filled?: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  type: "exam" | "quiz" | "submission";
  date: string;
  time: string;
  duration: string;
  format: "CBT" | "Written" | "Oral";
  subject: string;
}

export interface AssessmentGroup {
  id: string;
  title: string;
  assessments: Assessment[];
}

export interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
