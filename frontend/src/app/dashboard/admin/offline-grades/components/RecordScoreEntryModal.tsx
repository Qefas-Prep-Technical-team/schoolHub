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
  Upload,
  Camera,
  RotateCcw,
  Loader2,
  Layers,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const EMPTY_ARRAY: any[] = [];
import { useSingleClass } from '@/lib/api/hooks/useClasses';
import { useSchoolDepartments, useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useTeacherSubjects } from '@/lib/api/hooks/useTeacher';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { gradeService } from '@/lib/api/services/gradeService';
import { toast } from 'react-toastify';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
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

interface RecordScoreEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  gradingSystem?: any[];
  classes: any[];
  sessions: any[];
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

  // If teacher, fetch subjects assigned to this teacher
  const { data: teacherSubjectsData, isLoading: isLoadingTeacherSubjects } = useTeacherSubjects(
    isTeacher ? schoolId : undefined
  );

  // 1. Auto-select current active session and term
  const currentSession = useMemo(() => {
    return sessions.find((s: any) => s.isCurrent === true || s.isActive === true || s.status === 'ACTIVE') || sessions[0];
  }, [sessions]);

  const currentTerm = useMemo((): 'FIRST' | 'SECOND' | 'THIRD' => {
    const raw = currentSession?.currentTerm || currentSession?.term;
    if (!raw) return 'FIRST';
    const s = String(raw).toUpperCase().trim();
    if (s.includes('SECOND') || s === '2') return 'SECOND';
    if (s.includes('THIRD') || s === '3') return 'THIRD';
    return 'FIRST';
  }, [currentSession]);

  // 2. DO NOT auto-select class unless explicit initialRecord or defaultClassId is provided
  const activeClassId = initialRecord?.classId || defaultClassId || '';
  const initialClassObj = activeClassId ? classes.find(c => c.id === activeClassId) : null;
  const activeClassName = initialRecord?.className || (initialClassObj ? `${initialClassObj.name} ${initialClassObj.section || ''}`.trim() : '');

  const initialCat: OfflineAssessmentCategory = initialRecord?.category || defaultCategory || 'CA';
  const initialDefaultMax = initialRecord?.maxMarks || defaultMaxMarks || (initialCat === 'CA' ? 20 : (initialCat === 'QUIZ' ? 10 : (initialCat === 'MIDTERM' ? 40 : 100)));
  const initialDefaultTitle = 
    initialCat === 'EXAM' ? 'Terminal Exam 1' :
    initialCat === 'ASSIGNMENT' ? 'Physical Assignment 1' :
    initialCat === 'QUIZ' ? 'Quiz 1' :
    initialCat === 'MIDTERM' ? 'Mid-Term Test' :
    'Continuous Assessment 1';

  // Active configuration (classId is strictly empty if not passed via initialRecord or defaultClassId)
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
    releaseDate: initialRecord?.releaseDate ? new Date(initialRecord.releaseDate).toISOString().slice(0, 16) : '',
    status: initialRecord?.status || 'DRAFT',
  });

  // Track open state and record identity to prevent redundant state resets
  const prevModalStateRef = useRef<{ isOpen: boolean; recordId?: string; classId?: string }>({
    isOpen: false,
    recordId: undefined,
    classId: undefined
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
        classId: defaultClassId
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
          releaseDate: initialRecord.releaseDate ? new Date(initialRecord.releaseDate).toISOString().slice(0, 16) : '',
          status: initialRecord.status,
        });
      } else {
        const cat: OfflineAssessmentCategory = defaultCategory || 'CA';
        const defaultMax = defaultMaxMarks || (cat === 'CA' ? 20 : (cat === 'QUIZ' ? 10 : (cat === 'MIDTERM' ? 40 : 100)));
        const targetClass = defaultClassId ? classes.find(c => c.id === defaultClassId) : null;

        setConfig({
          classId: defaultClassId || '',
          className: targetClass?.name ? `${targetClass.name} ${targetClass.section || ''}`.trim() : '',
          departmentId: 'ALL',
          departmentName: undefined,
          subject: defaultSubject || '',
          category: cat,
          assessmentType: 
            cat === 'EXAM' ? 'Terminal Exam 1' :
            cat === 'ASSIGNMENT' ? 'Physical Assignment 1' :
            cat === 'QUIZ' ? 'Quiz 1' :
            cat === 'MIDTERM' ? 'Mid-Term Test' :
            'Continuous Assessment 1',
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
  }, [isOpen, initialRecord?.id, defaultCategory, defaultClassId, defaultSubject, defaultMaxMarks]);

  // Fetch school departments (staleTime 10min per AGENTS.md rule 2.1)
  const { data: schoolDepartmentsData } = useSchoolDepartments(schoolId);
  const schoolDepartments = schoolDepartmentsData || EMPTY_ARRAY;

  // Fetch school profile for grading system configuration
  const { data: schoolProfile } = useSchoolProfile(schoolId);
  const activeGradingSystem = gradingSystem || schoolProfile?.gradingSystem;

  // Fetch class details (students roster & subjects)
  const { data: classDetails, isLoading: isLoadingClassDetails } = useSingleClass(config.classId);

  // Available departments for the selected class cohort
  const availableDepartments = useMemo(() => {
    if (!config.classId) return [];
    const list: { id: string; name: string; code?: string }[] = [];
    if (classDetails?.departments && classDetails.departments.length > 0) {
      for (const cd of classDetails.departments) {
        const dept = cd.department || cd;
        if (dept?.id && !list.some(d => d.id === dept.id)) {
          list.push({ id: dept.id, name: dept.name, code: dept.code });
        }
      }
    }
    if (list.length > 0) return list;
    if (Array.isArray(schoolDepartments) && schoolDepartments.length > 0) {
      return schoolDepartments.map((d: any) => ({ id: d.id, name: d.name, code: d.code }));
    }
    return [];
  }, [config.classId, classDetails?.departments, schoolDepartments]);

  // All subjects from class with their department associations
  const rawClassSubjects = useMemo((): { id?: string; name: string; deptIds: string[] }[] => {
    if (!classDetails?.subjects) return [];
    return classDetails.subjects.map((cs: any) => {
      const sub = cs.subject || cs;
      const name = typeof sub === 'string' ? sub : (sub?.name || '');
      const departments = sub?.departments || [];
      const deptIds = departments.map((d: any) => d.departmentId || d.department?.id || d.id).filter(Boolean) as string[];
      return {
        id: sub?.id,
        name,
        deptIds,
      };
    }).filter((s: { id?: string; name: string; deptIds: string[] }) => !!s.name);
  }, [classDetails]);

  // Class subjects filtered by teacher assignment if logged in as a teacher
  const allClassSubjects = useMemo((): { id?: string; name: string; deptIds: string[] }[] => {
    if (!isTeacher) return rawClassSubjects;

    const teacherSubs = Array.isArray(teacherSubjectsData) ? teacherSubjectsData : [];
    const assignedIdSet = new Set(teacherSubs.map((s: any) => s.id));
    const assignedNameSet = new Set(teacherSubs.map((s: any) => (s.name || '').trim().toLowerCase()));

    // Filter class subjects to only those assigned to this teacher
    const matchedClassSubjects = rawClassSubjects.filter((s) => {
      if (s.id && assignedIdSet.has(s.id)) return true;
      if (s.name && assignedNameSet.has(s.name.trim().toLowerCase())) return true;
      return false;
    });

    if (matchedClassSubjects.length > 0) {
      return matchedClassSubjects;
    }

    // Fallback: If class details has no explicit subjects configured, but teacher has assigned subjects,
    // expose the teacher's assigned subjects directly so they can record grades
    if (rawClassSubjects.length === 0 && teacherSubs.length > 0) {
      return teacherSubs.map((s: any) => {
        const departments = s.departments || [];
        const deptIds = departments.map((d: any) => d.departmentId || d.department?.id || d.id).filter(Boolean) as string[];
        return {
          id: s.id,
          name: s.name,
          deptIds,
        };
      });
    }

    return [];
  }, [rawClassSubjects, isTeacher, teacherSubjectsData]);

  // Filter subjects based on selected Target Department
  const classSubjects = useMemo((): string[] => {
    if (!config.departmentId || config.departmentId === 'ALL') {
      return allClassSubjects.map((s) => s.name);
    }
    // Subjects belonging to this department OR direct/core class subjects (empty deptIds)
    const matched = allClassSubjects.filter(
      (s) => s.deptIds.length === 0 || s.deptIds.includes(config.departmentId!)
    );
    return (matched.length > 0 ? matched : allClassSubjects).map((s) => s.name);
  }, [allClassSubjects, config.departmentId]);

  const classSubjectsKey = useMemo(() => classSubjects.join(','), [classSubjects]);

  // When class loads its subjects, auto-select the first subject if none or invalid is chosen
  useEffect(() => {
    if (!config.classId || classSubjects.length === 0) return;
    setConfig(prev => {
      if (defaultSubject && classSubjects.includes(defaultSubject) && (!prev.subject || prev.subject !== defaultSubject)) {
        return { ...prev, subject: defaultSubject };
      }
      if (!prev.subject || !classSubjects.includes(prev.subject)) {
        return { ...prev, subject: classSubjects[0] };
      }
      return prev;
    });
  }, [config.classId, classSubjectsKey, defaultSubject]);

  // Determine all department IDs associated with the currently chosen subject
  const subjectDepartmentIds = useMemo((): string[] => {
    if (!config.subject) return [];
    const targetName = config.subject.trim().toLowerCase();
    const matched = new Set<string>();

    // 1. From allClassSubjects
    const foundSub = allClassSubjects.find((s) => s.name.trim().toLowerCase() === targetName);
    if (foundSub && foundSub.deptIds.length > 0) {
      foundSub.deptIds.forEach((id: string) => matched.add(id));
    }

    // 2. From classDetails.departments
    if (classDetails?.departments) {
      for (const cd of classDetails.departments) {
        const dept = cd.department || cd;
        if (dept?.subjects) {
          for (const ds of dept.subjects) {
            const s = ds.subject || ds;
            const sName = (s.name || '').trim().toLowerCase();
            if (sName === targetName && dept.id) {
              matched.add(dept.id);
            }
          }
        }
      }
    }

    // 3. From schoolDepartments
    if (Array.isArray(schoolDepartments)) {
      for (const dept of schoolDepartments) {
        if (dept.subjects) {
          for (const ds of dept.subjects) {
            const s = ds.subject || ds;
            const sName = (s.name || '').trim().toLowerCase();
            if (sName === targetName && dept.id) {
              matched.add(dept.id);
            }
          }
        }
      }
    }

    return Array.from(matched);
  }, [config.subject, allClassSubjects, classDetails?.departments, schoolDepartments]);

  const subjectDeptIdsKey = useMemo(() => {
    return subjectDepartmentIds.slice().sort().join(',');
  }, [subjectDepartmentIds]);

  // Association check: student is associated with the subject through direct class enrollment or matching department
  const isStudentAssociatedWithSubject = useCallback((student: any): boolean => {
    const studentDeptId = student.departmentId || student.department?.id;

    // Rule 1: If admin explicitly selected a target department in the dropdown:
    if (config.departmentId && config.departmentId !== 'ALL') {
      return studentDeptId === config.departmentId;
    }

    // Rule 2: If the chosen subject is associated with specific departments:
    if (subjectDepartmentIds.length > 0) {
      // Only students enrolled in a matching department are associated with this subject
      return !!studentDeptId && subjectDepartmentIds.includes(studentDeptId);
    }

    // Rule 3: Direct Class Subject (no department restriction, e.g. Mathematics, English Language):
    // Every student enrolled in the class cohort is associated directly!
    return true;
  }, [config.departmentId, subjectDeptIdsKey]);

  // Fetch existing grades for this combination
  const { data: existingGradesData } = useQuery({
    queryKey: ['offline-grades-modal', config.classId, config.subject, config.category, config.term, config.sessionId],
    queryFn: async () => {
      if (!config.classId || !config.subject) return [];
      const grades = await gradeService.getAdminGrades({
        classId: config.classId,
        subject: config.subject,
      });
      return grades;
    },
    enabled: !!isOpen && !!config.classId && !!config.subject,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  // Roster state
  const [roster, setRoster] = useState<OfflineStudentGradeEntry[]>([]);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);

  // Sync roster: only include students associated with the subject through direct enrollment or department
  useEffect(() => {
    if (!classDetails) {
      setRoster([]);
      return;
    }
    const enrollments = classDetails.enrollments || EMPTY_ARRAY;
    const existing = existingGradesData || EMPTY_ARRAY;

    // Filter students: must be associated with the subject/department, or already have a saved score
    const eligibleEnrollments = enrollments.filter((enr: any) => {
      const student = enr.student || enr;
      const hasExistingGrade = existing.some((g: any) => g.studentId === student.id);
      return hasExistingGrade || isStudentAssociatedWithSubject(student);
    });

    const built: OfflineStudentGradeEntry[] = eligibleEnrollments.map((enr: any) => {
      const student = enr.student || enr;
      const matchedGrade = existing.find((g: any) =>
        g.studentId === student.id &&
        (g.assessmentType === config.assessmentType || g.category === config.category)
      );
      const prefilledScore = initialScores?.[student.id];

      return {
        studentId: student.id,
        studentName: student.name || 'Unnamed Student',
        studentCode: student.studentCode || '',
        profileImage: student.profileImage || null,
        departmentId: student.departmentId || student.department?.id || null,
        departmentName: student.department?.name || null,
        score: prefilledScore !== undefined ? prefilledScore.score : (matchedGrade ? matchedGrade.score : ''),
        remarks: prefilledScore?.remarks !== undefined ? prefilledScore.remarks : (matchedGrade?.remarks || ''),
        existingGradeId: matchedGrade?.id,
        status: (matchedGrade?.status as any) || 'DRAFT',
      };
    });

    setRoster(built);
  }, [
    classDetails, 
    existingGradesData, 
    config.assessmentType, 
    config.category, 
    config.departmentId, 
    subjectDeptIdsKey,
    initialScores
  ]);

  const handleUpdateScore = (studentId: string, val: string | number) => {
    setRoster(prev => prev.map(s => s.studentId === studentId ? { ...s, score: val } : s));
  };

  const handleUpdateRemarks = (studentId: string, remarks: string) => {
    setRoster(prev => prev.map(s => s.studentId === studentId ? { ...s, remarks } : s));
  };

  const handleBatchFill = (scoreValue: number, remarks?: string) => {
    setRoster(prev => prev.map(s => ({
      ...s,
      score: scoreValue,
      remarks: remarks !== undefined ? remarks : s.remarks,
    })));
  };

  const handleClearAll = () => {
    setRoster(prev => prev.map(s => ({ ...s, score: '', remarks: '' })));
  };

  const handleImportScoresMap = (map: Record<string, { score: number; remarks?: string }>) => {
    setRoster(prev => prev.map(s => {
      const match = map[s.studentId];
      return match ? { ...s, score: match.score, remarks: match.remarks || s.remarks } : s;
    }));
  };

  // Stats
  const totalStudents = roster.length;
  const gradedList = roster.filter(s => s.score !== '' && !isNaN(Number(s.score)));
  const gradedCount = gradedList.length;
  const sumScores = gradedList.reduce((acc, s) => acc + Number(s.score), 0);
  const averageScore = gradedCount > 0 ? sumScores / gradedCount : 0;
  const passCount = gradedList.filter(s => Number(s.score) >= config.maxMarks * 0.5).length;

  // Save Mutation with comprehensive security and domain validation
  const saveMutation = useMutation({
    mutationFn: async (status: 'DRAFT' | 'PUBLISHED') => {
      // 1. School context security
      if (!schoolId || typeof schoolId !== 'string' || schoolId.trim() === '') {
        throw new Error('Security check failed: Missing or invalid school context.');
      }

      // 2. Class validation & tenant check
      if (!config.classId) {
        throw new Error('Please select a target class cohort.');
      }
      const selectedClass = classes.find(c => c.id === config.classId);
      if (!selectedClass) {
        throw new Error('Security error: The selected class cohort does not belong to your institution.');
      }

      // 3. Subject validation
      const sanitizedSubject = (config.subject || '').trim();
      if (!sanitizedSubject) {
        throw new Error('Please select or specify a subject curriculum.');
      }
      if (sanitizedSubject.length > 100) {
        throw new Error('Subject name cannot exceed 100 characters.');
      }

      if (isTeacher && teacherSubjectsData && teacherSubjectsData.length > 0) {
        const isAssigned = teacherSubjectsData.some(
          (s: any) => (s.name || '').trim().toLowerCase() === sanitizedSubject.toLowerCase()
        );
        if (!isAssigned) {
          throw new Error('You are only authorized to record grades for subjects assigned to you.');
        }
      }

      // 4. Session & Term validation
      if (!config.sessionId) {
        throw new Error('Please select an academic session.');
      }
      const validTerms = ['FIRST', 'SECOND', 'THIRD'];
      if (!validTerms.includes(config.term)) {
        throw new Error('Invalid academic term selected.');
      }

      // 5. Numerical constraints
      if (typeof config.maxMarks !== 'number' || isNaN(config.maxMarks) || config.maxMarks <= 0 || config.maxMarks > 1000) {
        throw new Error('Maximum marks must be a positive number between 1 and 1000.');
      }
      if (typeof config.weight !== 'number' || isNaN(config.weight) || config.weight <= 0 || config.weight > 10) {
        throw new Error('Weight multiplier must be between 0.1 and 10.');
      }

      const sanitizedAssessmentTitle = (config.assessmentType || config.category || 'Assessment').trim();
      if (sanitizedAssessmentTitle.length > 100) {
        throw new Error('Assessment title cannot exceed 100 characters.');
      }

      // 6. Student Scores validation
      const scoredStudents = roster.filter(s => s.score !== '' && s.score !== null && s.score !== undefined);
      if (scoredStudents.length === 0) {
        throw new Error('Please enter scores for at least one student before saving.');
      }

      for (const s of scoredStudents) {
        const numScore = Number(s.score);
        if (isNaN(numScore)) {
          throw new Error(`Invalid score format for student "${s.studentName}".`);
        }
        if (numScore < 0) {
          throw new Error(`Score for ${s.studentName} cannot be negative (${numScore}).`);
        }
        if (numScore > config.maxMarks) {
          throw new Error(`Score for ${s.studentName} (${numScore}) exceeds the maximum allowed marks (${config.maxMarks}).`);
        }
        if (s.remarks && s.remarks.length > 500) {
          throw new Error(`Remarks for ${s.studentName} exceed 500 characters limit.`);
        }
      }

      // 7. Assemble sanitized payload
      const payload = scoredStudents.map(s => ({
        studentId: s.studentId,
        schoolId,
        classId: config.classId,
        sessionId: config.sessionId,
        term: config.term as any,
        subject: sanitizedSubject,
        category: config.category,
        assessmentType: sanitizedAssessmentTitle,
        maxMarks: config.maxMarks,
        weight: Number(config.weight || 1.0),
        score: Number(s.score),
        remarks: s.remarks?.trim() ? s.remarks.trim().slice(0, 500) : undefined,
        releaseDate: config.releaseDate ? new Date(config.releaseDate).toISOString() : undefined,
        status,
      }));

      return gradeService.bulkCreateGrades(schoolId, payload);
    },
    onSuccess: (_, status) => {
      toast.success(
        status === 'PUBLISHED'
          ? 'Offline grades published successfully!'
          : 'Draft grades saved successfully.'
      );
      queryClient.invalidateQueries({ queryKey: ['offline-grades-history'] });
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      onSavedSuccess();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to save offline grades.');
    },
  });

  // Export Handlers
  const getStudentGrade = (s: OfflineStudentGradeEntry) => {
    if (s.grade) return s.grade;
    const scoreNum = s.score !== '' ? Number(s.score) : null;
    if (scoreNum !== null && config.maxMarks > 0) {
      const pct = Math.round((scoreNum / config.maxMarks) * 100);
      return computeGradePill(pct, gradingSystem).label;
    }
    return '';
  };

  const handleExportExcel = () => {
    if (!config.classId) {
      toast.error('Please select a class cohort first.');
      return;
    }
    const headers = ['#', 'Student Name', 'Student Code / Reg No', `Score (Max: ${config.maxMarks})`, 'Grade', 'Status', 'Remarks'];
    const rows = roster.map((s, idx) => [
      idx + 1,
      s.studentName,
      s.studentCode || '',
      s.score !== '' ? Number(s.score) : '',
      getStudentGrade(s),
      s.status,
      s.remarks || '',
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 22 },
      { wch: 18 },
      { wch: 10 },
      { wch: 14 },
      { wch: 30 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Marksheet');
    const safeClass = (config.className || 'Class').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeSub = (config.subject || 'Subject').replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.writeFile(workbook, `Marksheet_${safeClass}_${safeSub}_${config.category}.xlsx`);
    toast.success('Excel marksheet exported successfully.');
  };

  const handleExportCSV = () => {
    if (!config.classId) {
      toast.error('Please select a class cohort first.');
      return;
    }
    const headers = ['#', 'Student Name', 'Student Code / Reg No', `Score (Max: ${config.maxMarks})`, 'Grade', 'Status', 'Remarks'];
    const rows = roster.map((s, idx) => [
      idx + 1,
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${(s.studentCode || '').replace(/"/g, '""')}"`,
      s.score !== '' ? s.score : '',
      `"${getStudentGrade(s)}"`,
      s.status,
      `"${(s.remarks || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeClass = (config.className || 'Class').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeSub = (config.subject || 'Subject').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `Marksheet_${safeClass}_${safeSub}_${config.category}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV marksheet exported successfully.');
  };

  const handleExportPDF = () => {
    if (!config.classId) {
      toast.error('Please select a class cohort first.');
      return;
    }
    generatePDF({
      title: `Offline Marksheet — ${config.assessmentType}`,
      filename: `Marksheet_${(config.className || 'Class').replace(/[^a-zA-Z0-9_-]/g, '_')}_${config.subject}.pdf`,
      schoolProfile,
      orientation: 'portrait',
      metaData: [
        { label: 'Class Cohort', value: config.className || 'General' },
        { label: 'Subject Curriculum', value: config.subject || 'All Subjects' },
        { label: 'Assessment Category', value: config.category },
        { label: 'Maximum Marks', value: String(config.maxMarks) },
        { label: 'Term / Session', value: `${config.term} Term • ${config.sessionName || 'Current'}` },
        { label: 'Total Enrolled', value: `${totalStudents} students` },
        { label: 'Graded Count', value: `${gradedCount} (${totalStudents > 0 ? ((gradedCount / totalStudents) * 100).toFixed(0) : 0}%)` },
        { label: 'Class Average', value: `${averageScore.toFixed(1)} / ${config.maxMarks}` },
        { label: 'Pass Count', value: `${passCount} passed` },
        { label: 'Status', value: config.status },
      ],
      tableHeaders: [['#', 'Student Name', 'Code', `Score (${config.maxMarks})`, 'Grade', 'Remarks']],
      tableData: roster.map((s, idx) => [
        String(idx + 1),
        s.studentName,
        s.studentCode || '—',
        s.score !== '' ? String(s.score) : '—',
        getStudentGrade(s) || '—',
        s.remarks || '—',
      ]),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] max-w-7xl 2xl:max-w-[1500px] max-h-[94vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-xl ${isTeacher ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'} flex items-center justify-center`}>
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                  {initialRecord ? `Edit Scores: ${initialRecord.assessmentType}` : 'Record Offline Assessment Marks'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Enter student marks for physical classroom assessments, tests, and written exams.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Header Configuration */}
          <OfflineGradesHeader
            config={config}
            onChangeConfig={(updates) => setConfig(prev => ({ ...prev, ...updates }))}
            classes={classes}
            departments={availableDepartments}
            subjects={classSubjects}
            sessions={sessions}
            isTeacher={isTeacher}
            isLoadingRoster={isLoadingClassDetails}
            isLoadingSubjects={isLoadingClassDetails || (isTeacher && isLoadingTeacherSubjects)}
            isSaving={saveMutation.isPending}
            onSave={(status) => saveMutation.mutate(status)}
            onOpenCSVModal={() => setIsCSVModalOpen(true)}
            onOpenOCRModal={() => setIsOCRModalOpen(true)}
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            onExportExcel={handleExportExcel}
            onResetScores={handleClearAll}
          />

          {/* KPI Stats */}
          <OfflineGradesStats
            totalStudents={totalStudents}
            gradedCount={gradedCount}
            averageScore={averageScore}
            maxMarks={config.maxMarks}
            passCount={passCount}
            isTeacher={isTeacher}
          />

          {/* Roster Area */}
          {!config.classId ? (
            <div className="p-8 sm:p-12 text-center bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 my-4">
              <div className={`size-14 rounded-2xl ${isTeacher ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/80 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400'} border flex items-center justify-center mx-auto mb-3 shadow-sm`}>
                <Layers className="size-7" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1">
                Select a Class Cohort to Begin
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4 font-medium">
                Choose a target class from the dropdown above to load enrolled students and enter scores.
              </p>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isTeacher ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60' : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60'} text-xs font-bold border`}>
                <Sparkles size={13} />
                <span>Auto-Selected: {config.sessionName || currentSession?.name || 'Active Session'} • {config.term} Term</span>
              </div>
            </div>
          ) : isLoadingClassDetails ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 my-4">
              <Loader2 size={32} className={`animate-spin ${isTeacher ? 'text-emerald-600' : 'text-indigo-600'} mx-auto mb-2`} />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Loading student roster...</p>
              <p className="text-xs text-slate-400 mt-1">Retrieving enrolled students and subjects for this class</p>
            </div>
          ) : roster.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 my-4">
              <AlertCircle size={32} className="text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Associated Students Found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {config.departmentId && config.departmentId !== 'ALL'
                  ? `No students in the selected department (${config.departmentName || 'Department'}) are associated with this class cohort.`
                  : `No students in this class cohort are associated with ${config.subject || 'this subject'} through direct class enrollment or matching department.`}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop View */}
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

              {/* Mobile View */}
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
            </>
          )}
        </div>

        {/* CSV Modal */}
        <OfflineGradesCSVModal
          isOpen={isCSVModalOpen}
          onClose={() => setIsCSVModalOpen(false)}
          classNameLabel={config.className}
          subject={config.subject}
          category={config.category}
          maxMarks={config.maxMarks}
          roster={roster}
          isTeacher={isTeacher}
          onImportScores={handleImportScoresMap}
        />

        {/* AI OCR Modal */}
        <OfflineGradesOCRModal
          isOpen={isOCRModalOpen}
          onClose={() => setIsOCRModalOpen(false)}
          schoolId={schoolId}
          maxMarks={config.maxMarks}
          roster={roster}
          isTeacher={isTeacher}
          onImportScores={handleImportScoresMap}
        />
      </DialogContent>
    </Dialog>
  );
}
