export type StudentClassStatus =
  | "ENROLLED"
  | "EXPELLED"
  | "GRADUATED"
  | "TRANSFERRED"
  | "PROMOTED"
  | "NONE";

export interface EnrolledStudentItem {
  id: string;
  name: string;
  studentCode?: string;
  gender?: string;
  status?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  classCode: string;
  level?: string;
  section?: string;
  schoolId?: string;
  status?: string;
  isLocked?: boolean;
  locked?: boolean;
  isArchived?: boolean;
  teachers?: Array<{
    teacher?: {
      id: string;
      name: string;
      email?: string;
      bannerImage?: string;
    };
  }>;
  subjects?: Array<{
    subject?: {
      id: string;
      name: string;
      code?: string;
      category?: string;
    };
  }>;
  departments?: Array<{
    department?: {
      id: string;
      name: string;
    };
  }>;
  enrollments?: Array<{
    student?: EnrolledStudentItem;
  }>;
}

export interface RawClassEnrollment {
  id?: string;
  classCode?: string;
  class?: {
    id?: string;
    classCode?: string;
    [key: string]: unknown;
  };
}

export const AVATAR_COLORS = [
  "bg-pink-500 text-white",
  "bg-indigo-500 text-white",
  "bg-emerald-500 text-white",
  "bg-amber-500 text-white",
  "bg-purple-500 text-white",
  "bg-rose-500 text-white",
  "bg-cyan-500 text-white",
];

