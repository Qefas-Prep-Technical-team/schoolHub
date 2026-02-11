import { NavItem, BreadcrumbItem, FilterOption, Assessment } from "./types";

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "#" },
  { label: "Courses", icon: "book", href: "#" },
  { label: "Upcoming Assessments", icon: "schedule", href: "#" },
  {
    label: "Completed Exams",
    icon: "check_circle",
    href: "#",
    active: true,
    filled: true,
  },
];

export const bottomNavItems: NavItem[] = [
  { label: "Settings", icon: "settings", href: "#" },
  { label: "Logout", icon: "logout", href: "#" },
];

export const userInfo = {
  name: "Samantha Reed",
  email: "s.reed@university.edu",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBB11TfiEiMdznd7t1i2_gMQL4unvxvQ2WmmwRWoOwo0nJsI094rHVyo03jpIq4uZKayhtWZzZuRiVtWknSBpnFh2MQTh6Ak3XcEcOo6-76KrzAikGn-U8iXGAzLLggyzTSSxX6QTksj7EQLo9tOUxel32hARu9ilWaTyLcjS1zUV0lyqR7IXfxvooE2oFbzOXCNOezGNbCWA0pYJM9b3Jo6wnbU8G4GGyeo0rryfVTEQNBvLU1vwvS0ox3x3rw24hCgJfGkICrvns",
};

export const breadcrumbs: BreadcrumbItem[] = [
  { label: "Dashboard", href: "#" },
  { label: "Exams & Quizzes", href: "#" },
  { label: "Completed" },
];

export const typeFilters: FilterOption[] = [
  { id: "all", label: "Type: All" },
  { id: "exam", label: "Exams" },
  { id: "quiz", label: "Quizzes" },
  { id: "project", label: "Projects" },
];

export const subjectFilters: FilterOption[] = [
  { id: "all", label: "Subject: All" },
  { id: "history", label: "History" },
  { id: "mathematics", label: "Mathematics" },
  { id: "physics", label: "Physics" },
  { id: "computer-science", label: "Computer Science" },
];

export const scoreFilters: FilterOption[] = [
  { id: "any", label: "Score: Any" },
  { id: "excellent", label: "Excellent (90%+)" },
  { id: "good", label: "Good (80-89%)" },
  { id: "average", label: "Average (70-79%)" },
  { id: "needs-work", label: "Needs Work (<70%)" },
];

export const assessments: Assessment[] = [
  {
    id: "1",
    title: "Chapter 3 Quiz",
    subject: "History",
    score: {
      obtained: 45,
      total: 50,
      percentage: 90,
    },
    classAverage: 78,
    status: "excellent",
  },
  {
    id: "2",
    title: "Mid-Term Exam",
    subject: "Mathematics",
    score: {
      obtained: 85,
      total: 100,
      percentage: 85,
    },
    classAverage: 82,
    status: "passed",
  },
  {
    id: "3",
    title: "Pop Quiz 1",
    subject: "Physics",
    score: {
      obtained: 12,
      total: 20,
      percentage: 60,
    },
    classAverage: 75,
    status: "needs-improvement",
  },
  {
    id: "4",
    title: "Final Project",
    subject: "Computer Science",
    score: {
      obtained: 92,
      total: 100,
      percentage: 92,
    },
    classAverage: 88,
    status: "excellent",
  },
];
