export interface MaterialCard {
  id: string;
  title: string;
  assignmentTitle?: string;
  assessmentName?: string;
  folder: string;
  teacher: string;
  uploadDate: string;
  rawDate?: string | Date | null;
  description: string;
  type: 'pdf' | 'video' | 'image' | 'document';
  attachmentUrl: string | null;
  videoUrl: string | null;
  referenceUrl: string | null;
  link?: string;
  examId?: string;
  assignmentId?: string;
  sourceType: 'ASSIGNMENT' | 'EXAM' | 'QUIZ' | 'CA' | 'READING_CONTENT';
  sourceTitle: string;
  subjectName?: string;
  isFile: boolean;
  fileExtension?: string;
}

export type MaterialSubTab = 'ALL' | 'FILES_ONLY' | 'EXAMS' | 'ASSIGNMENTS' | 'CA' | 'TEST_QUIZ';

export type RoleTheme = 'admin' | 'student' | 'teacher';

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryText: string;
  primaryBorder: string;
  primaryBg: string;
  primaryLightBg: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentDot: string;
  cardHoverBorder: string;
}

export function getThemeTokens(role: RoleTheme = 'student'): ThemeColors {
  if (role === 'admin') {
    return {
      primary: 'bg-indigo-600',
      primaryHover: 'hover:bg-indigo-700',
      primaryText: 'text-indigo-600 dark:text-indigo-400',
      primaryBorder: 'border-indigo-600',
      primaryBg: 'bg-indigo-600',
      primaryLightBg: 'bg-indigo-50 dark:bg-indigo-950/40',
      badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
      badgeText: 'text-indigo-600 dark:text-indigo-400',
      badgeBorder: 'border-indigo-200/80 dark:border-indigo-800/60',
      accentDot: 'bg-indigo-500',
      cardHoverBorder: 'hover:border-indigo-500/40',
    };
  }

  if (role === 'teacher') {
    return {
      primary: 'bg-emerald-600',
      primaryHover: 'hover:bg-emerald-700',
      primaryText: 'text-emerald-600 dark:text-emerald-400',
      primaryBorder: 'border-emerald-600',
      primaryBg: 'bg-emerald-600',
      primaryLightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      badgeText: 'text-emerald-600 dark:text-emerald-400',
      badgeBorder: 'border-emerald-200/80 dark:border-emerald-800/60',
      accentDot: 'bg-emerald-500',
      cardHoverBorder: 'hover:border-emerald-500/40',
    };
  }

  // Student default (Pink)
  return {
    primary: 'bg-pink-600',
    primaryHover: 'hover:bg-pink-700',
    primaryText: 'text-pink-600 dark:text-pink-400',
    primaryBorder: 'border-pink-600',
    primaryBg: 'bg-pink-600',
    primaryLightBg: 'bg-pink-50 dark:bg-pink-950/40',
    badgeBg: 'bg-pink-50 dark:bg-pink-950/40',
    badgeText: 'text-pink-600 dark:text-pink-400',
    badgeBorder: 'border-pink-200/80 dark:border-pink-800/60',
    accentDot: 'bg-pink-500',
    cardHoverBorder: 'hover:border-pink-500/40',
  };
}
