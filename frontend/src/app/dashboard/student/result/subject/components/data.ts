import { NavItem, Assessment, Term, SubjectInfo } from './types';

export const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '#' },
  { label: 'Subjects', icon: 'auto_stories', href: '#', active: true, bold: true },
  { label: 'Assignments', icon: 'assignment_turned_in', href: '#' },
  { label: 'Grades', icon: 'grading', href: '#' },
  { label: 'Calendar', icon: 'calendar_month', href: '#' },
];

export const bottomNavItems: NavItem[] = [
  { label: 'Settings', icon: 'settings', href: '#' },
];

export const subjectInfo: SubjectInfo = {
  title: 'Advanced Mathematics',
  teacher: 'Mr. David Chen',
  subjectCode: 'MATH401',
};

export const terms: Term[] = [
  { id: 'term2', label: 'Term 2', active: true },
  { id: 'term1', label: 'Term 1' },
  { id: 'full-year', label: 'Full Year' },
];

export const assessments: Assessment[] = [
  {
    id: '1',
    name: 'Algebra Quiz 1',
    score: '18/20',
    weight: '10%',
    status: 'graded',
  },
  {
    id: '2',
    name: 'Geometry Assignment',
    score: '24/25',
    weight: '15%',
    status: 'graded',
  },
  {
    id: '3',
    name: 'Mid-Term Project',
    score: '-',
    weight: '25%',
    status: 'pending',
  },
  {
    id: '4',
    name: 'Calculus Test',
    score: '-',
    weight: '20%',
    status: 'pending',
  },
  {
    id: '5',
    name: 'Trigonometry Homework',
    score: '0/10',
    weight: '5%',
    status: 'missing',
  },
];