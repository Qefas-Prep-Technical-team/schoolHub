import {
  NavItem,
  BreadcrumbItem,
  AssessmentInfo,
  Metric,
  TopicPerformanceT,
  ScoreRange,
  Feedback,
} from "./types";

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "#" },
  { label: "My Courses", icon: "school", href: "#" },
  {
    label: "Exams & Quizzes",
    icon: "quiz",
    href: "#",
    active: true,
    filled: true,
  },
  { label: "Schedule", icon: "calendar_month", href: "#" },
  { label: "Settings", icon: "settings", href: "#" },
];

export const bottomNavItems: NavItem[] = [
  { label: "Logout", icon: "logout", href: "#" },
];

export const userInfo = {
  name: "Alex Johnson",
  grade: "Grade 10",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDu_8kdlvAMgLoeeFocSxdBgueTjE_YMj0eQSOnkQsiuiVeM88hvtyI1Zd35wJ2gb9q_n9lQSsawOe5WdOnTFhvULVvmsbw4p4EZzc79gROzyLL0EdbMXEAt5fNwclj_MOJ0ehbuw35s2wvqmyq8VC1tesw_gPqw8fMAzc0gXKrKv7wq7RXHSagDUlmRmZN3VKo3D52eEvbSrdOki76HRrFuleywK0BKdAdixB3WYOxaQJ1CPQZiSO8RtPhyRmjev-AfhUNdGGhH1Y",
};

export const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "#" },
  { label: "Exams & Quizzes", href: "#" },
  { label: "Mid-Term Physics Exam" },
];

export const assessmentInfo: AssessmentInfo = {
  title: "Physics Mid-Term Exam",
  date: "Taken on October 26, 2023",
  score: 85,
  total: 100,
  percentage: 85,
};

export const metrics: Metric[] = [
  {
    label: "Class Average",
    value: 72,
    subtext: "+18% vs Average",
    trend: "positive",
  },
  {
    label: "Highest Score",
    value: 98,
  },
  {
    label: "Your Percentile",
    value: "88th",
    subtext: "Top 12%",
  },
];

export const topicPerformances: TopicPerformanceT[] = [
  {
    topic: "Kinematics",
    percentage: 95,
    color: "green",
  },
  {
    topic: "Dynamics",
    percentage: 90,
    color: "green",
  },
  {
    topic: "Thermodynamics",
    percentage: 75,
    color: "yellow",
  },
  {
    topic: "Electromagnetism",
    percentage: 60,
    color: "red",
  },
];

export const scoreDistribution: ScoreRange[] = [
  { range: "0-50", percentage: 15 },
  { range: "51-60", percentage: 35 },
  { range: "61-70", percentage: 60 },
  { range: "71-80", percentage: 80 },
  { range: "81-90", percentage: 90, isUserRange: true },
  { range: "91-100", percentage: 50 },
];

export const feedback: Feedback = {
  general:
    "Great work, Alex! You have a solid grasp on Kinematics and Dynamics. Your score is well above the class average. Focus a bit more on Electromagnetism to bring that score up.",
  suggestions: [
    "Review concepts of magnetic fields and induction.",
    "Practice problems on the laws of thermodynamics.",
  ],
};
