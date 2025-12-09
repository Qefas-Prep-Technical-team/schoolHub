import { User, NavItem, ImportantDocument } from './types';
import { subDays, subWeeks, subMonths } from 'date-fns';

export const user: User = {
  name: 'Alex Johnson',
  studentId: '55243',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcQnEX2beWIQ06dqzAUDhJMiM0HiNj3hs3TriCNj6-w6KnkO7n37oWhFxNdR-XP9cnrOXIFlpiLcrIgqmojL4fYYCnz2TYDkq3zSaGSQyf_AkHO53S0gUbLhhfGow10uk0hIS0aA4UvcmfFoFEFPCW8SG2da6uiaHNjk-U99LXUugjBhZmg5Sdg5lJL2NdMvRCNTSB3zKEhRbxzZON6Bp2soYrWj2V63g3umug1ymUCHc_GtkUtf-Er3j9LndOUZAUhH602tQOCqQ',
};

export const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '/' },
  { label: 'Documents', icon: 'folder', href: '/documents', active: true, fill: true },
  { label: 'Courses', icon: 'book', href: '/courses' },
  { label: 'Grades', icon: 'bar_chart', href: '/grades' },
  { label: 'Profile', icon: 'person', href: '/profile' },
];

export const bottomNavItems: NavItem[] = [
  { label: 'Settings', icon: 'settings', href: '/settings' },
  { label: 'Logout', icon: 'logout', href: '/logout' },
];

export const importantDocuments: ImportantDocument[] = [
  {
    id: 'academic-calendar-2024-2025',
    title: 'Academic Calendar 2024-2025',
    description: 'From: Admissions Office',
    from: 'Admissions Office',
    uploadDate: subDays(new Date(), 2),
    icon: 'calendar_month',
    isStarred: true,
    isUnread: true,
    fileType: 'PDF',
    fileSize: '1.2 MB',
  },
  {
    id: 'student-handbook',
    title: 'Student Handbook & Code of Conduct',
    description: 'From: Dean\'s Office',
    from: 'Dean\'s Office',
    uploadDate: subWeeks(new Date(), 1),
    icon: 'menu_book',
    isStarred: true,
    fileType: 'PDF',
    fileSize: '3.8 MB',
  },
  {
    id: 'financial-aid-letter',
    title: 'Financial Aid Award Letter',
    description: 'From: Financial Aid',
    from: 'Financial Aid Office',
    uploadDate: subWeeks(new Date(), 3),
    icon: 'picture_as_pdf',
    isStarred: true,
    fileType: 'PDF',
    fileSize: '850 KB',
  },
  {
    id: 'course-registration-form',
    title: 'Course Registration Form',
    description: 'From: Registrar\'s Office',
    from: 'Registrar\'s Office',
    uploadDate: subMonths(new Date(), 1),
    icon: 'description',
    isStarred: true,
    isUnread: true,
    fileType: 'DOCX',
    fileSize: '650 KB',
  },
];