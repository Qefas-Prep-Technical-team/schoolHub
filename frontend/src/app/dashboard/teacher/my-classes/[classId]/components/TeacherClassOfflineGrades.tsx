'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '@/lib/api/services/teacherService';
import { useTeacherProfile, useTeacherSubjects } from '@/lib/api/hooks/useTeacher';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { isOfflineGradeRecord, normalizeOfflineCategory } from '@/app/dashboard/admin/offline-grades/components/OfflineGradesDashboard';
import OfflineRecordsList from '@/app/dashboard/admin/offline-grades/components/OfflineRecordsList';
import RecordScoreEntryModal from '@/app/dashboard/admin/offline-grades/components/RecordScoreEntryModal';
import { GradeBatchSummary, OfflineAssessmentCategory } from '@/app/dashboard/admin/offline-grades/types';
import { generatePDF } from '@/utils/pdfGenerator';
import { gradeService } from '@/lib/api/services/gradeService';
import { toast } from 'react-toastify';

interface TeacherClassOfflineGradesProps {
  classId: string;
  schoolId?: string;
  teacherClassDetail?: any;
}

export default function TeacherClassOfflineGrades({
  classId,
  schoolId: propSchoolId,
  teacherClassDetail,
}: TeacherClassOfflineGradesProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { selectedSchoolId } = useDashboardStore();
  const { data: teacherProfile } = useTeacherProfile();

  const currentTeacherId = (user as any)?.id as string | undefined;
  const storeSchoolId = selectedSchoolId && selectedSchoolId !== currentTeacherId ? selectedSchoolId : undefined;

  const userSchoolId =
    (user as any)?.schoolId ||
    (user as any)?.school?.id ||
    user?.schools?.[0]?.schoolId ||
    (teacherProfile as any)?.activeSchoolId ||
    (teacherProfile as any)?.primarySchoolId ||
    (teacherProfile as any)?.school?.id ||
    teacherClassDetail?.classInfo?.schoolId ||
    '';

  const effectiveSchoolId = propSchoolId || storeSchoolId || userSchoolId;
  const { data: schoolProfile } = useSchoolProfile(effectiveSchoolId);

  // Fetch subjects strictly assigned to this teacher
  const { data: teacherSubjectsData } = useTeacherSubjects(effectiveSchoolId || undefined);

  const teacherSubjectIdSet = useMemo(() => {
    if (!teacherSubjectsData) return new Set<string>();
    return new Set(
      teacherSubjectsData
        .map((s: any) => (s.id || s.subjectId || s.subject?.id || '').toString())
        .filter(Boolean)
    );
  }, [teacherSubjectsData]);

  const teacherSubjectNames = useMemo(() => {
    const names = new Set<string>();

    if (Array.isArray(teacherSubjectsData)) {
      teacherSubjectsData.forEach((s: any) => {
        const name = (s.name || s.subject?.name || '').trim().toLowerCase();
        if (name) names.add(name);
        const code = (s.code || s.subject?.code || '').trim().toLowerCase();
        if (code) names.add(code);
      });
    }

    // Include teacher profile focus subject if present
    const userSubjectStr = (user as any)?.subject;
    if (typeof userSubjectStr === 'string' && userSubjectStr) {
      userSubjectStr.split(',').forEach((sub: string) => {
        const trimmed = sub.trim().toLowerCase();
        if (trimmed) names.add(trimmed);
      });
    }

    return names;
  }, [teacherSubjectsData, user]);

  // Fetch class offline grades via dedicated Teacher Class Offline Grades API
  const { data: classOfflineData, isLoading } = useQuery({
    queryKey: ['teacher-class-offline-grades', classId, effectiveSchoolId],
    queryFn: async () => {
      const res = await teacherService.getClassOfflineGrades(classId, {
        schoolId: effectiveSchoolId || undefined,
      });

      const grades = Array.isArray(res?.data) ? res.data : [];
      const classInfo = res?.classInfo || teacherClassDetail?.classInfo;
      const resolvedClassName = classInfo?.name
        ? `${classInfo.name} ${classInfo.section || ''}`.trim()
        : 'This Class';

      const groupMap = new Map<string, GradeBatchSummary & { _scoreSum?: number }>();

      grades.forEach((g: any) => {
        if (!isOfflineGradeRecord(g)) return;

        // Check if grade corresponds to subject assigned to the teacher
        const sId = (g.subjectId || g.subject?.id || g.subjectPaper?.subject?.id || '').toString();
        const sName = (g.subject || g.subjectName || g.subjectPaper?.subject?.name || '').toString().trim().toLowerCase();
        const isMatchedSubject = Boolean(
          (sId && teacherSubjectIdSet.has(sId)) ||
          (sName && (
            teacherSubjectNames.has(sName) ||
            Array.from(teacherSubjectNames).some(assignedName =>
              sName.includes(assignedName) || assignedName.includes(sName)
            )
          ))
        );

        const resolvedCategory = normalizeOfflineCategory(g.category, g.assessmentType);
        const assessmentTitle = g.assessmentType || `${resolvedCategory} Assessment`;
        const key = `${classId}_${(g.subject || '').trim().toLowerCase()}_${resolvedCategory}_${assessmentTitle.trim().toLowerCase()}_${g.term || 'FIRST'}`;
        const existingGroup = groupMap.get(key);

        const hasScore = g.score !== null && g.score !== undefined && !isNaN(Number(g.score));
        const numScore = hasScore ? Number(g.score) : 0;
        const resolvedTeacherName = g.creatorName || g.teacher?.name || (g.teacherId === user?.id ? (user?.name || 'You') : null);

        if (existingGroup) {
          existingGroup.totalStudents += 1;
          if (hasScore) {
            existingGroup.gradedStudents += 1;
            existingGroup._scoreSum = (existingGroup._scoreSum || 0) + numScore;
            existingGroup.averageScore = existingGroup._scoreSum / existingGroup.gradedStudents;
          }
          if (!existingGroup.teacherName && resolvedTeacherName) {
            existingGroup.teacherName = resolvedTeacherName;
            existingGroup.teacherId = g.teacherId || g.teacher?.id;
            existingGroup.teacherCode = g.teacher?.teacherCode;
          }
          if (isMatchedSubject) {
            existingGroup.isAssignedSubject = true;
          }
          if (g.createdAt && new Date(g.createdAt) > new Date(existingGroup.createdAt)) {
            existingGroup.createdAt = g.createdAt;
          }
          if (g.updatedAt && new Date(g.updatedAt) > new Date(existingGroup.updatedAt)) {
            existingGroup.updatedAt = g.updatedAt;
          }
        } else {
          groupMap.set(key, {
            id: g.id,
            classId,
            className: resolvedClassName,
            subject: g.subject || 'General',
            category: resolvedCategory,
            assessmentType: assessmentTitle,
            maxMarks: g.maxMarks || (resolvedCategory === 'CA' ? 20 : (resolvedCategory === 'QUIZ' ? 10 : (resolvedCategory === 'MIDTERM' ? 40 : 100))),
            term: g.term || 'FIRST',
            sessionId: g.sessionId || '',
            totalStudents: 1,
            gradedStudents: hasScore ? 1 : 0,
            averageScore: numScore,
            status: g.status || 'DRAFT',
            releaseDate: g.releaseDate || undefined,
            createdAt: g.createdAt || new Date().toISOString(),
            updatedAt: g.updatedAt || new Date().toISOString(),
            teacherId: g.teacherId || g.teacher?.id || null,
            teacherName: resolvedTeacherName,
            teacherCode: g.teacher?.teacherCode || null,
            _scoreSum: numScore,
            isAssignedSubject: isMatchedSubject,
          });
        }
      });

      const list = Array.from(groupMap.values());
      list.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return timeB - timeA;
      });

      return list;
    },
    enabled: !!classId,
    staleTime: 1000 * 60 * 3,
  });

  const records = classOfflineData || [];

  // Modal State for Entering/Editing Grades
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<GradeBatchSummary | null>(null);
  const [defaultCategoryForNew, setDefaultCategoryForNew] = useState<OfflineAssessmentCategory | undefined>();
  const [defaultSubjectForNew, setDefaultSubjectForNew] = useState<string | undefined>();
  const [defaultMaxMarksForNew, setDefaultMaxMarksForNew] = useState<number | undefined>();
  const [initialScoresForNew, setInitialScoresForNew] = useState<Record<string, { score: number; remarks?: string }> | undefined>();

  const handleAddNewRecord = (category?: OfflineAssessmentCategory) => {
    setSelectedRecordForEdit(null);
    setDefaultCategoryForNew(category);
    setDefaultSubjectForNew(undefined);
    setDefaultMaxMarksForNew(undefined);
    setInitialScoresForNew(undefined);
    setIsScoreModalOpen(true);
  };

  const handleEditRecord = (record: GradeBatchSummary) => {
    setSelectedRecordForEdit(record);
    setIsScoreModalOpen(true);
  };

  const handleDeleteRecord = async (recordId: string, record?: GradeBatchSummary) => {
    try {
      const criteria = record ? {
        classId: record.classId || classId,
        subject: record.subject,
        assessmentType: record.assessmentType,
        category: record.category,
        term: record.term,
      } : { classId };

      const res = await gradeService.deleteBatchGrades(recordId, criteria);
      const count = res?.data?.count || 1;
      toast.success(`Successfully deleted offline assessment marksheet (${count} student ${count === 1 ? 'grade' : 'grades'} removed).`);
      queryClient.invalidateQueries({ queryKey: ['teacher-class-offline-grades', classId] });
      queryClient.invalidateQueries({ queryKey: ['offline-grades-history'] });
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['gradeHub'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Failed to delete offline record.');
    }
  };

  const handleExportPDF = (record?: GradeBatchSummary) => {
    if (record) {
      generatePDF({
        title: `Offline Assessment Marksheet — ${record.assessmentType}`,
        filename: `Marksheet_${record.subject}_${record.className.replace(/\s+/g, '_')}.pdf`,
        schoolProfile,
        orientation: 'portrait',
        metaData: [
          { label: 'Class Cohort', value: record.className },
          { label: 'Subject Curriculum', value: record.subject },
          { label: 'Assessment Category', value: record.category },
          { label: 'Max Score Marks', value: String(record.maxMarks) },
          { label: 'Graded Students', value: `${record.gradedStudents} students` },
          { label: 'Class Average', value: `${record.averageScore.toFixed(1)} / ${record.maxMarks}` },
        ],
        tableHeaders: [['Metric Description', 'Cohort Value']],
        tableData: [
          ['Assessment Name', record.assessmentType],
          ['Subject Curriculum', record.subject],
          ['Academic Term', record.term],
          ['Total Enrolled', `${record.totalStudents} students`],
          ['Graded Students', `${record.gradedStudents} students`],
          ['Class Mean Average', `${record.averageScore.toFixed(1)} / ${record.maxMarks}`],
          ['Assessment Status', record.status],
        ],
      });
    }
  };

  const handleExportCSV = (record?: GradeBatchSummary) => {
    const listToExport = record ? [record] : records;
    if (listToExport.length === 0) {
      toast.info('No offline assessment records available to export.');
      return;
    }

    const headers = ['Assessment Title', 'Subject', 'Class', 'Category', 'Term', 'Graded Students', 'Average Score', 'Max Marks', 'Status'];
    const rows = listToExport.map(r => [
      `"${r.assessmentType.replace(/"/g, '""')}"`,
      `"${r.subject.replace(/"/g, '""')}"`,
      `"${r.className.replace(/"/g, '""')}"`,
      r.category,
      r.term,
      r.gradedStudents,
      r.averageScore.toFixed(1),
      r.maxMarks,
      r.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Class_Offline_Grades_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const classItem = useMemo(() => {
    const classInfo = teacherClassDetail?.classInfo;
    return [{
      id: classId,
      name: classInfo?.name || 'Class',
      section: classInfo?.section || '',
      schoolId: effectiveSchoolId,
    }];
  }, [classId, teacherClassDetail, effectiveSchoolId]);

  // Fetch academic sessions for the school
  const { data: sessionsData } = useSessions(effectiveSchoolId);
  const sessions = useMemo(() => {
    return Array.isArray(sessionsData?.data) ? sessionsData.data : (Array.isArray(sessionsData) ? sessionsData : []);
  }, [sessionsData]);

  return (
    <div className="w-full max-w-full space-y-6">
      <OfflineRecordsList
        records={records}
        classes={classItem}
        isLoading={isLoading}
        isTeacher={true}
        hideClassFilter={true}
        activeClassId={classId}
        gradingSystem={schoolProfile?.gradingSystem}
        onAddNewRecord={handleAddNewRecord}
        onEditRecord={handleEditRecord}
        onDeleteRecord={handleDeleteRecord}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
      />

      {isScoreModalOpen && (
        <RecordScoreEntryModal
          key={selectedRecordForEdit ? `edit_${selectedRecordForEdit.id}` : `new_${defaultCategoryForNew || 'cat'}_${classId}`}
          isOpen={isScoreModalOpen}
          onClose={() => {
            setIsScoreModalOpen(false);
            setSelectedRecordForEdit(null);
            setDefaultCategoryForNew(undefined);
            setDefaultSubjectForNew(undefined);
            setDefaultMaxMarksForNew(undefined);
            setInitialScoresForNew(undefined);
          }}
          onSavedSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['teacher-class-offline-grades', classId] });
            queryClient.invalidateQueries({ queryKey: ['offline-grades-history'] });
            setIsScoreModalOpen(false);
            setSelectedRecordForEdit(null);
          }}
          schoolId={effectiveSchoolId}
          gradingSystem={schoolProfile?.gradingSystem}
          classes={classItem}
          sessions={sessions}
          initialRecord={selectedRecordForEdit}
          defaultClassId={classId}
          defaultCategory={defaultCategoryForNew}
          defaultSubject={defaultSubjectForNew}
          defaultMaxMarks={defaultMaxMarksForNew}
          initialScores={initialScoresForNew}
        />
      )}
    </div>
  );
}
