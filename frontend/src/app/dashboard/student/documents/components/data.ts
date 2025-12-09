import { Document, FilterChip, SortOption } from './types';

export const mockUser = {
  name: 'Alex Morgan',
  studentId: '12345',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCByIFHvCUD4dUIS9xY6Kn8it0uG_w80wYJsFqHg45kvLSL1ts56-X4ZLTQznWsm4_tI97QjK-T4E4_08hmN9MtYhYmPG-zT12jR0SyMa26LNB5GmJWcaexiqhJZnQKjlCnTbTbzRyDH1CRt1nGl7S32S29fafHFLWmjnp0BqKLPGQsetbMY6xOIip-8sjRUwHE4n_M2ARfiPj8cyoTRS2vVKeQCsfm7T4yArKENF7ETMPbnpxLvBVtBvF62vu1SgeCwl0rkUzCUuk',
  role: 'Student',
};

export const navItems = [
  { label: 'Dashboard', icon: 'dashboard', href: '#' },
  { label: 'Documents', icon: 'description', href: '#', active: true, fill: true },
  { label: 'Calendar', icon: 'calendar_month', href: '#' },
  { label: 'Grades', icon: 'school', href: '#' },
  { label: 'Profile', icon: 'person', href: '#' },
];

export const filterChips: FilterChip[] = [
  { id: 'all', label: 'All Documents', active: true, count: 12 },
  { id: 'assignments', label: 'Assignments', active: false, count: 4 },
  { id: 'results', label: 'Results', active: false, count: 3 },
  { id: 'study_materials', label: 'Study Materials', active: false, count: 3 },
  { id: 'school_letters', label: 'School Letters', active: false, count: 1 },
  { id: 'certificates', label: 'Certificates', active: false, count: 1 },
  { id: 'favourites', label: 'favourite', active: false, count: 1 },
];

export const sortOptions: SortOption[] = [
  { id: 'date_newest', label: 'Date (Newest)', value: 'date_desc' },
  { id: 'date_oldest', label: 'Date (Oldest)', value: 'date_asc' },
  { id: 'name_asc', label: 'Name (A-Z)', value: 'name_asc' },
  { id: 'name_desc', label: 'Name (Z-A)', value: 'name_desc' },
  { id: 'type', label: 'Type', value: 'type' },
];

export const documents: Document[] = [
  {
    id: '1',
    title: 'History 101 Essay',
    type: 'assignment',
    category: 'Assignment',
    uploadDate: new Date('2023-10-24'),
    fileType: 'pdf',
    icon: 'picture_as_pdf',
    iconColor: 'red',
    isFavorited: true,
  },
  {
    id: '2',
    title: 'Mid-Term Report Card',
    type: 'results',
    category: 'Results',
    uploadDate: new Date('2023-10-15'),
    fileType: 'doc',
    icon: 'description',
    iconColor: 'blue',
    isFavorited: false,
  },
  {
    id: '3',
    title: 'Biology Project Scan',
    type: 'study_materials',
    category: 'Study Materials',
    uploadDate: new Date('2023-10-05'),
    fileType: 'image',
    icon: 'image',
    iconColor: 'green',
    isFavorited: true,
  },
  {
    id: '4',
    title: 'Spelling Bee Cert.',
    type: 'certificate',
    category: 'Certificate',
    uploadDate: new Date('2023-10-01'),
    fileType: 'pdf',
    icon: 'emoji_events',
    iconColor: 'yellow',
    isFavorited: false,
  },
  {
    id: '5',
    title: 'Math Assignment Solution',
    type: 'assignment',
    category: 'Assignment',
    uploadDate: new Date('2023-09-28'),
    fileType: 'pdf',
    icon: 'picture_as_pdf',
    iconColor: 'red',
    isFavorited: false,
  },
  {
    id: '6',
    title: 'Physics Lab Report',
    type: 'assignment',
    category: 'Assignment',
    uploadDate: new Date('2023-09-25'),
    fileType: 'doc',
    icon: 'description',
    iconColor: 'blue',
    isFavorited: true,
  },
  {
    id: '7',
    title: 'Chemistry Formulas',
    type: 'study_materials',
    category: 'Study Materials',
    uploadDate: new Date('2023-09-20'),
    fileType: 'pdf',
    icon: 'picture_as_pdf',
    iconColor: 'red',
    isFavorited: false,
  },
  {
    id: '8',
    title: 'Sports Day Permission',
    type: 'school_letters',
    category: 'School Letters',
    uploadDate: new Date('2023-09-15'),
    fileType: 'pdf',
    icon: 'description',
    iconColor: 'purple',
    isFavorited: true,
  },
];

export const iconColors = {
  red: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400',
  blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
  green: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400',
  purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
};