'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download,
  Plus,
  Search,
  FilterX,
  LayoutGrid,
  List,
  FileSpreadsheet,
  Users,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Clock,
  GraduationCap,
  Building2,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import {
  useClassSubjectResults,
  useStudentTermResults,
} from '@/lib/api/hooks/useRecords';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useSchoolSubjects, useSchoolDepartments } from '@/lib/api/hooks/useSchool';
import { useTeacherSubjects } from '@/lib/api/hooks/useTeacher';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';
import { TeacherPagination } from '@/app/dashboard/teacher/components/TeacherPagination';

import { RecordsStatsCards } from './components/RecordsStatsCards';
import { SubjectResultCard, SubjectResultItem } from './components/SubjectResultCard';
import { StudentResultCard, StudentResultItem } from './components/StudentResultCard';
import { RecordsSkeleton } from './components/RecordsSkeleton';
import { CreateResultDialog } from './components/CreateResultDialog';

const PAGE_SIZE = 9;

export default function RecordsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'subject' | 'student'>('subject');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [assignmentScope, setAssignmentScope] = useState<'all' | 'assigned'>('assigned');

  // Pagination States
  const [subjectPage, setSubjectPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);

  // User & School Context
  const effectiveSchoolId =
    (user as { schoolId?: string; school?: { id: string }; schools?: { schoolId: string }[]; tenantId?: string })?.schoolId ||
    (user as { school?: { id: string } })?.school?.id ||
    user?.schools?.[0]?.schoolId ||
    (user as { tenantId?: string })?.tenantId ||
    '';

  // Dropdown Data Hooks
  const { data: classesData, isLoading: isLoadingClasses } = useClasses(effectiveSchoolId);
  const { data: sessionsData, isLoading: isLoadingSessions } = useSessions(effectiveSchoolId);
  const { data: subjectsData, isLoading: isLoadingSubjectsList } = useSchoolSubjects(effectiveSchoolId);
  const { data: departmentsData, isLoading: isLoadingDepartments } = useSchoolDepartments(effectiveSchoolId);
  const { data: teacherSubjectsData, isLoading: isLoadingTeacherSubjects } = useTeacherSubjects(effectiveSchoolId);

  const classes = useMemo(() => {
    if (Array.isArray(classesData)) return classesData;
    return (classesData as { data?: { id: string; name: string }[] })?.data || [];
  }, [classesData]);

  const sessions = useMemo(() => {
    if (Array.isArray(sessionsData)) return sessionsData;
    return (sessionsData as { data?: { id: string; name: string }[] })?.data || [];
  }, [sessionsData]);

  const subjects = useMemo(() => {
    if (Array.isArray(subjectsData)) return subjectsData;
    return (subjectsData as { data?: { id: string; name: string }[] })?.data || [];
  }, [subjectsData]);

  const departments = useMemo(() => {
    if (Array.isArray(departmentsData)) return departmentsData;
    return (departmentsData as { data?: { id: string; name: string }[] })?.data || [];
  }, [departmentsData]);

  const teacherAssignedSubjects = useMemo(() => {
    return Array.isArray(teacherSubjectsData) ? teacherSubjectsData : [];
  }, [teacherSubjectsData]);

  const assignedSubjectIdSet = useMemo(() => {
    return new Set(teacherAssignedSubjects.map((s: any) => s.id));
  }, [teacherAssignedSubjects]);

  const assignedSubjectNameSet = useMemo(() => {
    return new Set(teacherAssignedSubjects.map((s: any) => (s.name || '').trim().toLowerCase()));
  }, [teacherAssignedSubjects]);

  // Extract unique departments associated with the teacher's assigned subjects
  const teacherAssignedDepartments = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    teacherAssignedSubjects.forEach((subj: any) => {
      (subj.departments || []).forEach((dRel: any) => {
        const dept = dRel.department || dRel;
        if (dept?.id && !map.has(dept.id)) {
          map.set(dept.id, { id: dept.id, name: dept.name });
        }
      });
    });
    return Array.from(map.values());
  }, [teacherAssignedSubjects]);

  const isRecordAssignedToTeacher = React.useCallback(
    (res: SubjectResultItem) => {
      if (res.createdById && res.createdById === user?.id) return true;
      if (res.subjectId && assignedSubjectIdSet.has(res.subjectId)) return true;
      const name = (res.subject?.name || res.name || '').trim().toLowerCase();
      if (name && assignedSubjectNameSet.has(name)) return true;
      return false;
    },
    [user?.id, assignedSubjectIdSet, assignedSubjectNameSet]
  );

  // Results Query Hooks
  const { data: rawSubjectResults, isLoading: isLoadingSubjects } = useClassSubjectResults();
  const { data: rawStudentResults, isLoading: isLoadingStudents } = useStudentTermResults();

  const subjectResults: SubjectResultItem[] = useMemo(() => {
    return Array.isArray(rawSubjectResults) ? rawSubjectResults : [];
  }, [rawSubjectResults]);

  const studentResults: StudentResultItem[] = useMemo(() => {
    return Array.isArray(rawStudentResults) ? rawStudentResults : [];
  }, [rawStudentResults]);

  // Mobile layout initialization: default to 'grid' on mobile devices
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);

  // Reset page when tab or filters change
  useEffect(() => {
    setSubjectPage(1);
    setStudentPage(1);
  }, [activeTab, searchQuery, selectedClass, selectedSession, selectedTerm, selectedStatus]);

  // Dynamic Summary Stats Computations
  const currentDatasetCount = activeTab === 'student' ? studentResults.length : subjectResults.length;

  const completedRecords = useMemo(() => {
    if (activeTab === 'student') {
      return studentResults.filter((r) => r.status === 'PUBLISHED').length;
    }
    return subjectResults.filter((r) => r.status === 'PUBLISHED').length;
  }, [activeTab, studentResults, subjectResults]);

  const pendingRecords = currentDatasetCount - completedRecords;
  const completionRate = currentDatasetCount > 0 ? Math.round((completedRecords / currentDatasetCount) * 100) : 0;

  const averageScore = useMemo(() => {
    const validScores = studentResults
      .filter((r) => r.averageScore != null && typeof r.averageScore === 'number')
      .map((r) => r.averageScore as number);
    if (validScores.length === 0) return '0.0';
    return (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1);
  }, [studentResults]);

  // Filtered Subject Results
  const filteredSubjectResults = useMemo(() => {
    return subjectResults.filter((item) => {
      // Assignment Scope Filter: Show only teacher's assigned subjects when 'assigned' is active
      if (assignmentScope === 'assigned' && !isRecordAssignedToTeacher(item)) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const subjectName = (item.subject?.name || item.name || '').toLowerCase();
        const className = (item.class?.name || '').toLowerCase();
        const sessionName = (item.session?.name || '').toLowerCase();
        const departmentName = (
          item.department?.name ||
          item.subject?.departments?.[0]?.department?.name ||
          ''
        ).toLowerCase();
        if (
          !subjectName.includes(query) &&
          !className.includes(query) &&
          !sessionName.includes(query) &&
          !departmentName.includes(query)
        ) {
          return false;
        }
      }

      if (selectedClass && item.classId !== selectedClass) return false;
      if (selectedSession && item.sessionId !== selectedSession) return false;
      if (selectedTerm && item.term !== selectedTerm) return false;
      if (selectedStatus && item.status !== selectedStatus) return false;

      // Department Filter
      if (selectedDepartment) {
        const itemDeptId =
          item.departmentId ||
          item.department?.id ||
          item.subject?.departments?.[0]?.departmentId ||
          item.subject?.departments?.[0]?.department?.id;
        if (itemDeptId !== selectedDepartment) return false;
      }

      return true;
    });
  }, [
    subjectResults,
    assignmentScope,
    isRecordAssignedToTeacher,
    searchQuery,
    selectedClass,
    selectedSession,
    selectedTerm,
    selectedStatus,
    selectedDepartment,
  ]);

  // Filtered Student Results
  const filteredStudentResults = useMemo(() => {
    return studentResults.filter((item) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const studentName = (item.student?.name || '').toLowerCase();
        const className = (item.class?.name || '').toLowerCase();
        const sessionName = (item.session?.name || '').toLowerCase();
        if (!studentName.includes(query) && !className.includes(query) && !sessionName.includes(query)) {
          return false;
        }
      }
      if (selectedClass && item.classId !== selectedClass) return false;
      if (selectedSession && item.sessionId !== selectedSession) return false;
      if (selectedTerm && item.term !== selectedTerm) return false;
      if (selectedStatus && item.status !== selectedStatus) return false;
      return true;
    });
  }, [studentResults, searchQuery, selectedClass, selectedSession, selectedTerm, selectedStatus]);

  // Active Filter Detection
  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedClass ||
    selectedSession ||
    selectedTerm ||
    selectedStatus ||
    selectedDepartment ||
    assignmentScope !== 'assigned'
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedClass('');
    setSelectedSession('');
    setSelectedTerm('');
    setSelectedStatus('');
    setSelectedDepartment('');
    setAssignmentScope('assigned');
  };

  // Paginated Slices
  const paginatedSubjectResults = useMemo(() => {
    const start = (subjectPage - 1) * PAGE_SIZE;
    return filteredSubjectResults.slice(start, start + PAGE_SIZE);
  }, [filteredSubjectResults, subjectPage]);

  const paginatedStudentResults = useMemo(() => {
    const start = (studentPage - 1) * PAGE_SIZE;
    return filteredStudentResults.slice(start, start + PAGE_SIZE);
  }, [filteredStudentResults, studentPage]);

  const subjectTotalPages = Math.ceil(filteredSubjectResults.length / PAGE_SIZE) || 1;
  const studentTotalPages = Math.ceil(filteredStudentResults.length / PAGE_SIZE) || 1;

  if (!mounted) return null;

  return (
    <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 dark:bg-black font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-slate-200/60 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Final Results
            </h1>
            <HeaderTooltip
              content="The official grading repository for termly student assessments and end-of-term score compilation. Configure score weighting, sync marks from exams and assignments, and publish official academic result sheets."
              size={15}
            />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage subject compilations, publish termly report cards, and track academic averages.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => toast.info('Exporting report summary...')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-11 px-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Data</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPopupOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-11 px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Final Result</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <RecordsStatsCards
        totalRecords={currentDatasetCount}
        completedRecords={completedRecords}
        pendingRecords={pendingRecords}
        completionRate={completionRate}
        averageScore={averageScore}
        activeTab={activeTab}
      />

      {/* Directory & Content Card */}
      <div className="bg-white dark:bg-emerald-950/20 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-emerald-800/40 p-4 sm:p-6 shadow-sm space-y-5">
        {/* Top Controls: Tabs, Scope Switcher & View Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-100 dark:border-emerald-800/30 flex-wrap">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab('subject')}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'subject'
                    ? 'bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-emerald-700/50'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Subject Final Results</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  {subjectResults.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'student'
                    ? 'bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-emerald-700/50'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4 text-blue-500" />
                <span>Students Final Results</span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  {studentResults.length}
                </span>
              </button>
            </div>

            {/* Scope Filter for Subject Results: Assigned vs All */}
            {activeTab === 'subject' && (
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setAssignmentScope('assigned')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    assignmentScope === 'assigned'
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  My Assigned Subjects
                </button>
                <button
                  type="button"
                  onClick={() => setAssignmentScope('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    assignmentScope === 'all'
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  All School Records
                </button>
              </div>
            )}
          </div>

          {/* Directory Title & View Switcher */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
                View Mode
              </span>
              <HeaderTooltip
                content="Toggle between compact Grid Cards (recommended on mobile screens) or structured Tabular view."
                size={12}
              />
            </div>
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-emerald-700/50'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/60 dark:border-emerald-700/50'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                aria-label="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'subject'
                  ? 'Search by subject name, class, department, or session...'
                  : 'Search by student name, class, or session...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
            />
          </div>

          {/* Dynamic Dropdowns Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
            >
              <option value="">All Departments</option>
              {(teacherAssignedDepartments.length > 0 ? teacherAssignedDepartments : departments).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Session Filter */}
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
            >
              <option value="">All Sessions</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Term Filter */}
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer"
            >
              <option value="">All Terms</option>
              <option value="FIRST">First Term</option>
              <option value="SECOND">Second Term</option>
              <option value="THIRD">Third Term</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl px-2.5 sm:px-3 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer col-span-2 sm:col-span-1"
            >
              <option value="">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="h-11 px-3 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200/60 dark:border-red-900/40 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs sm:text-sm font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
            >
              <FilterX className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Content Area: Subject Final Results */}
        {activeTab === 'subject' && (
          <div>
            {isLoadingSubjects ? (
              <RecordsSkeleton viewMode={viewMode} />
            ) : filteredSubjectResults.length === 0 ? (
              <div className="py-12 sm:py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black/30 p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200/60 dark:border-emerald-700/40">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  No Subject Final Results Found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {hasActiveFilters
                    ? 'No records match your active search filters. Try clearing or refining your criteria.'
                    : assignmentScope === 'assigned'
                    ? 'No final results found for your assigned subjects. Click "Add Final Result" to create one or switch to "All School Records".'
                    : 'Start by creating your first subject final result sheet to compile scores.'}
                </p>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsPopupOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-sm shadow-emerald-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Result Sheet
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                {paginatedSubjectResults.map((item) => (
                  <SubjectResultCard
                    key={item.id}
                    item={item}
                    currentUserId={user?.id}
                    isAssigned={isRecordAssignedToTeacher(item)}
                  />
                ))}
              </div>
            ) : (
              /* Table View */
              <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-zinc-800 text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                        <th className="px-5 py-3.5 w-12">#</th>
                        <th className="px-4 py-3.5">Session & Term</th>
                        <th className="px-4 py-3.5">Class</th>
                        <th className="px-4 py-3.5">Department</th>
                        <th className="px-4 py-3.5">Subject</th>
                        <th className="px-4 py-3.5">Date Saved</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium text-slate-600 dark:text-slate-300">
                      {paginatedSubjectResults.map((res, index) => {
                        const globalIdx = (subjectPage - 1) * PAGE_SIZE + index + 1;
                        const isOwner = res.createdById === user?.id;
                        const isAssigned = isRecordAssignedToTeacher(res);
                        const canEdit = isAssigned || isOwner;
                        const isPublished = res.status === 'PUBLISHED';
                        const deptName =
                          res.department?.name ||
                          res.subject?.departments?.[0]?.department?.name;

                        return (
                          <tr
                            key={res.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors group"
                          >
                            <td className="px-5 py-4 text-xs text-slate-400 font-bold">{globalIdx}</td>
                            <td className="px-4 py-4">
                              <span className="block font-bold text-slate-900 dark:text-slate-100">
                                {res.session?.name || 'Session'}
                              </span>
                              <span className="text-xs text-slate-400">{res.term} Term</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-emerald-900/30 text-slate-800 dark:text-emerald-300">
                                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                                {res.class?.name || 'Assigned Class'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {deptName ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
                                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                                  {deptName}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 italic">None</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-slate-100">
                                  {res.subject?.name || res.name || 'Subject'}
                                </span>
                                {canEdit ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                    Assigned
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400">
                                    <Lock className="w-2.5 h-2.5" /> Read Only
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-xs text-slate-500">
                              {new Date(res.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                  isPublished
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40'
                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40'
                                }`}
                              >
                                {isPublished ? (
                                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Clock className="w-3 h-3 text-amber-500" />
                                )}
                                {res.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    canEdit
                                      ? `/dashboard/teacher/records/new?id=${res.id}`
                                      : `/dashboard/teacher/records/preview?id=${res.id}`
                                  )
                                }
                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm active:scale-95 ${
                                  canEdit
                                    ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-500 text-white hover:bg-emerald-600'
                                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                }`}
                              >
                                <span>{canEdit ? 'Edit Sheet' : 'Preview'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {filteredSubjectResults.length > 0 && (
              <TeacherPagination
                currentPage={subjectPage}
                totalPages={subjectTotalPages}
                totalItems={filteredSubjectResults.length}
                itemsPerPage={PAGE_SIZE}
                onPageChange={setSubjectPage}
                itemName="subject results"
              />
            )}
          </div>
        )}

        {/* Content Area: Students Final Results */}
        {activeTab === 'student' && (
          <div>
            {isLoadingStudents ? (
              <RecordsSkeleton viewMode={viewMode} />
            ) : filteredStudentResults.length === 0 ? (
              <div className="py-12 sm:py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-black/30 p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200/60 dark:border-blue-700/40">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  No Student Final Results Found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {hasActiveFilters
                    ? 'No student term records match your active search filters.'
                    : 'Publish subject score sheets to compile final student results.'}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                {paginatedStudentResults.map((item) => (
                  <StudentResultCard
                    key={item.id}
                    item={item}
                    onViewReport={(s) => toast.info(`Opening report card for ${s.student?.name || 'scholar'}...`)}
                  />
                ))}
              </div>
            ) : (
              /* Table View */
              <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-zinc-800 text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                        <th className="px-5 py-3.5 w-12">#</th>
                        <th className="px-4 py-3.5">Scholar Name</th>
                        <th className="px-4 py-3.5">Class</th>
                        <th className="px-4 py-3.5">Session & Term</th>
                        <th className="px-4 py-3.5">Average</th>
                        <th className="px-4 py-3.5">Position</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium text-slate-600 dark:text-slate-300">
                      {paginatedStudentResults.map((res, index) => {
                        const globalIdx = (studentPage - 1) * PAGE_SIZE + index + 1;
                        const isPublished = res.status === 'PUBLISHED';
                        return (
                          <tr
                            key={res.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors group"
                          >
                            <td className="px-5 py-4 text-xs text-slate-400 font-bold">{globalIdx}</td>
                            <td className="px-4 py-4 font-bold text-slate-900 dark:text-slate-100">
                              {res.student?.name || 'Student Name'}
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-emerald-900/30 text-slate-800 dark:text-emerald-300">
                                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                                {res.class?.name || 'Class'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className="block font-bold text-slate-900 dark:text-slate-100">
                                {res.session?.name || 'Session'}
                              </span>
                              <span className="text-xs text-slate-400">{res.term} Term</span>
                            </td>
                            <td className="px-4 py-4 font-black text-emerald-600 dark:text-emerald-400">
                              {res.averageScore != null ? `${res.averageScore}%` : '-'}
                            </td>
                            <td className="px-4 py-4 text-xs font-bold text-slate-500">
                              {res.position ? `${res.position}` : '-'}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                  isPublished
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40'
                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40'
                                }`}
                              >
                                {isPublished ? (
                                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Clock className="w-3 h-3 text-amber-500" />
                                )}
                                {res.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  toast.info(`Opening report card for ${res.student?.name || 'scholar'}...`)
                                }
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400 text-xs font-bold transition-all shadow-sm active:scale-95 bg-white dark:bg-zinc-900"
                              >
                                <span>View Report</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {filteredStudentResults.length > 0 && (
              <TeacherPagination
                currentPage={studentPage}
                totalPages={studentTotalPages}
                totalItems={filteredStudentResults.length}
                itemsPerPage={PAGE_SIZE}
                onPageChange={setStudentPage}
                itemName="student results"
              />
            )}
          </div>
        )}
      </div>

      {/* Add Final Result Dialog */}
      <CreateResultDialog
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        classes={classes}
        subjects={teacherAssignedSubjects}
        departments={teacherAssignedDepartments.length > 0 ? teacherAssignedDepartments : departments}
        sessions={sessions}
        isLoadingClasses={isLoadingClasses}
        isLoadingSubjects={isLoadingTeacherSubjects}
        isLoadingDepartments={isLoadingTeacherSubjects || isLoadingDepartments}
        isLoadingSessions={isLoadingSessions}
      />
    </div>
  );
}
