import { NavItem, StatCard, Deadline, ImprovementTip, PerformanceData } from './types';

export const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '#' },
  { label: 'Assignments', icon: 'assignment', href: '#', active: true },
  { label: 'Grades', icon: 'grade', href: '#' },
  { label: 'Calendar', icon: 'calendar_month', href: '#' },
  { label: 'Courses', icon: 'play_lesson', href: '#' },
];

export const bottomNavItems: NavItem[] = [
  { label: 'Settings', icon: 'settings', href: '#' },
  { label: 'Log Out', icon: 'logout', href: '#' },
];

export const stats: StatCard[] = [
  {
    title: 'Completion Rate',
    value: '92%',
    change: '+5% from last month',
    changeType: 'positive',
  },
  {
    title: 'Late Submissions',
    value: '2',
    change: '-1 from last month',
    changeType: 'negative',
  },
  {
    title: 'Average Grade',
    value: '88%',
    change: '+2% from last month',
    changeType: 'positive',
  },
  {
    title: 'Time Score',
    value: '85/100',
    change: '+3 from last month',
    changeType: 'positive',
  },
];

export const deadlines: Deadline[] = [
  {
    id: '1',
    title: 'History Essay: The Roman Empire',
    subject: 'History',
    dueIn: 'Due in 2 days',
    status: 'in-progress',
    icon: 'hourglass_top',
    iconColor: 'orange',
  },
  {
    id: '2',
    title: 'Chemistry Lab Report',
    subject: 'Chemistry',
    dueIn: 'Due in 5 days',
    status: 'not-started',
    icon: 'science',
    iconColor: 'purple',
  },
  {
    id: '3',
    title: 'Algebra II: Problem Set 5',
    subject: 'Mathematics',
    dueIn: 'Due in 7 days',
    status: 'not-started',
    icon: 'calculate',
    iconColor: 'blue',
  },
];

export const improvementTips: ImprovementTip[] = [
  {
    id: '1',
    title: 'Start Assignments Earlier',
    description: 'You have 2 late submissions. Try starting assignments the day they are assigned to improve your Time Score.',
    icon: 'task_alt',
    iconBgColor: 'bg-green-100 dark:bg-green-900/50',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    id: '2',
    title: 'Review History Notes',
    description: 'Your lowest grades are in History. Spend an extra 30 minutes reviewing notes before starting the next essay.',
    icon: 'menu_book',
    iconBgColor: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: '3',
    title: 'Use a Checklist',
    description: 'For lab reports, create a checklist from the rubric to ensure all sections are completed before submission.',
    icon: 'checklist',
    iconBgColor: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
];

export const performanceData: PerformanceData[] = [
  { month: 'Sep', score: 85 },
  { month: 'Oct', score: 82 },
  { month: 'Nov', score: 88 },
  { month: 'Dec', score: 92 },
  { month: 'Jan', score: 90 },
];