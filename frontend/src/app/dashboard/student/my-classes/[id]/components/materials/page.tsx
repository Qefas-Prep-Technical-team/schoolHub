'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useStudentAssignments } from '@/lib/api/hooks/useAssignments';
import { format } from 'date-fns';
import MaterialsLayout from './components/MaterialsLayout';
import { MaterialCard } from './components/types';

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
  subjectExamPapers?: Array<{
    subjectPaper?: {
      id?: string;
      title?: string;
      instructions?: string;
      readingContent?: string;
      images?: string[];
      imageLabels?: string[];
      subject?: { name?: string };
    };
  }>;
}

/** Detect file type from a URL string */
function detectFileType(url: string): 'pdf' | 'video' | 'image' | 'document' {
  if (url.match(/\.(mp4|mov|avi|webm|mkv)$/i)) return 'video';
  if (url.match(/\.pdf$/i)) return 'pdf';
  if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) return 'image';
  if (url.match(/youtu\.?be/i) || url.match(/vimeo\.com/i)) return 'video';
  return 'document';
}

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

  const { data: classData, isLoading: classLoading, refetch: refetchClass } = useSingleClass(id);
  const { data: assignmentsData, isLoading: assignmentsLoading, refetch: refetchAssignments } = useStudentAssignments({ limit: 200 });

  const materialCards = useMemo(() => {
    if (!classData) return [];

    const defaultTeacherName = classData.teachers?.[0]?.teacher?.name || 'Class Teacher';

    // 1. Collect assignments
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

    const resolveAssignmentTeacher = (a: AssignmentResource): string => {
      return a.teacher?.name || a.instructor?.name || a.creator?.name || a.teacherName || defaultTeacherName;
    };

    const resolveExamTeacher = (exam: ExamResource): string => {
      return exam.teacher?.name || exam.creator?.name || exam.teacherName || defaultTeacherName;
    };

    const cards: MaterialCard[] = [];

    // ── 1. Explode Assignment Direct Files & Media ───────────────────────────
    classAssignments.forEach((a) => {
      const uploadDate = a.createdAt ? format(new Date(a.createdAt), 'MMM d, yyyy') : 'Unknown date';
      const rawDate = a.createdAt ? new Date(a.createdAt) : null;
      const teacher = resolveAssignmentTeacher(a);
      const subjectName = typeof a.subject === 'object' ? a.subject?.name : a.subject;

      const sharedBase = {
        folder: 'Assignments',
        teacher,
        uploadDate,
        rawDate,
        description: a.instructions || 'No additional instructions provided.',
        assignmentTitle: a.title,
        assessmentName: a.title,
        sourceType: 'ASSIGNMENT' as const,
        sourceTitle: a.title,
        subjectName,
        assignmentId: a.id,
        link: `/dashboard/student/assignments/${a.id}`,
      };

      if (a.attachmentUrl) {
        cards.push({
          ...sharedBase,
          id: `assignment-${a.id}-attachment`,
          title: cleanFilename(a.attachmentUrl, `${a.title} Attachment`),
          type: detectFileType(a.attachmentUrl),
          attachmentUrl: a.attachmentUrl,
          videoUrl: null,
          referenceUrl: null,
          isFile: true,
          fileExtension: a.attachmentUrl.split('.').pop()?.toUpperCase() || 'FILE',
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
          isFile: true,
          fileExtension: 'VIDEO',
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
          isFile: false,
          fileExtension: 'LINK',
        });
      }
    });

    // ── 2. Explode Exam Files, Question Sheets & Reading Content ─────────────
    const classExams: ExamResource[] = classData.exams || [];
    classExams.forEach((exam) => {
      const uploadDate = exam.createdAt ? format(new Date(exam.createdAt), 'MMM d, yyyy') : 'Unknown date';
      const rawDate = exam.createdAt ? new Date(exam.createdAt) : null;
      const teacher = resolveExamTeacher(exam);

      let folder = 'Exams';
      let sourceType: 'EXAM' | 'QUIZ' | 'CA' = 'EXAM';
      const cat = (exam.category || '').toUpperCase();
      const titleLower = (exam.title || '').toLowerCase();

      if (cat === 'QUIZ' || titleLower.includes('quiz')) {
        folder = 'Test (Quiz)';
        sourceType = 'QUIZ';
      } else if (cat === 'CA' || cat === 'TEST' || titleLower.includes('ca') || titleLower.includes('test')) {
        folder = 'CA';
        sourceType = 'CA';
      }

      const examBase = {
        folder,
        teacher,
        uploadDate,
        rawDate,
        assessmentName: exam.title,
        sourceType,
        sourceTitle: exam.title,
        subjectName: exam.subject?.name || undefined,
        examId: exam.id,
        link: `/Exams&Quizzes/exam/${exam.id}`,
      };

      // Extract subject exam paper image attachments and reading passages
      (exam.subjectExamPapers || []).forEach((sep, paperIdx) => {
        const paper = sep.subjectPaper;
        if (!paper) return;

        // Reading Content Document
        if (paper.readingContent && paper.readingContent.trim()) {
          cards.push({
            ...examBase,
            id: `exam-${exam.id}-paper-${paper.id || paperIdx}-reading`,
            title: `${paper.title || exam.title} — Reading Passage`,
            description: paper.readingContent,
            type: 'document',
            attachmentUrl: null,
            videoUrl: null,
            referenceUrl: null,
            isFile: true,
            fileExtension: 'DOC',
          });
        }

        // Image attachments / diagram sheets
        (paper.images || []).forEach((imgUrl, imgIdx) => {
          if (!imgUrl) return;
          const label = paper.imageLabels?.[imgIdx] || `Diagram / Reference ${imgIdx + 1}`;
          cards.push({
            ...examBase,
            id: `exam-${exam.id}-paper-${paper.id || paperIdx}-img-${imgIdx}`,
            title: `${paper.title || exam.title} — ${label}`,
            description: `Diagram and question reference material for ${exam.title}.`,
            type: 'image',
            attachmentUrl: imgUrl,
            videoUrl: null,
            referenceUrl: null,
            isFile: true,
            fileExtension: imgUrl.split('.').pop()?.toUpperCase() || 'IMG',
          });
        });
      });

      // Also register the exam paper itself as an assessment resource
      cards.push({
        ...examBase,
        id: `exam-${exam.id}-core`,
        title: exam.title,
        description:
          exam.instructions ||
          exam.description ||
          `Assessment paper covering ${exam.subject?.name || classData.name}.${exam.durationMinutes ? ` Duration: ${exam.durationMinutes} mins.` : ''}${exam.totalMarks ? ` Total Marks: ${exam.totalMarks}.` : ''}`,
        type: 'document',
        attachmentUrl: null,
        videoUrl: null,
        referenceUrl: null,
        isFile: false,
        fileExtension: 'PAPER',
      });
    });

    return cards;
  }, [classData, assignmentsData, id]);

  if (classLoading || assignmentsLoading) {
    return (
      <div className="w-full py-6 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <MaterialsLayout
      materials={materialCards}
      className={classData?.name || 'Classroom'}
      description={classData?.description || 'Class study resources, files, and assessment attachments.'}
      classId={id}
      schoolId={classData?.schoolId}
      subjects={classData?.subjects || []}
      canUpload={false}
      accentRole="student"
      onRefresh={() => {
        refetchClass();
        refetchAssignments();
      }}
    />
  );
}
