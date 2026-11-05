'use client';

import React, { useMemo } from 'react';
import MaterialsLayout from '@/app/dashboard/student/my-classes/[id]/components/materials/components/MaterialsLayout';
import { MaterialCard } from '@/app/dashboard/student/my-classes/[id]/components/materials/components/types';
import { format } from 'date-fns';

interface AdminClassMaterialsTabProps {
  classData: any;
  classId: string;
  onRefresh?: () => void;
}

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
    if (u.hostname.includes('youtube') || u.hostname.includes('youtu.be')) return 'YouTube Video';
    if (u.hostname.includes('vimeo')) return 'Vimeo Video';

    const raw = decodeURIComponent(u.pathname.split('/').pop() || '');
    if (!raw) return fallbackLabel;

    return (
      raw
        .replace(/^\d{10,}-/, '')
        .replace(/^[a-z0-9]{6,12}-(?=[a-z0-9])/i, '')
        .replace(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-?/i, '')
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .trim() || fallbackLabel
    );
  } catch {
    return fallbackLabel;
  }
}

export default function AdminClassMaterialsTab({ classData, classId, onRefresh }: AdminClassMaterialsTabProps) {
  const materialCards = useMemo(() => {
    if (!classData) return [];

    const defaultTeacherName = classData.teachers?.[0]?.teacher?.name || 'Class Teacher';
    const classAssignments = classData.assignments || [];
    const classExams = classData.exams || [];

    const cards: MaterialCard[] = [];

    // 1. Assignments files & attachments
    classAssignments.forEach((a: any) => {
      const uploadDate = a.createdAt ? format(new Date(a.createdAt), 'MMM d, yyyy') : 'Unknown date';
      const rawDate = a.createdAt ? new Date(a.createdAt) : null;
      const teacher = a.teacher?.name || a.instructor?.name || a.creator?.name || a.teacherName || defaultTeacherName;
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
        link: `/dashboard/admin/assignments`,
      };

      if (a.attachmentUrl) {
        cards.push({
          ...sharedBase,
          id: `admin-assignment-${a.id}-attachment`,
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
          id: `admin-assignment-${a.id}-video`,
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
          id: `admin-assignment-${a.id}-reference`,
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

    // 2. Exams, Question papers, Reading content, and Diagrams
    classExams.forEach((exam: any) => {
      const uploadDate = exam.createdAt ? format(new Date(exam.createdAt), 'MMM d, yyyy') : 'Unknown date';
      const rawDate = exam.createdAt ? new Date(exam.createdAt) : null;
      const teacher = exam.teacher?.name || exam.creator?.name || exam.teacherName || defaultTeacherName;

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
        link: `/dashboard/admin/exams`,
      };

      // Extract subject exam paper diagram sheets & reading passages
      (exam.subjectExamPapers || []).forEach((sep: any, paperIdx: number) => {
        const paper = sep.subjectPaper;
        if (!paper) return;

        if (paper.readingContent && paper.readingContent.trim()) {
          cards.push({
            ...examBase,
            id: `admin-exam-${exam.id}-paper-${paper.id || paperIdx}-reading`,
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

        (paper.images || []).forEach((imgUrl: string, imgIdx: number) => {
          if (!imgUrl) return;
          const label = paper.imageLabels?.[imgIdx] || `Diagram / Reference ${imgIdx + 1}`;
          cards.push({
            ...examBase,
            id: `admin-exam-${exam.id}-paper-${paper.id || paperIdx}-img-${imgIdx}`,
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

      cards.push({
        ...examBase,
        id: `admin-exam-${exam.id}-core`,
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
  }, [classData]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
      <MaterialsLayout
        materials={materialCards}
        className={classData?.name || 'Class'}
        description={`Study materials, worksheets, reading passages, and exam files uploaded for ${classData?.name || 'this class'}.`}
        classId={classId}
        schoolId={classData?.schoolId}
        subjects={classData?.subjects || []}
        canUpload={true}
        onRefresh={onRefresh}
        accentRole="admin"
      />
    </div>
  );
}

