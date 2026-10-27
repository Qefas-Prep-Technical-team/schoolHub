export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type AttendanceType = 'daily' | 'period' | 'event';

export interface SubjectAttendanceItem {
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  status: AttendanceStatus | 'unrecorded';
  recordedAt?: string;
  recordedByName?: string;
  recordedByRole?: string;
  note?: string;
}

export interface ClassSubjectItem {
  id: string;
  name: string;
  code?: string;
  departmentIds?: string[];
  departmentNames?: string[];
  teacher?: {
    id: string;
    name: string;
  };
  teacherIds?: string[];
  isAssignedToTeacher?: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  duration?: number; // in minutes
  comment?: string;
  note?: string;
  submittedBy: string;
  submittedAt: string;
  createdAt?: string;
  updatedAt?: string;
  recordedById?: string;
  recordedByName?: string;
  recordedByRole?: string;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
    code?: string;
  } | null;
  subjects?: Record<string, SubjectAttendanceItem>;
  student?: {
    id: string;
    name: string;
    studentCode?: string;
    profileImage?: string;
    avatarUrl?: string;
    departmentId?: string | null;
    department?: {
      id: string;
      name: string;
      code?: string;
    } | null;
  };
}

/**
 * Filter class subjects down to those applicable to the student's department.
 * If the student is not in a specific department (or departmentId is undefined), all class subjects apply.
 * If a subject has no departments configured, it is general/compulsory and applies to all students.
 */
export const getStudentApplicableSubjects = (
  departmentId?: string | null,
  classSubjects: ClassSubjectItem[] = []
): ClassSubjectItem[] => {
  if (!classSubjects || classSubjects.length === 0) return [];
  if (!departmentId) return classSubjects;

  const filtered = classSubjects.filter((sub) => {
    if (!sub.departmentIds || sub.departmentIds.length === 0) return true;
    return sub.departmentIds.includes(departmentId);
  });

  return filtered.length > 0 ? filtered : classSubjects;
};

export interface AttendanceSummary {
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
  rate?: number;
}

export interface MonthlyAttendance {
  month: string;
  year: number;
  summary: AttendanceSummary;
  dailyRecords: AttendanceRecord[];
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  status?: AttendanceStatus;
  hasAttendance: boolean;
  attendanceRate?: number;
}