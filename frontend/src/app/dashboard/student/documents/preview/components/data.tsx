import { Document, RelatedDocument, MetadataItem, BreadcrumbItem } from './types';

export const currentDocument: Document = {
  id: 'chem-101-lab-guidelines',
  title: 'CHEM-101 Lab Report Guidelines',
  description: 'A short, one-to-two-line summary of the document\'s purpose and key requirements for the chemistry lab report.',
  category: 'Lab Materials',
  fileSize: '2.4 MB',
  uploadedBy: 'Mr. Smith',
  uploadDate: new Date('2023-10-26'),
  previewImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmvXZPHfUdk4e24iOUsqv9yqLrJM8HHSab5hNvBsL5ebucyjXP5Xw-ZbXX_cEbnbzXOs1A1gumRLmLieJcSrq-EVXjKJEIBXqs-9v3e6SMHWs422CWMidMceZErwOWjiwRzn_OC7luD-m8iNnLAJHtuRy4-I9Pf9Ne9NB-zGvyJbOP6vhSwLtFVhhFSs9-jWDzkpz3-TNJpFnyx0vuk9GJeW34NFcCZS0_LeVZ4kijXzzA7yd9cj9XwvVhx_kqBdCSUWacKCJmi4g',
  fileType: 'pdf',
  downloadUrl: '#',
};

export const relatedDocuments: RelatedDocument[] = [
  {
    id: 'previous-versions',
    title: 'Previous Versions',
    icon: 'history',
    href: '#',
    iconColor: 'text-primary',
  },
  {
    id: 'course-materials',
    title: 'Course Materials',
    icon: 'folder',
    href: '#',
    active: true,
    iconColor: 'text-primary',
  },
  {
    id: 'syllabus-fall-2024',
    title: 'Syllabus Fall 2024',
    icon: 'description',
    href: '#',
    iconColor: 'text-gray-500 dark:text-gray-400',
  },
];

export const metadataItems: MetadataItem[] = [
  { label: 'File Size', value: '2.4 MB' },
  { label: 'Uploaded By', value: 'Mr. Smith' },
  { label: 'Upload Date', value: 'Oct 26, 2023' },
  { 
    label: 'Category', 
    value: (
      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
        Lab Materials
      </span>
    )
  },
];

export const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Documents', href: '/documents' },
  { label: 'CHEM-101 Lab Report Guidelines' },
];

export const user = {
  name: 'Alex Morgan',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANuYOaJF4P9PiXOcA_X2M5BeA-3dCxp-dwfX5PJm5Kptb34MkOTn_TOWh_HL9adUZdMzUYrZ8RN2D5f1f2XyJKL9RWYv_kwe2aCaA08Eyib9fvp3_ZDQApN-KfqdvJKup_K_L49csQ9HdXtpYrMSvyjCYdmY6hfGlJLm-VOeyHpLt8IPI6Lbq6VMzThBGftATxv3aSNMXY3n391SGbh8gnl0FuoLiT8sVA-HiNpnHFo84a-s2gyg1nYW83jeI4tU-FbjpFGdd-fV4',
};