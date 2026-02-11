import { NavItem, StatCard, TimeFilterOption, Assessment } from "./types";

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "#" },
  { label: "Timetable", icon: "calendar_month", href: "#" },
  { label: "Subjects", icon: "book", href: "#" },
  {
    label: "Exams & Quizzes",
    icon: "quiz",
    href: "#",
    active: true,
    filled: true,
  },
  { label: "Profile", icon: "person", href: "#" },
];

export const bottomNavItems: NavItem[] = [
  { label: "Settings", icon: "settings", href: "#" },
  { label: "Logout", icon: "logout", href: "#" },
];

export const statCards: StatCard[] = [
  {
    label: "Upcoming",
    value: "3",
    icon: "event_upcoming",
    link: "upcoming-assessment",
  },
  {
    label: "Completed",
    value: "12",
    icon: "task_alt",
    link: "completed",
  },
  {
    label: "Average Score",
    value: "85%",
    icon: "monitoring",
    link: "average-score",
    trend: {
      value: "+2.5%",
      color: "green",
    },
  },
  {
    label: "Class Position",
    value: "5th",
    icon: "emoji_events",
    link: "class-position",
    trend: {
      value: "-1",
      color: "red",
    },
  },
];

export const timeFilters: TimeFilterOption[] = [
  { id: "month", label: "This Month" },
  { id: "term", label: "This Term", active: true },
  { id: "all", label: "All Records" },
];

export const assessments: Assessment[] = [
  {
    id: "1",
    title: "Mid-Term Physics Exam",
    subject: "Physics",
    date: "Oct 25, 2024",
    score: null,
    status: "upcoming",
    type: "exam",
  },
  {
    id: "2",
    title: "Calculus Chapter 3 Test",
    subject: "Mathematics",
    date: "Sep 30, 2024",
    score: "92%",
    status: "graded",
    type: "exam",
  },
  {
    id: "3",
    title: "Literary Analysis Essay",
    subject: "English Literature",
    date: "Sep 15, 2024",
    score: "78%",
    status: "graded",
    type: "quiz",
  },
  {
    id: "4",
    title: "World War II Project",
    subject: "History",
    date: "Oct 12, 2024",
    score: null,
    status: "submitted",
    type: "exam",
  },
];
