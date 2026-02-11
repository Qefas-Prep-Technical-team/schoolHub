import { User, NavItem, DocumentDetails, Version, Tag, RelatedMaterial } from './types';

export const user: User = {
  name: 'Alex Johnson',
  grade: 'Grade 11',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBINazj7LgW397XxSCmTnOQsbBl2iNdyMcKT5FbG6Lkm8XW4oCYTph-eW1Bta__Qo5Ek4FVhPSKUfrfYS3bPuQk9ADYb1TZuHTVyl4MXeTjXFxD7cD92mxv4X3ZuFV8IsinrrAX5dWzN5_Jx7mwrtLHuVgm6JScgrGcQestJ75aquaJp1MBghpHKkY2Gn5_1hxPz8E5i3FMfW6KXYzuiECsCV7D_22Umqlje5TIRS5uHlAknENzZDOaFjQ6_2vbip9rgBSStVwX_6k',
};

export const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '/' },
  { label: 'Courses', icon: 'book', href: '/courses' },
  { label: 'Documents', icon: 'folder', href: '/documents', active: true, fill: true },
  { label: 'Grades', icon: 'bar_chart_4_bars', href: '/grades' },
  { label: 'Calendar', icon: 'calendar_today', href: '/calendar' },
];

export const bottomNavItems: NavItem[] = [
  { label: 'Settings', icon: 'settings', href: '/settings' },
  { label: 'Logout', icon: 'logout', href: '/logout' },
];

export const documentDetails: DocumentDetails = {
  id: 'algebra-ii-final-exam-guide',
  title: 'Algebra II - Final Exam Study Guide',
  subtitle: 'Document details and actions',
  category: 'Study Guide',
  uploader: 'Mr. Harrison',
  description: 'A comprehensive guide covering all topics for the upcoming final examination in Algebra II. Focuses on chapters 5-8.',
  thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZFQ0LaTA7U4bk9RNdCHdatdpMogXCdvIH5KbymOrcUQ_59HILOywggE44IvhpT3RkWRsYiJabLTXSf-ETadvf-THTwfzpxWPLLbQestAarEqoMLPqyPRz5pVlhRfvcGnSkLvb1O6euMNsab__u4kzMZ7TyMQf32EVTNk9ldFsUCqqP9HrR5wIxycHpVHXjjqzpR42Qh3PnUAXqs0sROSUFwDB6ImGMOcHf4j95yjfKbxcqT8SbTmx4KzESNra5f-hdFi2Gw2hvxI',
  thumbnailAlt: 'Thumbnail preview of the first page of a study guide document.',
  fileSize: '2.4 MB',
  fileType: 'pdf',
  downloadUrl: '#',
  viewUrl: '#',
};

export const versions: Version[] = [
  {
    id: 'v2',
    number: 'Version 2 (Current)',
    isCurrent: true,
    uploadDate: new Date('2023-10-26'),
    fileSize: '2.4 MB',
  },
  {
    id: 'v1',
    number: 'Version 1',
    isCurrent: false,
    uploadDate: new Date('2023-10-22'),
    fileSize: '2.1 MB',
  },
];

export const tags: Tag[] = [
  { id: 'math', label: 'Mathematics', color: 'blue' },
  { id: 'term2', label: 'Term 2', color: 'green' },
  { id: 'final-exams', label: 'Final Exams', color: 'red' },
];

export const relatedMaterials: RelatedMaterial[] = [
  {
    id: 'chapter5-slides',
    title: 'Link to Chapter 5 Slides',
    icon: 'slideshow',
    href: '#',
  },
  {
    id: 'practice-quiz',
    title: 'Link to Practice Quiz',
    icon: 'quiz',
    href: '#',
  },
];