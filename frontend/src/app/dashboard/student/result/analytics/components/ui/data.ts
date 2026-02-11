import { 
  NavItem, 
  TermFilter, 
  StatCard, 
  SubjectPerformance, 
  PerformanceData,
  ComparisonSubject,
  Goal
} from '@/types';

export const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '#' },
  { label: 'My Courses', icon: 'book', href: '#' },
  { label: 'Assignments', icon: 'assignment', href: '#' },
  { label: 'Performance', icon: 'bar_chart', href: '#', active: true, filled: true },
  { label: 'Calendar', icon: 'calendar_today', href: '#' },
];

export const bottomNavItems: NavItem[] = [
  { label: 'Settings', icon: 'settings', href: '#' },
  { label: 'Log Out', icon: 'logout', href: '#' },
];

export const termFilters: TermFilter[] = [
  { id: 'year', label: '2023-2024' },
  { id: 'term1', label: 'Term 1', active: true },
  { id: 'term2', label: 'Term 2' },
  { id: 'term3', label: 'Term 3' },
];

export const stats: StatCard[] = [
  {
    label: 'Overall Average',
    value: '88%',
    trend: {
      value: '+1.2%',
      icon: 'trending_up',
      color: 'green',
    },
  },
  {
    label: 'Highest Subject',
    value: 'Physics',
    trend: {
      value: 'Top Performer',
      icon: 'workspace_premium',
      color: 'primary',
    },
  },
  {
    label: 'Recent Improvement',
    value: 'Chemistry',
    trend: {
      value: '+3%',
      icon: 'arrow_upward',
      color: 'green',
    },
  },
];

export const strengths: SubjectPerformance[] = [
  { subject: 'Physics', score: 95, category: 'strength' },
  { subject: 'Mathematics', score: 92, category: 'strength' },
  { subject: 'History', score: 89, category: 'strength' },
];

export const weaknesses: SubjectPerformance[] = [
  { subject: 'English Literature', score: 74, category: 'weakness' },
  { subject: 'Biology', score: 78, category: 'weakness' },
  { subject: 'Geography', score: 81, category: 'weakness' },
];

export const performanceData: PerformanceData[] = [
  { term: 'Term 1', score: 85 },
  { term: 'Term 2', score: 82 },
  { term: 'Term 3', score: 88 },
  { term: 'Term 4', score: 90 },
];

export const comparisonSubjects: ComparisonSubject[] = [
  { name: 'Mathematics', yourScore: 92, classAverage: 85 },
  { name: 'Physics', yourScore: 95, classAverage: 88 },
  { name: 'English', yourScore: 74, classAverage: 80 },
  { name: 'History', yourScore: 89, classAverage: 84 },
];

export const goals: Goal[] = [
  { 
    id: '1', 
    text: 'Review character analysis techniques for English Literature.',
    completed: true 
  },
  { 
    id: '2', 
    text: 'Practice Punnett squares for Biology genetics unit.',
    completed: true 
  },
];