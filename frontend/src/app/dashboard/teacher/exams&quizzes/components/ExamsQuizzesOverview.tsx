'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from './PageHeader';
import FilterChips from './FilterChips';
import ExamsTable from './ExamsTable';
import { teacherService } from '@/lib/api/services/teacherService';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { ExamsTableSkeleton } from './ExamsSkeleton';
import { Trophy, ClipboardList, Sparkles, Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreatePaperForm from './CreatePaperForm';
import { useRouter } from 'next/navigation';

export default function ExamsQuizzesOverview() {
  const [activeTab, setActiveTab] = useState<'exams' | 'quizzes' | 'subject-papers'>('exams');
  const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
  const { user } = useAuthStore();
  const [filters, setFilters] = useState({
    class: '',
    subject: '',
    status: '',
    date: '',
  });
  const [isAddPaperModalOpen, setIsAddPaperModalOpen] = useState(false);
  const router = useRouter();

  const isPersonal = selectedSchoolId === user?.id;
  const category = activeTab === 'exams' ? 'EXAM' : 'QUIZ';

  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-exams', selectedSchoolId, activeTab, filters],
    queryFn: async () => {
      if (activeTab === 'subject-papers') {
        const result = await teacherService.getSubjectPapers({
          schoolId: selectedSchoolId, // Pass the selectedSchoolId (which could be user.id for personal)
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
    console.log('Create new exam/quiz');
  };

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      class: '',
      subject: '',
      status: '',
      date: '',
    });
  };

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
            <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-[1.5rem] shadow-inner">
              <TabButton 
                active={activeTab === 'exams'} 
                onClick={() => setActiveTab('exams')}
                icon={Trophy}
                label="Exams"
              />
              <TabButton 
                active={activeTab === 'quizzes'} 
                onClick={() => setActiveTab('quizzes')}
                icon={ClipboardList}
                label="Quizzes"
              />
              <TabButton 
                active={activeTab === 'subject-papers'} 
                onClick={() => setActiveTab('subject-papers')}
                icon={Sparkles}
                label="Subject Papers"
              />
            </div>

            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                  <Sparkles size={14} className="animate-pulse" />
                  {isPersonal ? "All Connected Schools" : "Filtered by School"}
               </div>
            </div>
          </div>

          <FilterChips
            filters={filters}
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
                    exams={data || []} 
                    activeTab={activeTab}
                  />
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
                console.log("DEBUG: [ExamsQuizzesOverview] Redirecting to add-question:", paperId);
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

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-500 overflow-hidden ${
        active 
          ? 'text-white' 
          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
      }`}
    >
      <Icon size={18} className="relative z-10" />
      <span className="text-sm font-black uppercase tracking-widest relative z-10">{label}</span>
      
      {active && (
        <motion.div 
          layoutId="active-tab-bg"
          className="absolute inset-0 bg-primary shadow-lg shadow-primary/20"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
}