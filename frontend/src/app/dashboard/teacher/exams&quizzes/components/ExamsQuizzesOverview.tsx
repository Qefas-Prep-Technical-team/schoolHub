'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from './PageHeader';
import FilterChips from './FilterChips';
import ExamsTable from './ExamsTable';
import { teacherService } from '@/lib/api/services/teacherService';
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
import { useRouter } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';

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
  const [isAddPaperModalOpen, setIsAddPaperModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isPersonal = selectedSchoolId === user?.id;
  const category = activeTab === 'exams' ? 'EXAM' : activeTab === 'quizzes' ? 'QUIZ' : activeTab === 'ca' ? 'CA' : activeTab === 'assignment' ? 'ASSIGNMENT' : 'EXAM';

  const filterId = isPersonal ? undefined : selectedSchoolId;

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

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-exams', selectedSchoolId, activeTab, filters.status, filters.class],
    queryFn: async () => {
      if (activeTab === 'subject-papers') {
        const result = await teacherService.getSubjectPapers({
          schoolId: selectedSchoolId,
        });
        return result;
      }
      if (activeTab === 'assignment') {
        const result = await teacherService.getAssignments({
          schoolId: isPersonal ? undefined : selectedSchoolId,
          status: filters.status || undefined,
          classId: filters.class || undefined,
        });
        return result;
      }
      const result = await teacherService.getExams({
        schoolId: isPersonal ? undefined : selectedSchoolId,
        category,
        status: filters.status || undefined,
        classId: filters.class || undefined,
      });
      return result;
    },
  });

  const handleCreateNew = () => {
    // Handled in PageHeader Link
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
  }, [data, filters.class, filters.subject, filters.date]);

  return (
    <main className="min-h-screen bg-transparent p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader 
          title="Assessments" 
          onCreateNew={handleCreateNew}
          onAddPaper={() => setIsAddPaperModalOpen(true)}
          activeTab={activeTab}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-2xl p-6 md:p-10"
        >
          {/* Tabs Strategy */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="inline-flex p-1.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-[1.5rem] shadow-inner border border-slate-200/50 dark:border-slate-700/40 flex-wrap md:flex-nowrap gap-1 backdrop-blur-sm">
              <TabButton 
                active={activeTab === 'exams'} 
                onClick={() => handleTabChange('exams')}
                icon={Trophy}
                label="Exams"
              />
              <TabButton 
                active={activeTab === 'quizzes'} 
                onClick={() => handleTabChange('quizzes')}
                icon={ClipboardList}
                label="Quizzes"
              />
              <TabButton 
                active={activeTab === 'subject-papers'} 
                onClick={() => handleTabChange('subject-papers')}
                icon={Sparkles}
                label="Subject Papers"
              />
              <TabButton 
                active={activeTab === 'ca'} 
                onClick={() => handleTabChange('ca')}
                icon={FileText}
                label="CA"
              />
              <TabButton 
                active={activeTab === 'assignment'} 
                onClick={() => handleTabChange('assignment')}
                icon={BookOpen}
                label="Assignments"
              />
            </div>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                  <Sparkles size={14} className="animate-pulse" />
                  {isPersonal ? "All Connected Schools" : "Filtered by School"}
               </div>

               {/* Grid / List view mode switcher */}
               <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/40 backdrop-blur-sm">
                 <button
                   onClick={() => setViewMode('list')}
                   className={`p-2 rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
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
                   className={`p-2 rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
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

          <FilterChips
            filters={filters}
            classes={classesData}
            subjects={subjectsData}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          <div className="mt-8">
            <AnimatePresence mode="wait">
              {isLoading ? (
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
                  />
                  {filteredData.length > 0 && (
                      <div className="mt-8 flex justify-center">
                          <Pagination
                              currentPage={currentPage}
                              totalPages={Math.ceil(filteredData.length / itemsPerPage)}
                              totalItems={filteredData.length}
                              itemsPerPage={itemsPerPage}
                              onPageChange={setCurrentPage}
                          />
                      </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <Dialog open={isAddPaperModalOpen} onOpenChange={setIsAddPaperModalOpen}>
        <DialogContent className="sm:max-w-[80vw] p-0 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border-slate-200/60 dark:border-slate-800/60 rounded-[2.5rem]">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Create <span className="text-primary">Subject Paper</span>
            </DialogTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-2">
              <Building2 size={12} className="text-primary" />
              For: <span className="text-slate-900 dark:text-slate-100">{selectedSchoolName}</span>
            </p>
          </DialogHeader>
          <div className="p-8">
            <CreatePaperForm 
              onSuccess={(paperId) => {
                router.push(`/dashboard/teacher/exams&quizzes/add-question?paperId=${paperId}`);
                setIsAddPaperModalOpen(false);
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: React.ElementType, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-500 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400/70 focus-visible:ring-offset-0 ${
        active 
          ? 'text-white' 
          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 dark:text-slate-400'
      }`}
    >
      <Icon size={18} className="relative z-10" />
      <span className="text-sm font-black uppercase tracking-widest relative z-10">{label}</span>
      
      {active && (
        <motion.div 
          layoutId="active-tab-bg"
          className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 dark:from-indigo-600 dark:to-violet-700 shadow-lg shadow-indigo-500/20 dark:shadow-indigo-950/40"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
}
