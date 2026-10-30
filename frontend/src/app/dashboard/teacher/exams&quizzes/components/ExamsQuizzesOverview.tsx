'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from './PageHeader';
import FilterChips from './FilterChips';
import ExamsTable, { Exam } from './ExamsTable';
import { teacherService } from '@/lib/api/services/teacherService';
import { examService } from '@/lib/api/services/examService';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { generatePDF } from '@/utils/pdfGenerator';
import { ExamsTableSkeleton } from './ExamsSkeleton';
import { Trophy, ClipboardList, Sparkles, Building2, FileText, BookOpen, LayoutGrid, List, Info, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreatePaperForm from './CreatePaperForm';
import CreateExamForm from './CreateExamForm';
import CreateAssignmentForm from './CreateAssignmentForm';
import { useRouter } from 'next/navigation';
import { TeacherPagination } from '../../components/TeacherPagination';
import { toast } from 'react-toastify';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';

export default function ExamsQuizzesOverview() {
  const [activeTab, setActiveTab] = useState<'all' | 'exams' | 'quizzes' | 'subject-papers' | 'ca' | 'assignment'>('all');
  const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
  const { user } = useAuthStore();
  const [filters, setFilters] = useState({
    class: '',
    subject: '',
    status: '',
    date: '',
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isAddPaperModalOpen, setIsAddPaperModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [createCategory, setCreateCategory] = useState<'EXAM' | 'QUIZ' | 'CA'>('EXAM');
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const queryClient = useQueryClient();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isPersonal = selectedSchoolId === user?.id;
  const category = activeTab === 'exams' ? 'EXAM' : activeTab === 'quizzes' ? 'QUIZ' : activeTab === 'ca' ? 'CA' : activeTab === 'assignment' ? 'ASSIGNMENT' : undefined;

  const filterId = (isPersonal || selectedSchoolId === 'all') ? undefined : selectedSchoolId;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => examService.deleteExam(id),
    onSuccess: () => {
      setExamToDelete(null);
      toast.success('Assessment deleted successfully.');
      setIsRefreshing(true);
      queryClient.invalidateQueries({ queryKey: ['teacher-exams'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || 'Failed to delete assessment.');
    }
  });

  const { data: classesData } = useQuery({
    queryKey: ['teacher-classes', selectedSchoolId],
    queryFn: () => teacherService.getClasses({ schoolId: filterId }),
    staleTime: 1000 * 60 * 10,
    enabled: !!user,
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['teacher-subjects', selectedSchoolId],
    queryFn: () => teacherService.getSubjects({ schoolId: filterId }),
    staleTime: 1000 * 60 * 10,
    enabled: !isPersonal && !!filterId,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['teacher-exams', selectedSchoolId, activeTab, filters.status, filters.class],
    queryFn: async () => {
      if (activeTab === 'all') {
        const [allExams, allPapers, allAssignments] = await Promise.all([
          teacherService.getExams({
            schoolId: filterId,
            status: filters.status || undefined,
            classId: filters.class || undefined,
          }).catch(() => []),
          teacherService.getSubjectPapers({
            schoolId: filterId,
          }).catch(() => []),
          teacherService.getAssignments({
            schoolId: filterId,
            status: filters.status || undefined,
            classId: filters.class || undefined,
          }).catch(() => []),
        ]);

        const taggedExams = (allExams || []).map((e: any) => ({
          ...e,
          _tabType: (e.category === 'QUIZ' ? 'quizzes' : e.category === 'CA' ? 'ca' : 'exams') as 'exams' | 'quizzes' | 'ca',
        }));
        const taggedPapers = (allPapers || []).map((p: any) => ({
          ...p,
          _tabType: 'subject-papers' as const,
          type: 'subject_paper',
        }));
        const taggedAssignments = (allAssignments || []).map((a: any) => ({
          ...a,
          _tabType: 'assignment' as const,
          type: 'assignment',
        }));

        return [...taggedExams, ...taggedPapers, ...taggedAssignments];
      }
      if (activeTab === 'subject-papers') {
        const result = await teacherService.getSubjectPapers({
          schoolId: filterId,
        });
        return (result || []).map((p: any) => ({ ...p, _tabType: 'subject-papers', type: 'subject_paper' }));
      }
      if (activeTab === 'assignment') {
        const result = await teacherService.getAssignments({
          schoolId: filterId,
          status: filters.status || undefined,
          classId: filters.class || undefined,
        });
        return (result || []).map((a: any) => ({ ...a, _tabType: 'assignment', type: 'assignment' }));
      }
      const result = await teacherService.getExams({
        schoolId: filterId,
        category,
        status: filters.status || undefined,
        classId: filters.class || undefined,
      });
      return (result || []).map((e: any) => ({
        ...e,
        _tabType: (e.category === 'QUIZ' ? 'quizzes' : e.category === 'CA' ? 'ca' : 'exams'),
      }));
    },
  });

  // Clear refresh spinner once the background refetch settles
  useEffect(() => {
    if (!isFetching) setIsRefreshing(false);
  }, [isFetching]);

  const handleCreateNew = (category: 'EXAM' | 'QUIZ' | 'CA' | 'ASSIGNMENT') => {
    if (category === 'ASSIGNMENT') {
      setIsAssignmentModalOpen(true);
    } else {
      setCreateCategory(category);
      setIsExamModalOpen(true);
    }
  };

  const handleFilterChange = (filterType: 'class' | 'subject' | 'status' | 'date', value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      class: '',
      subject: '',
      status: '',
      date: '',
    });
    setCurrentPage(1);
  };

  const handleTabChange = (tab: 'all' | 'exams' | 'quizzes' | 'subject-papers' | 'ca' | 'assignment') => {
      setActiveTab(tab);
      setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    if (!data) return [];
    let list = [...data];

    // Filter by class client-side as well for extra precision
    if (filters.class) {
      list = list.filter(item => {
        const itemClassId = item.classId || item.class?.id;
        return itemClassId === filters.class;
      });
    }

    // Filter by subject client-side
    if (filters.subject) {
      list = list.filter(item => {
        const itemSubjectId = item.subjectId || item.subject?.id || item.subjectExamPapers?.[0]?.subjectPaper?.subjectId || item.subjectExamPapers?.[0]?.subjectPaper?.subject?.id;
        return itemSubjectId === filters.subject;
      });
    }

    // Strict assigned-subject filter for CA, quizzes, subject-papers, and assignments
    const mySubjectIds = new Set((subjectsData || []).map((s: any) => s.id || s.subjectId).filter(Boolean));
    const mySubjectNames = new Set((subjectsData || []).map((s: any) => (s.name || s.subject?.name || '').toLowerCase()).filter(Boolean));
    const hasSubjectRestriction = mySubjectIds.size > 0 || mySubjectNames.size > 0;

    if (!isPersonal && hasSubjectRestriction) {
      list = list.filter(item => {
        const effectiveType = item._tabType || (
          item.type === 'assignment' ? 'assignment' :
          item.type === 'subject_paper' ? 'subject-papers' :
          item.category === 'QUIZ' ? 'quizzes' :
          item.category === 'CA' ? 'ca' :
          'exams'
        );

        // Terminal exams can be viewed by class teachers even across multiple subjects
        if (effectiveType === 'exams') return true;

        // For CA, quizzes, subject-papers, and assignments:
        // Must belong to teacher's assigned subject OR be created by the teacher
        const isCreator = item.teacherId === user?.id || item.teacherId === (user as any)?.tenantId;
        if (isCreator) return true;

        const directSubId = item.subjectId || item.subject?.id;
        const directSubName = (item.subject?.name || (typeof item.subject === 'string' ? item.subject : '')).toLowerCase();

        if (directSubId && mySubjectIds.has(directSubId)) return true;
        if (directSubName && mySubjectNames.has(directSubName)) return true;

        // Check assignedTeachers if provided on the paper/exam
        const isAssignedDirectly = item.assignedTeachers?.some((t: any) => t.id === user?.id || t.id === (user as any)?.tenantId);
        if (isAssignedDirectly) return true;

        // Check attached papers (for CA or quiz containers)
        if (Array.isArray(item.subjectExamPapers) && item.subjectExamPapers.length > 0) {
          return item.subjectExamPapers.some((sep: any) => {
            const paper = sep.subjectPaper || sep;
            const subId = paper.subjectId || paper.subject?.id;
            const subName = (paper.subject?.name || '').toLowerCase();
            const paperCreator = paper.teacherId === user?.id || paper.teacherId === (user as any)?.tenantId;
            return (subId && mySubjectIds.has(subId)) || (subName && mySubjectNames.has(subName)) || paperCreator;
          });
        }

        return false;
      });
    }

    // Filter by date client-side
    if (filters.date) {
      const now = new Date();
      list = list.filter(item => {
        const itemDate = new Date(item.createdAt || item.startDate || now);
        const diffTime = Math.abs(now.getTime() - itemDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (filters.date === 'Last Week') return diffDays <= 7;
        if (filters.date === 'Last Month') return diffDays <= 30;
        if (filters.date === 'Last 3 Months') return diffDays <= 90;
        if (filters.date === 'This Year') return itemDate.getFullYear() === now.getFullYear();
        return true;
      });
    }

    return list;
  }, [data, filters.class, filters.subject, filters.date, isPersonal, subjectsData, user?.id]);

  // On mobile screens, default to Grid View
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);

  const totalAssessments = filteredData.length;
  const publishedCount = useMemo(() => {
    return filteredData.filter(item => item.status?.toUpperCase() === 'PUBLISHED' || item.status?.toUpperCase() === 'APPROVED' || item.status?.toUpperCase() === 'COMPLETED').length;
  }, [filteredData]);
  const draftCount = useMemo(() => {
    return filteredData.filter(item => item.status?.toUpperCase() === 'DRAFT').length;
  }, [filteredData]);
  const myItemsCount = useMemo(() => {
    return filteredData.filter(item => {
      const itm = item as Exam & { assignedTeachers?: Array<{ id: string }> };
      return itm.teacherId === user?.id || itm.assignedTeachers?.some(t => t.id === user?.id);
    }).length;
  }, [filteredData, user?.id]);

  const activeSchoolId = filterId || user?.schools?.[0]?.schoolId || (user as any)?.tenantId || '';
  const { data: schoolProfile } = useSchoolProfile(activeSchoolId);

  const handleExportPDF = async () => {
    if (!filteredData || filteredData.length === 0) {
      toast.warning("No assessment records found to export.");
      return;
    }
    setIsExporting(true);
    const toastId = toast.loading("Generating Assessments PDF...", { autoClose: false });

    try {
      const tabLabels: Record<string, string> = {
        'all': 'All Assessments',
        'exams': 'Exams',
        'quizzes': 'Quizzes',
        'subject-papers': 'Subject Papers',
        'ca': 'Continuous Assessment (CA)',
        'assignment': 'Assignments',
      };
      const currentTabLabel = tabLabels[activeTab] || 'Assessments';

      const selectedClassName = classesData?.find((c: any) => c.id === filters.class)?.name || 'All Classes';
      const selectedSubjectName = subjectsData?.find((s: any) => (s.id || s.subjectId) === filters.subject)?.name || 'All Subjects';

      const profileForExport = schoolProfile || {
        name: selectedSchoolName && selectedSchoolName !== 'Personal Account' ? selectedSchoolName : (user?.schools?.[0]?.name || 'School'),
        schoolLogo: schoolProfile?.logo || schoolProfile?.schoolLogo || '/schoolhub.png',
        address: schoolProfile?.address || ''
      };

      const metaData = [
        { label: 'Assessment Category', value: currentTabLabel },
        { label: 'Target Class', value: selectedClassName },
        { label: 'Subject Scope', value: selectedSubjectName },
        { label: 'Status Filter', value: filters.status ? filters.status.toUpperCase() : 'All Statuses' },
        { label: 'Total Records', value: `${filteredData.length} records` },
        { label: 'Generated On', value: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
      ];

      const tableData = filteredData.map((item: any, idx: number) => {
        const title = item.title || item.name || 'Untitled';
        const cat = item.category || (activeTab === 'quizzes' ? 'QUIZ' : activeTab === 'ca' ? 'CA' : activeTab === 'assignment' ? 'ASSIGNMENT' : 'EXAM');
        const subName = item.subject?.name || item.subjectExamPapers?.[0]?.subjectPaper?.subject?.name || '-';
        const clsName = item.class?.name || classesData?.find((c: any) => c.id === item.classId)?.name || '-';
        const marks = item.totalMarks !== undefined ? String(item.totalMarks) : '-';
        const duration = item.durationMinutes ? `${item.durationMinutes}m` : '-';
        const status = (item.status || 'DRAFT').toUpperCase();
        const date = item.createdAt || item.startDate 
          ? new Date(item.createdAt || item.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : '-';
        return [
          String(idx + 1),
          title,
          cat,
          subName,
          clsName,
          marks,
          duration,
          status,
          date
        ];
      });

      const schoolSafeName = (profileForExport.name || 'School').replace(/[^a-zA-Z0-9]/g, '_');
      await generatePDF({
        title: `${profileForExport.name || 'School'} - Assessment Directory`,
        filename: `${schoolSafeName}_Assessments_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`,
        schoolProfile: profileForExport,
        metaData,
        tableHeaders: [['#', 'Title', 'Category', 'Subject', 'Class', 'Marks', 'Duration', 'Status', 'Date']],
        tableData,
        orientation: 'landscape'
      });

      toast.update(toastId, { render: "PDF Exported Successfully!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.update(toastId, { render: "Failed to export PDF", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.warning("No assessment records found to export.");
      return;
    }

    const tabLabels: Record<string, string> = {
      'exams': 'Exams',
      'quizzes': 'Quizzes',
      'subject-papers': 'Subject Papers',
      'ca': 'Continuous Assessment (CA)',
      'assignment': 'Assignments',
    };
    const currentTabLabel = tabLabels[activeTab] || 'Assessments';

    const profileForExport = schoolProfile || {
      name: selectedSchoolName && selectedSchoolName !== 'Personal Account' ? selectedSchoolName : (user?.schools?.[0]?.name || 'School'),
      address: schoolProfile?.address || ''
    };

    const schoolName = profileForExport.name || 'School';
    const schoolAddress = profileForExport.address || '';
    const headers = ['S/N', 'Title', 'Category', 'Subject', 'Class', 'Total Marks', 'Duration (mins)', 'Status', 'Date'];
    
    const rows = filteredData.map((item: any, idx: number) => {
      const title = (item.title || item.name || 'Untitled').replace(/"/g, '""');
      const cat = item.category || (activeTab === 'quizzes' ? 'QUIZ' : activeTab === 'ca' ? 'CA' : activeTab === 'assignment' ? 'ASSIGNMENT' : 'EXAM');
      const subName = (item.subject?.name || item.subjectExamPapers?.[0]?.subjectPaper?.subject?.name || '-').replace(/"/g, '""');
      const clsName = (item.class?.name || classesData?.find((c: any) => c.id === item.classId)?.name || '-').replace(/"/g, '""');
      const marks = item.totalMarks !== undefined ? item.totalMarks : '-';
      const duration = item.durationMinutes || '-';
      const status = (item.status || 'DRAFT').toUpperCase();
      const date = item.createdAt || item.startDate 
        ? new Date(item.createdAt || item.startDate).toLocaleDateString('en-GB')
        : '-';
      return [
        idx + 1,
        `"${title}"`,
        `"${cat}"`,
        `"${subName}"`,
        `"${clsName}"`,
        `"${marks}"`,
        `"${duration}"`,
        `"${status}"`,
        `"${date}"`
      ];
    });

    const csvContent = [
      `"${schoolName}"`,
      `"${schoolAddress}"`,
      `"Assessment Category: ${currentTabLabel}"`,
      `"Export Date: ${new Date().toLocaleDateString('en-GB')}"`,
      '',
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const schoolSafeName = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${schoolSafeName}_Assessments_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported Successfully!");
  };

  return (
    <main className="w-full space-y-6 sm:space-y-8 py-2">
      <div className="flex flex-col flex-1 w-full">
        <PageHeader 
          title="Assessments" 
          onCreateNew={handleCreateNew}
          onAddPaper={() => setIsAddPaperModalOpen(true)}
          activeTab={activeTab}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          isExporting={isExporting}
        />

        {/* Top Stat Cards — 2 Columns on Mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6">
          <StatCard 
            label="Total Assessments" 
            value={totalAssessments} 
            icon={ClipboardList} 
            color="text-emerald-500" 
            bgColor="bg-emerald-500/10" 
            tooltip="Total count of exams, quizzes, continuous assessments, and assignments configured in your directory. Use this to monitor overall evaluation volume." 
          />
          <StatCard 
            label="Active / Published" 
            value={publishedCount} 
            icon={Trophy} 
            color="text-blue-500" 
            bgColor="bg-blue-500/10" 
            tooltip="Assessments currently published or approved for student submission and grading. Use this to verify which evaluations are actively taking responses." 
          />
          <StatCard 
            label="Draft Assessments" 
            value={draftCount} 
            icon={FileText} 
            color="text-amber-500" 
            bgColor="bg-amber-500/10" 
            tooltip="Assessments still in preparation or pending question entry. Use this to quickly identify pending evaluation drafts before publishing deadlines." 
          />
          <StatCard 
            label="My Modules" 
            value={myItemsCount} 
            icon={Sparkles} 
            color="text-purple-500" 
            bgColor="bg-purple-500/10" 
            tooltip="Evaluations created by you or where you are directly assigned as the evaluating instructor. Use this to track your personal grading responsibility." 
          />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-emerald-950/30 backdrop-blur-md rounded-xl sm:rounded-2xl border border-emerald-100 dark:border-emerald-800/40 shadow-xl shadow-emerald-900/5 p-4 sm:p-6"
        >
          {/* Tabs Strategy */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-emerald-100/60 dark:border-emerald-800/30">
            {/* Scrollable Category Tabs */}
            <div className="relative w-full md:w-auto overflow-hidden">
              <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl sm:rounded-2xl shadow-inner border border-emerald-100/60 dark:border-emerald-800/30 overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain">
                <TabButton 
                  active={activeTab === 'all'} 
                  onClick={() => handleTabChange('all')}
                  icon={LayoutGrid}
                  label="All Assessments"
                  count={activeTab === 'all' ? filteredData.length : undefined}
                />
                <TabButton 
                  active={activeTab === 'exams'} 
                  onClick={() => handleTabChange('exams')}
                  icon={Trophy}
                  label="Exams"
                  count={activeTab === 'exams' ? filteredData.length : undefined}
                />
                <TabButton 
                  active={activeTab === 'quizzes'} 
                  onClick={() => handleTabChange('quizzes')}
                  icon={ClipboardList}
                  label="Quizzes"
                  count={activeTab === 'quizzes' ? filteredData.length : undefined}
                />
                <TabButton 
                  active={activeTab === 'subject-papers'} 
                  onClick={() => handleTabChange('subject-papers')}
                  icon={Sparkles}
                  label="Subject Papers"
                  count={activeTab === 'subject-papers' ? filteredData.length : undefined}
                />
                <TabButton 
                  active={activeTab === 'ca'} 
                  onClick={() => handleTabChange('ca')}
                  icon={FileText}
                  label="CA"
                  count={activeTab === 'ca' ? filteredData.length : undefined}
                />
                <TabButton 
                  active={activeTab === 'assignment'} 
                  onClick={() => handleTabChange('assignment')}
                  icon={BookOpen}
                  label="Assignments"
                  count={activeTab === 'assignment' ? filteredData.length : undefined}
                />
              </div>
            </div>

            {/* View Mode Switcher Row */}
            <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto pt-1 md:pt-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 md:hidden">
                Display Layout
              </span>
              <div className="flex items-center gap-2">
                <HeaderTooltip content="Switch between visual Grid cards and the comprehensive tabular List perspective." />
                <div className="flex items-center gap-1 bg-emerald-50/80 dark:bg-emerald-950/40 p-1 rounded-xl border border-emerald-100/60 dark:border-emerald-800/30 backdrop-blur-sm shadow-inner">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      viewMode === 'list' 
                        ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-md' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                    title="List View"
                  >
                    <List size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      viewMode === 'grid' 
                        ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-md' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <FilterChips
            filters={filters}
            classes={classesData}
            subjects={subjectsData}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          {/* Teacher Tip: Click Dropdown to see assigned subject papers */}
          {activeTab !== 'subject-papers' && activeTab !== 'assignment' && (
            <div className="mt-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/15 flex items-start sm:items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 shrink-0 shadow-2xs">
                <Info size={16} strokeWidth={2.5} />
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed">
                <span className="font-black text-emerald-700 dark:text-emerald-400">Teacher Tip:</span> Click the{' '}
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-emerald-500/30 font-bold text-emerald-700 dark:text-emerald-300 text-xs shadow-2xs">
                  <ChevronDown size={13} className="inline stroke-[2.5]" /> dropdown
                </span>{' '}
                on any exam to view the specific subject papers, question counts, and instructors assigned to you. Click any assessment card to manage its papers.
              </p>
            </div>
          )}

          <div className="mt-4 sm:mt-6">
            <AnimatePresence mode="wait">
              {(isLoading || isRefreshing) ? (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ExamsTableSkeleton />
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                >
                  <ExamsTable 
                    exams={filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)} 
                    activeTab={activeTab}
                    viewMode={viewMode}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    mySubjectIds={subjectsData?.map((s: any) => s.id || s.subjectId) || []}
                    onDelete={(exam) => setExamToDelete(exam)}
                  />
                  {filteredData.length > 0 && (
                      <TeacherPagination
                          currentPage={currentPage}
                          totalPages={Math.ceil(filteredData.length / itemsPerPage)}
                          totalItems={filteredData.length}
                          itemsPerPage={itemsPerPage}
                          onPageChange={setCurrentPage}
                          itemName="assessments"
                      />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Add Paper Modal */}
      <Dialog open={isAddPaperModalOpen} onOpenChange={setIsAddPaperModalOpen}>
        <DialogContent className="sm:max-w-[540px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase">
              <Building2 className="w-5 h-5 text-primary" />
              Create Subject Paper
            </DialogTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-2">
              For: <span className="text-slate-900 dark:text-slate-100">{selectedSchoolName}</span>
            </p>
          </DialogHeader>
          <div className="pt-2">
            <CreatePaperForm 
              onSuccess={(paperId) => {
                router.push(`/dashboard/teacher/exams&quizzes/add-question?paperId=${paperId}`);
                setIsAddPaperModalOpen(false);
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Exam/Quiz/CA Modal */}
      <Dialog open={isExamModalOpen} onOpenChange={setIsExamModalOpen}>
        <DialogContent className="sm:max-w-[540px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Create {
                createCategory === 'EXAM' ? 'Single Paper Exam' :
                createCategory === 'CA' ? 'Continuous Assessment' :
                createCategory === 'QUIZ' ? 'Test (Quizzes)' : createCategory
              }
            </DialogTitle>
          </DialogHeader>
          <CreateExamForm 
            category={createCategory} 
            onSuccess={(id, paperId) => {
              setIsExamModalOpen(false);
              if (paperId) {
                router.push(`/dashboard/teacher/exams&quizzes/papers/${paperId}`);
              } else {
                router.push(`/dashboard/teacher/exams&quizzes/${id}/papers`);
              }
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Create Assignment Modal */}
      <Dialog open={isAssignmentModalOpen} onOpenChange={setIsAssignmentModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              Create Assignment
            </DialogTitle>
          </DialogHeader>
          <CreateAssignmentForm 
            onSuccess={(id: string) => {
              setIsAssignmentModalOpen(false);
              router.push(`/dashboard/teacher/assignments/${id}?edit=true`);
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Delete Assessment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">{examToDelete?.title || examToDelete?.subject?.name || 'this assessment'}</span>? 
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setExamToDelete(null)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => examToDelete && deleteMutation.mutate(examToDelete.id)}
              disabled={deleteMutation.isPending || !examToDelete}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer transition-colors"
            >
              {deleteMutation.isPending && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function TabButton({ 
  active, 
  onClick, 
  icon: Icon, 
  label,
  count
}: { 
  active: boolean, 
  onClick: () => void, 
  icon: React.ElementType, 
  label: string,
  count?: number 
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`relative flex items-center cursor-pointer gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 overflow-hidden focus:outline-none shrink-0 whitespace-nowrap select-none ${
        active 
          ? 'text-white shadow-md shadow-emerald-600/20' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30'
      }`}
    >
      <Icon size={14} className="relative z-10 shrink-0" strokeWidth={2.5} />
      <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider relative z-10">{label}</span>
      {typeof count === 'number' && (
        <span className={`relative z-10 px-1.5 py-0.5 text-[9px] font-black rounded-md ${
          active 
            ? 'bg-white/20 text-white' 
            : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
        }`}>
          {count}
        </span>
      )}
      
      {active && (
        <motion.div 
          layoutId="active-tab-bg"
          className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 shadow-md shadow-emerald-500/20"
          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
        />
      )}
    </motion.button>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  tooltip 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string; 
  bgColor: string; 
  tooltip: string; 
}) {
  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.01 }}
      className="p-3 sm:p-5 md:p-6 bg-white dark:bg-emerald-950/60 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={`p-2 sm:p-3 md:p-3.5 rounded-lg sm:rounded-xl ${bgColor} ${color} transition-transform group-hover:scale-105 shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" strokeWidth={2.5} />
        </div>
        <HeaderTooltip content={tooltip} />
      </div>
      <div>
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-500 transition-colors line-clamp-1">{label}</p>
        <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5 sm:mt-1">{value}</p>
      </div>
    </motion.div>
  );
}
