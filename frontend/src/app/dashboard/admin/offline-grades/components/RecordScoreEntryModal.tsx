"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  FileSpreadsheet,
  Save,
  CheckCircle2,
  X,
  RotateCcw,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const EMPTY_ARRAY: unknown[] = [];
import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useSchoolDepartments, useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useTeacherSubjects } from '@/lib/api/hooks/useTeacher';
import { useGradeHub } from '@/lib/api/hooks/useGrades';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { gradeService } from '@/lib/api/services/gradeService';
import { toast } from 'react-toastify';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import OfflineGradesHeader from './OfflineGradesHeader';
import OfflineGradesStats from './OfflineGradesStats';
import RosterSpreadsheetView from './RosterSpreadsheetView';
import MobileRosterCardView from './MobileRosterCardView';
import OfflineGradesCSVModal from './OfflineGradesCSVModal';
import OfflineGradesOCRModal from './OfflineGradesOCRModal';
import * as XLSX from 'xlsx';
import { generatePDF } from '@/utils/pdfGenerator';
import { computeGradePill } from '@/utils/gradingSystem';
import {
  OfflineGradesBatchConfig,
  OfflineStudentGradeEntry,
  GradeBatchSummary,
  OfflineAssessmentCategory
} from '../types';

interface ClassItem {
  id: string;
  name: string;
  section?: string;
  [key: string]: unknown;
}

interface SessionItem {
  id: string;
  name: string;
  isCurrent?: boolean;
  isActive?: boolean;
  status?: string;
  currentTerm?: string;
  term?: string;
  [key: string]: unknown;
}

interface DepartmentItem {
  id: string;
  name: string;
  code?: string;
  [key: string]: unknown;
}

interface TeacherSubjectItem {
  id?: string;
  subjectId?: string;
  name?: string;
  subject?: {
    id?: string;
    name?: string;
    departments?: unknown[];
  };
  departments?: unknown[];
  [key: string]: unknown;
}

interface RecordScoreEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  gradingSystem?: unknown[];
  classes: ClassItem[];
  sessions: SessionItem[];
  initialRecord?: GradeBatchSummary | null;
  defaultCategory?: OfflineAssessmentCategory;
  defaultClassId?: string;
  defaultSubject?: string;
  defaultMaxMarks?: number;
  initialScores?: Record<string, { score: number; remarks?: string }>;
  onSavedSuccess: () => void;
}

export default function RecordScoreEntryModal({
  isOpen,
  onClose,
  schoolId,
  gradingSystem,
  classes,
  sessions,
  initialRecord,
  defaultCategory,
  defaultClassId,
  defaultSubject,
  defaultMaxMarks,
  initialScores,
  onSavedSuccess,
}: RecordScoreEntryModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isTeacher = user?.userType === 'TEACHER';

  // If teacher, fetch subjects assigned to this teacher (staleTime 5min per AGENTS.md rule 2.1)
  const { data: teacherSubjectsData, isLoading: isLoadingTeacherSubjects } = useTeacherSubjects(
    isTeacher ? schoolId : undefined
  );

  // Fetch school departments (staleTime 10min per AGENTS.md rule 2.1)
  const { data: schoolDepartmentsData } = useSchoolDepartments(schoolId);
  const schoolDepartments = (schoolDepartmentsData as DepartmentItem[]) || (EMPTY_ARRAY as DepartmentItem[]);

  // Fetch school profile for grading system configuration
  const { data: schoolProfile } = useSchoolProfile(schoolId);
  const activeGradingSystem = (gradingSystem as unknown[]) || schoolProfile?.gradingSystem;

  // 1. Auto-select current active session and term
  const currentSession = useMemo(() => {
    return (
      sessions.find(
        (s) => s.isCurrent === true || s.isActive === true || s.status === 'ACTIVE'
      ) || sessions[0]
    );
  }, [sessions]);

  const currentTerm = useMemo((): 'FIRST' | 'SECOND' | 'THIRD' => {
    const raw = currentSession?.currentTerm || currentSession?.term;
    if (!raw) return 'FIRST';
    const s = String(raw).toUpperCase().trim();
    if (s.includes('SECOND') || s === '2') return 'SECOND';
    if (s.includes('THIRD') || s === '3') return 'THIRD';
    return 'FIRST';
  }, [currentSession]);

  // 2. Active Class Selection
  const activeClassId = initialRecord?.classId || defaultClassId || '';
  const initialClassObj = activeClassId ? classes.find((c) => c.id === activeClassId) : null;
  const activeClassName =
    initialRecord?.className ||
    (initialClassObj ? `${initialClassObj.name} ${initialClassObj.section || ''}`.trim() : '');

  const initialCat: OfflineAssessmentCategory = initialRecord?.category || defaultCategory || 'CA';
  const initialDefaultMax =
    initialRecord?.maxMarks ||
    defaultMaxMarks ||
    (initialCat === 'CA' ? 20 : initialCat === 'QUIZ' ? 10 : initialCat === 'MIDTERM' ? 40 : 100);
  const initialDefaultTitle =
    initialCat === 'EXAM'
      ? 'Terminal Exam 1'
      : initialCat === 'ASSIGNMENT'
      ? 'Physical Assignment 1'
      : initialCat === 'QUIZ'
      ? 'Quiz 1'
      : initialCat === 'MIDTERM'
      ? 'Mid-Term Test'
      : 'Continuous Assessment 1';

  // Active configuration
  const [config, setConfig] = useState<OfflineGradesBatchConfig>({
    classId: activeClassId,
    className: activeClassName,
    departmentId: 'ALL',
    departmentName: undefined,
    subject: initialRecord?.subject || defaultSubject || '',
    category: initialCat,
    assessmentType: initialRecord?.assessmentType || initialDefaultTitle,
    maxMarks: initialDefaultMax,
    weight: 1.0,
    term: initialRecord?.term || currentTerm,
    sessionId: initialRecord?.sessionId || currentSession?.id || '',
    sessionName: initialRecord?.sessionName || currentSession?.name || '',
    releaseDate: initialRecord?.releaseDate
      ? new Date(initialRecord.releaseDate).toISOString().slice(0, 16)
      : '',
    status: initialRecord?.status || 'DRAFT',
  });

  // Track open state and record identity to prevent redundant state resets
  const prevModalStateRef = useRef<{ isOpen: boolean; recordId?: string; classId?: string }>({
    isOpen: false,
    recordId: undefined,
    classId: undefined,
  });

  useEffect(() => {
    if (!isOpen) {
      prevModalStateRef.current.isOpen = false;
      return;
    }

    const wasOpen = prevModalStateRef.current.isOpen;
    const prevRecordId = prevModalStateRef.current.recordId;
    const prevClassId = prevModalStateRef.current.classId;

    if (!wasOpen || initialRecord?.id !== prevRecordId || defaultClassId !== prevClassId) {
      prevModalStateRef.current = {
        isOpen: true,
        recordId: initialRecord?.id,
        classId: defaultClassId,
      };

      if (initialRecord) {
        setConfig({
          classId: initialRecord.classId,
          className: initialRecord.className,
          departmentId: 'ALL',
          departmentName: undefined,
          subject: initialRecord.subject,
          category: initialRecord.category,
          assessmentType: initialRecord.assessmentType,
          maxMarks: initialRecord.maxMarks,
          weight: 1.0,
          term: initialRecord.term || currentTerm,
          sessionId: initialRecord.sessionId || currentSession?.id || '',
          sessionName: initialRecord.sessionName || currentSession?.name || '',
          releaseDate: initialRecord.releaseDate
            ? new Date(initialRecord.releaseDate).toISOString().slice(0, 16)
            : '',
          status: initialRecord.status,
        });
      } else {
        const cat: OfflineAssessmentCategory = defaultCategory || 'CA';
        const defaultMax =
          defaultMaxMarks ||
          (cat === 'CA' ? 20 : cat === 'QUIZ' ? 10 : cat === 'MIDTERM' ? 40 : 100);
        const targetClass = defaultClassId ? classes.find((c) => c.id === defaultClassId) : null;

        setConfig({
          classId: defaultClassId || '',
          className: targetClass?.name
            ? `${targetClass.name} ${targetClass.section || ''}`.trim()
            : '',
          departmentId: 'ALL',
          departmentName: undefined,
          subject: defaultSubject || '',
          category: cat,
          assessmentType:
            cat === 'EXAM'
              ? 'Terminal Exam 1'
              : cat === 'ASSIGNMENT'
              ? 'Physical Assignment 1'
              : cat === 'QUIZ'
              ? 'Quiz 1'
              : cat === 'MIDTERM'
              ? 'Mid-Term Test'
              : 'Continuous Assessment 1',
          maxMarks: defaultMax,
          weight: 1.0,
          term: currentTerm,
          sessionId: currentSession?.id || '',
          sessionName: currentSession?.name || '',
          releaseDate: '',
          status: 'DRAFT',
        });
      }
    }
  }, [
    isOpen,
    initialRecord,
    defaultCategory,
    defaultClassId,
    defaultSubject,
    defaultMaxMarks,
    classes,
    currentTerm,
    currentSession,
  ]);

  // Fetch Class Details (Subjects, Departments, and Enrolled Students)
  const { data: classDetails, isLoading: isLoadingClassDetails } = useSingleClass(config.classId);

  // Set of Teacher Assigned Subject IDs & Names
  const teacherAssignedSubjectIds = useMemo(() => {
    if (!isTeacher || !Array.isArray(teacherSubjectsData)) return new Set<string>();
    return new Set(
      (teacherSubjectsData as TeacherSubjectItem[])
        .map((s) => (s.id || s.subjectId || s.subject?.id || '').toString())
        .filter(Boolean)
    );
  }, [isTeacher, teacherSubjectsData]);

  const teacherAssignedSubjectNames = useMemo(() => {
    if (!isTeacher || !Array.isArray(teacherSubjectsData)) return new Set<string>();
    return new Set(
      (teacherSubjectsData as TeacherSubjectItem[])
        .map((s) => (s.name || s.subject?.name || '').trim().toLowerCase())
        .filter(Boolean)
    );
  }, [isTeacher, teacherSubjectsData]);

  // Teacher departments connected to their assigned subjects
  const teacherAssignedDepartmentIds = useMemo(() => {
    if (!isTeacher || !Array.isArray(teacherSubjectsData)) return new Set<string>();
    const deptSet = new Set<string>();
    (teacherSubjectsData as TeacherSubjectItem[]).forEach((s) => {
      const subject = s.subject || s;
      const depts = (subject.departments || s.departments || []) as unknown[];
      depts.forEach((d) => {
        const item = d as { departmentId?: string; department?: { id?: string }; id?: string };
        const id = item.departmentId || item.department?.id || item.id;
        if (id) deptSet.add(String(id));
      });
    });
    return deptSet;
  }, [isTeacher, teacherSubjectsData]);

  // Extract raw class subjects from both classDetails.subjects AND classDetails.departments
  const rawClassSubjects = useMemo((): { id?: string; name: string; deptIds: string[] }[] => {
    const map = new Map<string, { id?: string; name: string; deptIds: string[] }>();

    // 1. Direct class subjects
    if (classDetails?.subjects && Array.isArray(classDetails.subjects)) {
      classDetails.subjects.forEach((cs: unknown) => {
        const item = cs as {
          name?: string;
          subject?: {
            id?: string;
            name?: string;
            departments?: unknown[];
          };
          id?: string;
          departments?: unknown[];
        };
        const sub = item.subject || item;
        const name = typeof sub === 'string' ? sub : sub?.name || '';
        if (!name) return;

        const depts = (sub?.departments || item.departments || []) as unknown[];
        const deptIds = depts
          .map((d) => {
            const di = d as { departmentId?: string; department?: { id?: string }; id?: string };
            return di.departmentId || di.department?.id || di.id;
          })
          .filter(Boolean) as string[];

        const key = name.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, { id: sub?.id, name, deptIds: [...deptIds] });
        } else {
          const existing = map.get(key)!;
          deptIds.forEach((id) => {
            if (!existing.deptIds.includes(id)) existing.deptIds.push(id);
          });
        }
      });
    }

    // 2. Department subjects linked to this class
    if (classDetails?.departments && Array.isArray(classDetails.departments)) {
      classDetails.departments.forEach((cd: unknown) => {
        const item = cd as {
          departmentId?: string;
          department?: {
            id?: string;
            subjects?: unknown[];
          };
          subjects?: unknown[];
        };
        const deptId = item.department?.id || item.departmentId;
        const subjects = (item.department?.subjects || item.subjects || []) as unknown[];

        subjects.forEach((s) => {
          const subItem = s as {
            name?: string;
            subject?: { id?: string; name?: string };
            id?: string;
          };
          const sub = subItem.subject || subItem;
          const name = typeof sub === 'string' ? sub : sub?.name || '';
          if (!name) return;

          const key = name.trim().toLowerCase();
          if (!map.has(key)) {
            map.set(key, {
              id: sub?.id,
              name,
              deptIds: deptId ? [String(deptId)] : [],
            });
          } else {
            const existing = map.get(key)!;
            if (deptId && !existing.deptIds.includes(String(deptId))) {
              existing.deptIds.push(String(deptId));
            }
          }
        });
      });
    }

    return Array.from(map.values());
  }, [classDetails]);

  // Filter class subjects if teacher
  const allClassSubjects = useMemo((): { id?: string; name: string; deptIds: string[] }[] => {
    if (!isTeacher) return rawClassSubjects;

    const matched = rawClassSubjects.filter((s) => {
      if (s.id && teacherAssignedSubjectIds.has(s.id)) return true;
      if (s.name && teacherAssignedSubjectNames.has(s.name.trim().toLowerCase())) return true;
      return false;
    });

    if (matched.length > 0) return matched;

    // Fallback if class doesn't have explicit join entries but teacher has assigned subjects
    if (Array.isArray(teacherSubjectsData) && teacherSubjectsData.length > 0) {
      return (teacherSubjectsData as TeacherSubjectItem[])
        .map((ts) => {
          const sub = ts.subject || ts;
          const name = sub?.name || ts.name || '';
          const depts = (sub?.departments || ts.departments || []) as unknown[];
          const deptIds = depts
            .map((d) => {
              const di = d as { departmentId?: string; department?: { id?: string }; id?: string };
              return di.departmentId || di.department?.id || di.id;
            })
            .filter(Boolean) as string[];
          return { id: sub?.id || ts.id, name, deptIds };
        })
        .filter((s) => !!s.name);
    }

    return rawClassSubjects;
  }, [rawClassSubjects, isTeacher, teacherAssignedSubjectIds, teacherAssignedSubjectNames, teacherSubjectsData]);

  // Available departments in this class
  // Rule: Teacher should only see departments connected to their assigned subjects
  const availableDepartments = useMemo((): DepartmentItem[] => {
    if (!config.classId) return [];

    const list: DepartmentItem[] = [];
    if (classDetails?.departments && Array.isArray(classDetails.departments)) {
      for (const cd of classDetails.departments as unknown[]) {
        const item = cd as {
          department?: { id?: string; name?: string; code?: string };
          id?: string;
          name?: string;
          code?: string;
        };
        const dept = item.department || item;
        if (dept?.id && !list.some((d) => d.id === dept.id)) {
          list.push({ id: dept.id, name: dept.name || 'Department', code: dept.code });
        }
      }
    }

    if (isTeacher) {
      // Find all department IDs linked to the teacher's class subjects
      const teacherClassDeptIds = new Set<string>();
      allClassSubjects.forEach((s) => {
        s.deptIds.forEach((id) => teacherClassDeptIds.add(id));
      });
      teacherAssignedDepartmentIds.forEach((id) => teacherClassDeptIds.add(id));

      if (teacherClassDeptIds.size > 0) {
        const filtered = list.filter((dept) => teacherClassDeptIds.has(dept.id));
        if (filtered.length > 0) return filtered;
      }
    }

    if (list.length > 0) return list;
    if (Array.isArray(schoolDepartments) && schoolDepartments.length > 0) {
      return schoolDepartments.map((d) => ({ id: d.id, name: d.name, code: d.code }));
    }
    return [];
  }, [config.classId, classDetails?.departments, isTeacher, allClassSubjects, teacherAssignedDepartmentIds, schoolDepartments]);

  // Class subjects filtered by selected department
  const classSubjects = useMemo((): string[] => {
    if (!config.departmentId || config.departmentId === 'ALL') {
      return allClassSubjects.map((s) => s.name);
    }
    const matched = allClassSubjects.filter(
      (s) => s.deptIds.length === 0 || s.deptIds.includes(config.departmentId!)
    );
    return (matched.length > 0 ? matched : allClassSubjects).map((s) => s.name);
  }, [allClassSubjects, config.departmentId]);

  // Departments associated with the currently chosen subject
  const subjectDepartmentIds = useMemo((): string[] => {
    if (!config.subject) return [];
    const targetName = config.subject.trim().toLowerCase();
    const matched = new Set<string>();

    const foundSub = allClassSubjects.find((s) => s.name.trim().toLowerCase() === targetName);
    if (foundSub) {
      foundSub.deptIds.forEach((id) => matched.add(id));
    }

    if (isTeacher && Array.isArray(teacherSubjectsData)) {
      const teacherSubjectMatch = (teacherSubjectsData as TeacherSubjectItem[]).find((s) => {
        const subject = s.subject || s;
        return (
          (subject?.name || s.name || '').trim().toLowerCase() === targetName ||
          (subject?.id || s.id || s.subjectId || '').toString() === (foundSub?.id || '')
        );
      });
      const subject = teacherSubjectMatch?.subject || teacherSubjectMatch;
      const depts = (subject?.departments || teacherSubjectMatch?.departments || []) as unknown[];
      depts.forEach((d) => {
        const di = d as { departmentId?: string; department?: { id?: string }; id?: string };
        const deptId = di.departmentId || di.department?.id || di.id;
        if (deptId) matched.add(String(deptId));
      });
    }

    return Array.from(matched);
  }, [allClassSubjects, config.subject, isTeacher, teacherSubjectsData]);

  // Student association check for roster filtering
  const isStudentAssociatedWithSubject = useCallback(
    (student: { departmentId?: string | null; department?: { id?: string | null } }): boolean => {
      const studentDeptId = student.departmentId || student.department?.id || undefined;

      if (config.departmentId && config.departmentId !== 'ALL') {
        return studentDeptId === config.departmentId;
      }

      if (subjectDepartmentIds.length > 0) {
        return !!studentDeptId && subjectDepartmentIds.includes(studentDeptId);
      }

      return true;
    },
    [config.departmentId, subjectDepartmentIds]
  );

  // Auto-select first available subject if subject is empty or no longer valid
  useEffect(() => {
    if (classSubjects.length > 0 && (!config.subject || !classSubjects.includes(config.subject))) {
      setConfig((prev) => ({ ...prev, subject: classSubjects[0] }));
    }
  }, [classSubjects, config.subject]);

  // 3. Roster State and Existing Grades Synchronization
  const [roster, setRoster] = useState<OfflineStudentGradeEntry[]>([]);

  // Fetch existing grades for this class, subject to pre-populate
  const { data: existingGradesData, isLoading: isLoadingGrades } = useGradeHub(schoolId, {
    classId: config.classId || undefined,
    subject: config.subject || undefined,
    offlineOnly: 'true',
    limit: 1000,
  });

  // Construct initial roster from enrollments and sync existing grades / initialScores
  useEffect(() => {
    if (!classDetails?.enrollments) {
      setRoster([]);
      return;
    }

    const rawGradesList = Array.isArray((existingGradesData as any)?.data)
      ? (existingGradesData as any).data
      : (Array.isArray((existingGradesData as any)?.grades)
        ? (existingGradesData as any).grades
        : (Array.isArray(existingGradesData) ? existingGradesData : []));

    const existingMap = new Map<string, { id?: string; score: number; remarks?: string; status?: string }>();
    if (rawGradesList.length > 0) {
      rawGradesList.forEach((g: unknown) => {
        const grade = g as {
          studentId: string;
          assessmentType?: string;
          id?: string;
          score: number;
          remarks?: string;
          status?: string;
        };
        const titleMatch =
          !config.assessmentType ||
          (grade.assessmentType || '').trim().toLowerCase() === config.assessmentType.trim().toLowerCase();
        if (titleMatch) {
          existingMap.set(grade.studentId, {
            id: grade.id,
            score: grade.score,
            remarks: grade.remarks,
            status: grade.status,
          });
        }
      });
    }

    const list: OfflineStudentGradeEntry[] = [];
    (classDetails.enrollments as unknown[]).forEach((e: unknown) => {
      const enrollment = e as {
        student?: {
          id: string;
          name: string;
          studentCode?: string;
          profileImage?: string | null;
          departmentId?: string | null;
          department?: { id: string; name: string };
        };
      };
      const student = enrollment.student;
      if (!student) return;

      if (!isStudentAssociatedWithSubject(student)) {
        return;
      }

      const existing = existingMap.get(student.id);
      const passedInScore = initialScores?.[student.id];

      const scoreVal =
        passedInScore !== undefined
          ? passedInScore.score
          : existing !== undefined
          ? existing.score
          : '';

      const remarksVal =
        passedInScore?.remarks !== undefined
          ? passedInScore.remarks
          : existing?.remarks !== undefined
          ? existing.remarks
          : '';

      list.push({
        studentId: student.id,
        studentName: student.name,
        studentCode: student.studentCode || '',
        profileImage: student.profileImage,
        departmentId: student.departmentId || student.department?.id,
        departmentName: student.department?.name,
        score: scoreVal,
        remarks: remarksVal,
        existingGradeId: existing?.id,
        status: (existing?.status as 'DRAFT' | 'PUBLISHED') || 'DRAFT',
      });
    });

    list.sort((a, b) => a.studentName.localeCompare(b.studentName));
    setRoster(list);
  }, [
    classDetails?.enrollments,
    existingGradesData,
    config.assessmentType,
    config.classId,
    config.subject,
    initialScores,
    isStudentAssociatedWithSubject,
  ]);

  // Update single student score
  const handleUpdateScore = useCallback(
    (studentId: string, score: string | number) => {
      setRoster((prev) =>
        prev.map((item) => {
          if (item.studentId !== studentId) return item;
          if (score === '' || score === null || score === undefined) {
            return { ...item, score: '' };
          }
          const num = Number(score);
          if (isNaN(num)) return item;
          const clamped = Math.max(0, Math.min(config.maxMarks, num));
          return { ...item, score: clamped };
        })
      );
    },
    [config.maxMarks]
  );

  // Update single student remarks
  const handleUpdateRemarks = useCallback((studentId: string, remarks: string) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, remarks } : item))
    );
  }, []);

  // Batch fill scores
  const handleBatchFill = useCallback(
    (scoreValue: number, remarks?: string) => {
      const clamped = Math.max(0, Math.min(config.maxMarks, scoreValue));
      setRoster((prev) =>
        prev.map((item) => ({
          ...item,
          score: clamped,
          remarks: remarks !== undefined ? remarks : item.remarks,
        }))
      );
      toast.info(`Updated all scores to ${clamped}`);
    },
    [config.maxMarks]
  );

  // Clear all scores
  const handleClearAll = useCallback(() => {
    setRoster((prev) => prev.map((item) => ({ ...item, score: '', remarks: '' })));
    toast.info('Cleared all entered marks');
  }, []);

  // Bulk save mutation
  const saveMutation = useMutation({
    mutationFn: async (targetStatus: 'DRAFT' | 'PUBLISHED') => {
      if (!config.classId) {
        throw new Error('Please select a target class cohort');
      }
      if (!config.subject) {
        throw new Error('Please specify the curriculum subject');
      }
      const teacherId = (user as any)?.teacherId || (user as any)?.id || undefined;

      const gradesToSubmit = roster
        .filter((r) => r.score !== '' && r.score !== null && r.score !== undefined)
        .map((r) => ({
          studentId: r.studentId,
          studentName: r.studentName,
          classId: config.classId,
          subject: config.subject,
          teacherId,
          category: config.category,
          assessmentType: config.assessmentType,
          score: Number(r.score),
          maxMarks: config.maxMarks,
          weight: config.weight,
          term: config.term,
          sessionId: config.sessionId,
          releaseDate: config.releaseDate ? new Date(config.releaseDate).toISOString() : null,
          status: targetStatus,
          remarks: r.remarks || undefined,
        }));

      if (gradesToSubmit.length === 0) {
        throw new Error('No student scores have been entered to save');
      }

      return gradeService.bulkCreateGrades(schoolId, gradesToSubmit);
    },
    onSuccess: (_, targetStatus) => {
      toast.success(
        targetStatus === 'PUBLISHED'
          ? 'Marks published and applied to grade sheets successfully!'
          : 'Draft marks saved successfully!'
      );
      queryClient.invalidateQueries({ queryKey: ['admin-grades'] });
      queryClient.invalidateQueries({ queryKey: ['offline-grades-history'] });
      queryClient.invalidateQueries({ queryKey: ['gradeHub'] });
      onSavedSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to save marks';
      toast.error(msg);
    },
  });

  // Calculate live statistics
  const stats = useMemo(() => {
    const totalStudents = roster.length;
    const graded = roster.filter((r) => r.score !== '' && r.score !== null && r.score !== undefined);
    const gradedCount = graded.length;
    const totalScore = graded.reduce((sum, r) => sum + Number(r.score || 0), 0);
    const averageScore = gradedCount > 0 ? Number((totalScore / gradedCount).toFixed(1)) : 0;
    const passThreshold = config.maxMarks * 0.5;
    const passCount = graded.filter((r) => Number(r.score) >= passThreshold).length;

    return {
      totalStudents,
      gradedCount,
      averageScore,
      passCount,
    };
  }, [roster, config.maxMarks]);

  // CSV Import Modal State
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  // OCR Scan Modal State
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);

  // Apply imported scores from CSV or OCR scanner
  const handleImportScores = useCallback(
    (scoresMap: Record<string, { score: number; remarks?: string }>) => {
      let appliedCount = 0;
      setRoster((prev) =>
        prev.map((item) => {
          const match = scoresMap[item.studentId] || scoresMap[item.studentCode];
          if (match !== undefined) {
            appliedCount++;
            const clamped = Math.max(0, Math.min(config.maxMarks, match.score));
            return {
              ...item,
              score: clamped,
              remarks: match.remarks || item.remarks,
            };
          }
          return item;
        })
      );
      toast.success(`Imported marks for ${appliedCount} students`);
    },
    [config.maxMarks]
  );

  // Export handlers
  const handleExportCSV = useCallback(() => {
    if (roster.length === 0) {
      toast.warn('No roster to export');
      return;
    }
    const headers = ['Student Name', 'Student Code / Reg No', `Score (Max ${config.maxMarks})`, 'Remarks'];
    const rows = roster.map((s) => [
      s.studentName,
      s.studentCode,
      s.score !== '' ? s.score : '',
      s.remarks || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${config.className || 'Class'}_${config.subject}_${config.category}_Marksheet.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded CSV marksheet');
  }, [roster, config]);

  const handleExportExcel = useCallback(() => {
    if (roster.length === 0) {
      toast.warn('No roster to export');
      return;
    }
    const headers = ['Student Name', 'Student Code / Reg No', `Score (Max: ${config.maxMarks})`, 'Remarks'];
    const rows = roster.map((s) => [
      s.studentName,
      s.studentCode,
      s.score !== '' ? Number(s.score) : '',
      s.remarks || '',
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 18 }, { wch: 30 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Marksheet');
    XLSX.writeFile(
      workbook,
      `${config.className || 'Class'}_${config.subject}_${config.category}_Marksheet.xlsx`
    );
    toast.success('Downloaded Excel marksheet');
  }, [roster, config]);

  const handleExportPDF = useCallback(() => {
    if (roster.length === 0) {
      toast.warn('No roster to export');
      return;
    }

    const headers = ['#', 'Student Name', 'Reg No / Code', 'Department', `Score / ${config.maxMarks}`, 'Grade', 'Remarks'];
    const body = roster.map((s, index) => {
      const percentage = s.score !== '' ? Math.round((Number(s.score) / config.maxMarks) * 100) : null;
      const gradePill = percentage !== null ? computeGradePill(percentage, activeGradingSystem) : null;
      return [
        String(index + 1),
        s.studentName,
        s.studentCode || '-',
        s.departmentName || '-',
        s.score !== '' ? `${s.score}` : '-',
        gradePill?.label || '-',
        s.remarks || '-',
      ];
    });

    generatePDF({
      title: `${config.assessmentType} Marksheet`,
      filename: `${config.className || 'Class'}_${config.subject}_${config.category}_Marksheet.pdf`,
      schoolProfile,
      orientation: 'portrait',
      metaData: [
        { label: 'Class Cohort', value: config.className || 'Class' },
        { label: 'Subject Curriculum', value: config.subject },
        { label: 'Assessment Category', value: config.category },
        { label: 'Max Marks', value: String(config.maxMarks) },
        { label: 'Term', value: config.term },
        { label: 'Session', value: config.sessionName || '' },
      ],
      tableHeaders: [headers],
      tableData: body,
    });
    toast.success('Generated PDF marksheet');
  }, [roster, config, activeGradingSystem, schoolProfile]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[96vw] max-w-7xl 2xl:max-w-[1500px] h-[92vh] max-h-[95vh] p-0 flex flex-col bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden">
        {/* Hidden Accessibility Header */}
        <DialogHeader className="sr-only">
          <DialogTitle>Record Offline Assessment Scores</DialogTitle>
          <DialogDescription>
            Enter and manage paper assessment scores, CA, quizzes, and exams for student cohorts.
          </DialogDescription>
        </DialogHeader>

        {/* 1. Modal Top Bar */}
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`size-10 rounded-xl flex items-center justify-center ${
                isTeacher
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {initialRecord ? 'Edit Offline Assessment Record' : 'Record Offline Assessment Marks'}
                </h2>
                {config.category && (
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isTeacher
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    {config.category}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seamless mark entry, optical scan import, and grade sheet publishing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 font-bold text-xs sm:text-sm shadow-xs cursor-pointer transition-colors"
            >
              <X size={15} className="mr-1.5 text-slate-500 dark:text-slate-400" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => saveMutation.mutate('DRAFT')}
              disabled={saveMutation.isPending || !config.classId}
              variant="outline"
              className="rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              {saveMutation.isPending ? (
                <Loader2 size={16} className="animate-spin mr-1.5" />
              ) : (
                <Save size={16} className="mr-1.5" />
              )}
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => saveMutation.mutate('PUBLISHED')}
              disabled={saveMutation.isPending || !config.classId}
              className={`rounded-xl font-bold shadow-md text-white ${
                isTeacher
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
              }`}
            >
              {saveMutation.isPending ? (
                <Loader2 size={16} className="animate-spin mr-1.5" />
              ) : (
                <CheckCircle2 size={16} className="mr-1.5" />
              )}
              Publish Marks
            </Button>
          </div>
        </div>

        {/* 2. Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Header Controls (Class, Department, Subject, Category, Max Marks, Actions) */}
          <OfflineGradesHeader
            config={config}
            onChangeConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
            classes={classes}
            departments={availableDepartments}
            subjects={classSubjects}
            sessions={sessions}
            isTeacher={isTeacher}
            isLoadingRoster={isLoadingClassDetails || isLoadingGrades}
            isLoadingSubjects={isLoadingTeacherSubjects || isLoadingClassDetails}
            isSaving={saveMutation.isPending}
            onSave={(status) => saveMutation.mutate(status)}
            onOpenCSVModal={() => setIsCSVModalOpen(true)}
            onOpenOCRModal={() => setIsOCRModalOpen(true)}
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onResetScores={handleClearAll}
          />

          {/* Quick Stats Banner */}
          {config.classId && (
            <OfflineGradesStats
              totalStudents={stats.totalStudents}
              gradedCount={stats.gradedCount}
              averageScore={stats.averageScore}
              maxMarks={config.maxMarks}
              passCount={stats.passCount}
              isTeacher={isTeacher}
            />
          )}

          {/* Roster Entry Views */}
          {!config.classId ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center">
              <div
                className={`size-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
                  isTeacher
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600'
                }`}
              >
                <AlertCircle size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Select a Class Cohort to Begin
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Please pick a class and curriculum subject in the controls above to load the student roster and enter physical marks.
              </p>
            </div>
          ) : isLoadingClassDetails ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <Loader2 size={32} className="animate-spin text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Loading enrolled student cohort...
              </p>
            </div>
          ) : roster.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <div className="size-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center mb-3">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                No Students Found in Roster
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                There are no students enrolled in this class matching the selected department filter.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Spreadsheet */}
              <div className="hidden md:block">
                <RosterSpreadsheetView
                  roster={roster}
                  maxMarks={config.maxMarks}
                  gradingSystem={activeGradingSystem}
                  isTeacher={isTeacher}
                  onUpdateScore={handleUpdateScore}
                  onUpdateRemarks={handleUpdateRemarks}
                  onBatchFill={handleBatchFill}
                  onClearAll={handleClearAll}
                />
              </div>

              {/* Mobile Card List */}
              <div className="block md:hidden">
                <MobileRosterCardView
                  roster={roster}
                  maxMarks={config.maxMarks}
                  gradingSystem={activeGradingSystem}
                  isTeacher={isTeacher}
                  onUpdateScore={handleUpdateScore}
                  onUpdateRemarks={handleUpdateRemarks}
                  isSaving={saveMutation.isPending}
                  onSave={(status) => saveMutation.mutate(status)}
                />
              </div>
            </>
          )}
        </div>

        {/* CSV / Excel Import Modal */}
        {isCSVModalOpen && (
          <OfflineGradesCSVModal
            isOpen={isCSVModalOpen}
            onClose={() => setIsCSVModalOpen(false)}
            classNameLabel={config.className}
            subject={config.subject}
            category={config.category}
            maxMarks={config.maxMarks}
            roster={roster}
            isTeacher={isTeacher}
            onImportScores={handleImportScores}
          />
        )}

        {/* AI Vision OCR Modal */}
        {isOCRModalOpen && (
          <OfflineGradesOCRModal
            isOpen={isOCRModalOpen}
            onClose={() => setIsOCRModalOpen(false)}
            schoolId={schoolId}
            maxMarks={config.maxMarks}
            roster={roster}
            isTeacher={isTeacher}
            onImportScores={handleImportScores}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}