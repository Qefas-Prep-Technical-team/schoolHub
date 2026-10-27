import type {
  AttendanceRecord,
  AttendanceStatus,
  ClassSubjectItem,
  SubjectAttendanceItem,
} from '@/app/dashboard/admin/classes/[id]/components/attendance/components/types';

/**
 * Raw attendance row as returned by GET /students/:id/attendance.
 * Fields are optional because older rows / other endpoints return partial shapes.
 */
export interface RawStudentAttendance {
  id?: string;
  date: string;
  status?: string;
  note?: string | null;
  notes?: string | null;
  remarks?: string | null;
  comment?: string | null;
  subjects?: Record<string, unknown> | null;
  classId?: string;
  studentId?: string;
  class?: {
    id?: string;
    name?: string;
    subjects?: unknown[];
  } | null;
  student?: {
    id?: string;
    name?: string;
    studentCode?: string;
    departmentId?: string | null;
    department?: { id: string; name: string; code?: string } | null;
  } | null;
  recordedByName?: string;
  recordedByRole?: string;
  submittedBy?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectChip {
  subjectId: string;
  subjectName: string;
  status: string;
}

interface DepartmentLink {
  departmentId?: string;
  department?: { id?: string; name?: string };
}

interface RawClassSubject {
  id?: string;
  name?: string;
  code?: string;
  departments?: DepartmentLink[];
  subject?: {
    id?: string;
    name?: string;
    code?: string;
    departments?: DepartmentLink[];
  };
}

/**
 * Attendance notes are stored as JSON `{ comment, subjects }` and older rows may be
 * double-serialised (the comment itself is a JSON string). Unwrap every layer so the UI
 * never shows raw JSON.
 */
export function parseAttendanceNote(
  rawNote?: string | null,
  existingSubjects?: Record<string, unknown> | null
): { comment: string; subjects: Record<string, unknown> } {
  let subjects: Record<string, unknown> = { ...(existingSubjects || {}) };
  if (!rawNote || typeof rawNote !== 'string') return { comment: '', subjects };

  let text = rawNote.trim();
  while (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') break;
      const obj = parsed as { comment?: unknown; note?: unknown; subjects?: unknown };
      if (obj.subjects && typeof obj.subjects === 'object') {
        subjects = { ...subjects, ...(obj.subjects as Record<string, unknown>) };
      }
      if (typeof obj.comment === 'string') {
        text = obj.comment.trim();
        continue;
      }
      if (typeof obj.note === 'string') {
        text = obj.note.trim();
        continue;
      }
      text = '';
      break;
    } catch {
      break;
    }
  }
  return { comment: text, subjects };
}

export function getCleanAttendance(record: RawStudentAttendance): {
  comment: string;
  subjects: Record<string, unknown>;
  chips: SubjectChip[];
} {
  const { comment, subjects } = parseAttendanceNote(
    record.comment || record.note || record.notes || record.remarks,
    record.subjects
  );
  const chips: SubjectChip[] = Object.entries(subjects).map(([key, value]) => {
    const v = (value || {}) as { subjectId?: string; subjectName?: string; status?: string };
    return {
      subjectId: v.subjectId || key,
      subjectName: v.subjectName || 'Subject',
      status: (v.status || 'present').toLowerCase(),
    };
  });
  return { comment, subjects, chips };
}

function mapClassSubjects(rawSubjects: unknown[] | undefined): ClassSubjectItem[] {
  if (!Array.isArray(rawSubjects)) return [];
  const result: ClassSubjectItem[] = [];
  rawSubjects.forEach((item) => {
    const cs = item as RawClassSubject;
    const s = cs.subject || cs;
    if (!s?.id || !s?.name) return;
    const depts = s.departments || [];
    result.push({
      id: s.id,
      name: s.name,
      code: s.code || '',
      departmentIds: depts
        .map((d) => d.departmentId || d.department?.id)
        .filter((id): id is string => Boolean(id)),
      departmentNames: depts
        .map((d) => d.department?.name)
        .filter((n): n is string => Boolean(n)),
    });
  });
  return result;
}

/**
 * Convert a raw attendance row into the props expected by StudentAttendanceDetailModal.
 * Subjects = class subjects (with department info) ∪ any subjects recorded on the day.
 */
export function buildAttendanceModalData(
  record: RawStudentAttendance,
  fallback: {
    studentId?: string;
    studentName?: string;
    studentCode?: string;
    className?: string;
    departmentId?: string | null;
    department?: { id: string; name: string; code?: string } | null;
  } = {}
): { record: AttendanceRecord; classSubjects: ClassSubjectItem[] } {
  const { comment, subjects } = getCleanAttendance(record);

  const rawStatus = (record.status || 'present').toLowerCase();
  const status: AttendanceStatus = (['present', 'absent', 'late', 'excused'] as const).includes(
    rawStatus as AttendanceStatus
  )
    ? (rawStatus as AttendanceStatus)
    : 'present';

  const subjectMap = new Map<string, ClassSubjectItem>();
  mapClassSubjects(record.class?.subjects).forEach((s) => subjectMap.set(s.id, s));
  Object.entries(subjects).forEach(([key, value]) => {
    const v = (value || {}) as { subjectId?: string; subjectName?: string; subjectCode?: string };
    const id = v.subjectId || key;
    if (!subjectMap.has(id)) {
      subjectMap.set(id, {
        id,
        name: v.subjectName || 'Subject',
        code: v.subjectCode || '',
        departmentIds: [],
        departmentNames: [],
      });
    }
  });

  const dateOnly = record.date ? record.date.split('T')[0] : '';
  const department = record.student?.department || fallback.department || null;

  return {
    classSubjects: Array.from(subjectMap.values()),
    record: {
      id: record.id || `rec-${dateOnly}`,
      studentId: record.studentId || record.student?.id || fallback.studentId || '',
      studentName: record.student?.name || fallback.studentName || 'Student',
      studentCode: record.student?.studentCode || fallback.studentCode || '-',
      classId: record.classId || record.class?.id || '',
      className: record.class?.name || fallback.className || 'Class',
      departmentId:
        record.student?.departmentId || department?.id || fallback.departmentId || null,
      department,
      status,
      comment,
      note: comment,
      date: dateOnly,
      subjects: subjects as Record<string, SubjectAttendanceItem>,
      submittedBy: record.submittedBy || record.recordedByName || 'Staff',
      submittedAt: record.submittedAt || record.createdAt || '',
      recordedByName: record.recordedByName,
      recordedByRole: record.recordedByRole,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    },
  };
}
