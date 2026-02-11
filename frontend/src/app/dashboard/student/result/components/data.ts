import { NavItem, StatCard, FilterOption, SubjectPerformance } from './types';

export const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '#' },
  { 
    label: 'Results', 
    icon: 'monitoring', 
    href: '#', 
    active: true, 
    filled: true 
  },
  { label: 'Courses', icon: 'book', href: '#' },
  { label: 'Profile', icon: 'person', href: '#' },
];

export const bottomNavItems: NavItem[] = [
  { label: 'Settings', icon: 'settings', href: '#' },
  { label: 'Logout', icon: 'logout', href: '#' },
];

export const stats: StatCard[] = [
  {
    title: 'Overall Average / GPA',
    value: '3.8 GPA',
  },
  {
    title: 'Class Rank',
    value: '5th',
  },
  {
    title: 'Completed Exams',
    value: '24',
  },
  {
    title: 'Performance Trend',
    value: 'Improving',
    trend: 'up',
  },
];

export const termOptions: FilterOption[] = [
  { label: 'Fall 2023', value: 'fall-2023' },
  { label: 'Spring 2023', value: 'spring-2023' },
  { label: 'Winter 2023', value: 'winter-2023' },
];

export const examTypeOptions: FilterOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Midterm', value: 'midterm' },
  { label: 'Final', value: 'final' },
  { label: 'Quiz', value: 'quiz' },
  { label: 'Assignment', value: 'assignment' },
];

export const subjectOptions: FilterOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Mathematics', value: 'math' },
  { label: 'History', value: 'history' },
  { label: 'Physics', value: 'physics' },
  { label: 'English Literature', value: 'english' },
  { label: 'Chemistry', value: 'chemistry' },
];

export const subjects: SubjectPerformance[] = [
  {
    id: '1',
    subject: 'Mathematics',
    score: '92 / 100',
    grade: 'A',
    gradeColor: 'green',
    progress: 92,
    performance: 'Excellent',
    performanceColor: 'green',
  },
  {
    id: '2',
    subject: 'History',
    score: '85 / 100',
    grade: 'B',
    gradeColor: 'blue',
    progress: 85,
    performance: 'Good',
    performanceColor: 'blue',
  },
  {
    id: '3',
    subject: 'Physics',
    score: '78 / 100',
    grade: 'C',
    gradeColor: 'yellow',
    progress: 78,
    performance: 'Average',
    performanceColor: 'yellow',
  },
  {
    id: '4',
    subject: 'English Literature',
    score: '64 / 100',
    grade: 'D',
    gradeColor: 'orange',
    progress: 64,
    performance: 'Needs Work',
    performanceColor: 'orange',
  },
  {
    id: '5',
    subject: 'Chemistry',
    score: '88 / 100',
    grade: 'B',
    gradeColor: 'blue',
    progress: 88,
    performance: 'Good',
    performanceColor: 'blue',
  },
];