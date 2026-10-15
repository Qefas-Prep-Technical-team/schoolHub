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
import { ExamsTableSkeleton } from './ExamsSkeleton';
import { Trophy, ClipboardList, Sparkles, Building2, FileText, BookOpen, LayoutGrid, List } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'exams' | 'quizzes' | 'subject-papers' | 'ca' | 'assignment'>('exams');
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
  
  const queryClient = useQueryClient();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isPersonal = selectedSchoolId === user?.id;
  const category = activeTab === 'exams' ? 'EXAM' : activeTab === 'quizzes' ? 'QUIZ' : activeTab === 'ca' ? 'CA' : activeTab === 'assignment' ? 'ASSIGNMENT' : 'EXAM';

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
      if (activeTab === 'subject-papers') {
        const result = await teacherService.getSubjectPapers({
          schoolId: filterId,
        });
        return result;
      }
      if (activeTab === 'assignment') {
        const result = await teacherService.getAssignments({
          schoolId: filterId,
          status: filters.status || undefined,
          classId: filters.class || undefined,
        });
        return result;
      }
      const result = await teacherService.getExams({
        schoolId: filterId,
        category,
        status: filters.status || undefined,
        classId: filters.class || undefined,
      });
      return result;
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

  const handleTabChange = (tab: 'exams' | 'quizzes' | 'subject-papers' | 'ca' | 'assignment') => {
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

    // Filter quizzes strictly according to teacher permissions (client-side fallback)
    const mySubjectIds = subjectsData?.map((s: any) => s.id || s.subjectId) || [];
    if (activeTab === 'quizzes' && !isPersonal) {
      list = list.filter(item => {
        const isCreator = item.teacherId === user?.id || item.teacherId === (user as any)?.tenantId;
        const isSubjectAssigned = mySubjectIds.includes(item.subjectId) || 
                                  mySubjectIds.includes(item.subject?.id);
        const isAssignedDirectly = item.assignedTeachers?.some((t: any) => t.id === user?.id || t.id === (user as any)?.tenantId);
        return isCreator || isSubjectAssigned || isAssignedDirectly;
      });
    }
    // Note: subject-papers tab filtering (creator/assigned-subject + category exclusion) is done in the backend


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
  }, [data, filters.class, filters.subject, filters.date, activeTab, isPersonal, subjectsData, user?.id]);

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

  return (
    <main className="w-full space-y-6 sm:space-y-8 py-2">
      <div className="flex flex-col flex-1 w-full">
        <PageHeader 
          title="Assessments" 
          onCreateNew={handleCreateNew}
          onAddPaper={() => setIsAddPaperModalOpen(true)}
          activeTab={activeTab}
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
