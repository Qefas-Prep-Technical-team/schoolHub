'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useStudentAssignments } from '@/lib/api/hooks/useAssignments';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import MaterialsLayout from './components/MaterialsLayout';

interface AssignmentResource {
  id: string;
  classId?: string;
  title: string;
  subjectId?: string;
  subject?: { name?: string } | string;
  teacherId?: string;
  teacher?: { name?: string };
  instructor?: { name?: string };
  creator?: { name?: string };
  teacherName?: string;
  attachmentUrl?: string | null;
  videoUrl?: string | null;
  referenceUrl?: string | null;
  instructions?: string | null;
  createdAt?: string;
}

interface ExamResource {
  id: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  category?: string;
  scope?: string;
  totalMarks?: number | null;
  durationMinutes?: number | null;
  teacherId?: string | null;
  teacher?: { name?: string } | null;
  creator?: { name?: string } | null;
  teacherName?: string | null;
  subject?: { name?: string } | null;
  createdAt?: string;
}

/** Detect file type from a URL string */
function detectFileType(url: string): 'pdf' | 'video' | 'image' | 'document' {
  if (url.match(/\.(mp4|mov|avi|webm|mkv)$/i)) return 'video';
  if (url.match(/\.pdf$/i)) return 'pdf';
  if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) return 'image';
  if (url.match(/youtu\.?be/i) || url.match(/vimeo\.com/i)) return 'video';
  return 'document';
}

/**
 * Derive the cleanest possible human-readable name from a URL.
 * Strips common storage prefixes like timestamps (e.g. "1749225348234-") and UUIDs.
 */
function cleanFilename(url: string, fallbackLabel: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube') || u.hostname.includes('youtu.be')) {
      return `YouTube Video`;
    }
    if (u.hostname.includes('vimeo')) return `Vimeo Video`;

    const raw = decodeURIComponent(u.pathname.split('/').pop() || '');
    if (!raw) return fallbackLabel;

    const cleaned = raw
      .replace(/^\d{10,}-/, '')
      .replace(/^[a-z0-9]{6,12}-(?=[a-z0-9])/i, '')
      .replace(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-?/i, '')
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .trim();

    return cleaned || fallbackLabel;
  } catch {
    return fallbackLabel;
  }
}

export default function MaterialsPage() {
  const { id } = useParams() as { id: string };

  const { data: classData, isLoading: classLoading, isError: classError } = useSingleClass(id);
  const { data: assignmentsData, isLoading: assignmentsLoading } = useStudentAssignments({ limit: 200 });

  const materialCards = useMemo(() => {
    if (!classData) return [];

    const defaultTeacherName = classData.teachers?.[0]?.teacher?.name || 'Class Teacher';

    // 1. Collect and merge assignments from both useSingleClass and useStudentAssignments
    const assignmentsFromClass: AssignmentResource[] = classData.assignments || [];
    const assignmentsFromHook: AssignmentResource[] = (assignmentsData?.assignments || []).filter(
      (a: { classId?: string }) => a.classId === id
    );

    const mergedAssignmentMap = new Map<string, AssignmentResource>();
    assignmentsFromClass.forEach((a) => mergedAssignmentMap.set(a.id, a));
    assignmentsFromHook.forEach((a) => {
      const existing = mergedAssignmentMap.get(a.id) || ({} as AssignmentResource);
      mergedAssignmentMap.set(a.id, { ...existing, ...a });
    });
    const classAssignments = Array.from(mergedAssignmentMap.values());

    // Helper: resolve accurate teacher / creator name for an assignment
    const resolveAssignmentTeacher = (a: AssignmentResource): string => {
      const directName =
        a.teacher?.name ||
        a.instructor?.name ||
        a.creator?.name ||
        a.teacherName;
      if (directName && typeof directName === 'string' && directName.trim()) {
        return directName.trim();
      }

      // Check class teacher roster by teacherId
      if (a.teacherId && classData.teachers) {
        interface ClassTeacherItem {
          teacherId?: string;
          teacher?: { id?: string; name?: string };
        }
        const match = (classData.teachers as ClassTeacherItem[]).find(
          (t) => t.teacherId === a.teacherId || t.teacher?.id === a.teacherId
        );
        if (match?.teacher?.name) return match.teacher.name;
      }

      // Check subject teacher in class
      if (a.subjectId && classData.subjects) {
        interface ClassSubjectItem {
          subjectId?: string;
          subject?: {
            id?: string;
            name?: string;
            teacher?: { name?: string };
            teacherSubjects?: Array<{ teacher?: { name?: string } }>;
          };
        }
        const subMatch = (classData.subjects as ClassSubjectItem[]).find(
          (s) => s.subjectId === a.subjectId || s.subject?.id === a.subjectId
        );
        if (subMatch?.subject?.teacher?.name) return subMatch.subject.teacher.name;
        if (subMatch?.subject?.teacherSubjects?.[0]?.teacher?.name) {
          return subMatch.subject.teacherSubjects[0].teacher.name;
        }
      }

      return defaultTeacherName;
    };

    // Helper: resolve teacher / creator name for an assessment (exam/quiz/test)
    const resolveExamTeacher = (exam: ExamResource): string => {
      const directName =
        exam.teacher?.name ||
        exam.creator?.name ||
        exam.teacherName;
      if (directName && typeof directName === 'string' && directName.trim()) {
        return directName.trim();
      }

      if (exam.teacherId && classData.teachers) {
        interface ClassTeacherItem {
          teacherId?: string;
          teacher?: { id?: string; name?: string };
        }
        const match = (classData.teachers as ClassTeacherItem[]).find(
          (t) => t.teacherId === exam.teacherId || t.teacher?.id === exam.teacherId
        );
        if (match?.teacher?.name) return match.teacher.name;
      }

      if (exam.subject?.name && classData.subjects) {
        interface ClassSubjectItem {
          subject?: {
            name?: string;
            teacher?: { name?: string };
          };
        }
        const subMatch = (classData.subjects as ClassSubjectItem[]).find(
          (s) => s.subject?.name?.toLowerCase() === exam.subject?.name?.toLowerCase()
        );
        if (subMatch?.subject?.teacher?.name) return subMatch.subject.teacher.name;
      }

      return defaultTeacherName;
    };

    const cards: Array<{
      id: string;
      title: string;
      assignmentTitle?: string;
      folder: string;
      teacher: string;
      uploadDate: string;
      description: string;
      type: 'pdf' | 'video' | 'image' | 'document';
      attachmentUrl: string | null;
      videoUrl: string | null;
      referenceUrl: string | null;
      link?: string;
      examId?: string;
    }> = [];

    // ── 1. Explode Assignment Resources ─────────────────────────────────────
    classAssignments.forEach((a) => {
      const uploadDate = a.createdAt ? format(new Date(a.createdAt), 'MMM d, yyyy') : 'Unknown date';
      const teacher = resolveAssignmentTeacher(a);
      const sharedBase = {
        folder: 'Assignments',
        teacher,
        uploadDate,
        description: a.instructions || 'No additional instructions provided.',
        assignmentTitle: a.title,
      };

      if (a.attachmentUrl) {
        cards.push({
          ...sharedBase,
          id: `assignment-${a.id}-attachment`,
          title: cleanFilename(a.attachmentUrl, a.title),
          type: detectFileType(a.attachmentUrl),
          attachmentUrl: a.attachmentUrl,
          videoUrl: null,
          referenceUrl: null,
        });
      }

      if (a.videoUrl) {
        cards.push({
          ...sharedBase,
          id: `assignment-${a.id}-video`,
          title: cleanFilename(a.videoUrl, `${a.title} — Video Resource`),
          type: 'video',
          attachmentUrl: null,
          videoUrl: a.videoUrl,
          referenceUrl: null,
        });
      }

      if (a.referenceUrl) {
        cards.push({
          ...sharedBase,
          id: `assignment-${a.id}-reference`,
          title: cleanFilename(a.referenceUrl, `${a.title} — Web Reference`),
          type: 'document',
          attachmentUrl: null,
          videoUrl: null,
          referenceUrl: a.referenceUrl,
        });
      }
    });

    // ── 2. Add Class Assessment / Exam Cards ────────────────────────────────
    const classExams: ExamResource[] = classData.exams || [];
    classExams.forEach((exam) => {
      const uploadDate = exam.createdAt ? format(new Date(exam.createdAt), 'MMM d, yyyy') : 'Unknown date';
      const teacher = resolveExamTeacher(exam);

      let folder = 'Exams';
      const cat = (exam.category || '').toUpperCase();
      const titleLower = (exam.title || '').toLowerCase();
      if (cat === 'QUIZ' || titleLower.includes('quiz')) {
        folder = 'Test (Quiz)';
      } else if (cat === 'TEST' || titleLower.includes('ca') || titleLower.includes('test')) {
        folder = 'CA';
      }

      cards.push({
        id: `exam-${exam.id}`,
        title: exam.title,
        assignmentTitle: exam.subject?.name ? `${exam.subject.name} Assessment` : 'Class Assessment',
        folder,
        teacher,
        uploadDate,
        description:
          exam.instructions ||
          exam.description ||
          `Assessment paper covering ${exam.subject?.name || classData.name}.${exam.durationMinutes ? ` Duration: ${exam.durationMinutes} mins.` : ''}${exam.totalMarks ? ` Total Marks: ${exam.totalMarks}.` : ''}`,
        type: 'document',
        attachmentUrl: null,
        videoUrl: null,
        referenceUrl: null,
        link: `/dashboard/student/exams&quizzes/${exam.id}`,
        examId: exam.id,
      });
    });

    return cards;
  }, [classData, assignmentsData, id]);

  if (classLoading || assignmentsLoading) {
    return (
      <div className="w-full py-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/4 mb-8"></div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
            ))}
          </div>
          <div className="flex-1 space-y-6">
            <div className="flex justify-between">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-64"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-24"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (classError || !classData) {
    notFound();
    return null;
  }

  return (
    <div className="w-full bg-background-light dark:bg-background-dark py-4">
      <MaterialsLayout
        materials={materialCards}
        className={classData.name}
        description={`Study materials, assignments, and assessment resources for ${classData.name}.`}
      />
    </div>
  );
}