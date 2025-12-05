import { 
  NavItem, 
  BreadcrumbItem, 
  AssessmentStats, 
  RubricItem, 
  Attachment,
  FeedbackItem 
} from './types';

export const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '#' },
  { label: 'Courses', icon: 'book', href: '#' },
  { label: 'Assessments', icon: 'assignment_turned_in', href: '#', active: true, filled: true },
  { label: 'Grades', icon: 'grading', href: '#' },
  { label: 'Calendar', icon: 'calendar_month', href: '#' },
];

export const bottomNavItems: NavItem[] = [
  { label: 'Settings', icon: 'settings', href: '#' },
  { label: 'Log out', icon: 'logout', href: '#' },
];

export const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Assessments', href: '#' },
  { label: 'Biology 101', href: '#' },
  { label: 'Unit 5: Algebra Quiz' },
];

export const assessmentInfo = {
  title: 'Unit 5: Algebra Quiz',
  submittedDate: 'October 26, 2023',
  teacher: 'Mrs. Davis',
};

export const stats: AssessmentStats[] = [
  {
    label: 'Score',
    value: '85',
    subValue: '/100',
    badge: 'A',
  },
  {
    label: 'Weight',
    value: '15%',
  },
  {
    label: 'Class Average',
    value: '78%',
  },
];

export const rubricItems: RubricItem[] = [
  {
    category: 'Solving Linear Equations',
    score: '25 / 30',
    maxScore: 30,
  },
  {
    category: 'Graphing Functions',
    score: '20 / 20',
    maxScore: 20,
  },
  {
    category: 'Polynomial Operations',
    score: '25 / 30',
    maxScore: 30,
  },
  {
    category: 'Problem Solving & Application',
    score: '15 / 20',
    maxScore: 20,
  },
];

export const teacherFeedback = "Great work, Alex! You have a solid grasp of graphing functions and polynomial operations. Your application of concepts is strong. For the next quiz, focus on double-checking your calculations when solving linear equations to catch minor errors. Keep up the excellent effort!";

export const attachments: Attachment[] = [
  {
    id: '1',
    name: 'Your_Submission.pdf',
    size: '1.2 MB',
    icon: 'description',
    iconColor: 'text-primary',
    downloadUrl: '#',
  },
  {
    id: '2',
    name: 'Corrected_Answers.pdf',
    size: '1.5 MB',
    icon: 'task_alt',
    iconColor: 'text-green-600',
    downloadUrl: '#',
  },
];

export const strengths: FeedbackItem[] = [
  {
    id: '1',
    content: 'Excellent understanding of graphing functions.',
    type: 'strength',
    icon: 'check_circle',
    iconColor: 'text-green-500',
  },
  {
    id: '2',
    content: 'Strong execution in polynomial operations.',
    type: 'strength',
    icon: 'check_circle',
    iconColor: 'text-green-500',
  },
];

export const improvements: FeedbackItem[] = [
  {
    id: '1',
    content: 'Review calculation steps for linear equations to avoid small mistakes.',
    type: 'improvement',
    icon: 'report',
    iconColor: 'text-amber-500',
  },
  {
    id: '2',
    content: 'Ensure all parts of application problems are addressed.',
    type: 'improvement',
    icon: 'report',
    iconColor: 'text-amber-500',
  },
];