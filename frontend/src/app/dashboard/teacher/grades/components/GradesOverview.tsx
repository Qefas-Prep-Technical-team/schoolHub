'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  AlertCircle, 
  Settings2,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';

import { FilterOption, GradeLetter, Pagination, StudentGrade } from './types';
import PageHeader from './PageHeader';
import Filters from './Filters';
import GradesTable from './GradesTable';
import GradeStatsCards from './GradeStatsCards';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { gradeService } from '@/lib/api/services/gradeService';
import { teacherService } from '@/lib/api/services/teacherService';
import { sessionService } from '@/lib/api/services/sessionService';
import { useGradeSettingsStore } from '@/lib/api/hooks/useGradeSettingsStore';
import { calculateGrade } from '../utils/gradeCalculator';
import GradeSettingsModal from './GradeSettingsModal';
import EditGradeModal from './EditGradeModal';
import { Button } from '@/components/ui/button';

const GradesOverview: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null);
  
  // Filter States
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
  const { user } = useAuthStore();
  const { gradingScale } = useGradeSettingsStore();

  const isPersonal = !selectedSchoolId || selectedSchoolId === user?.id;
  const filterId = isPersonal ? undefined : selectedSchoolId;

  const { data: classesData } = useQuery({
    queryKey: ['teacher-classes', selectedSchoolId],
    queryFn: () => teacherService.getClasses({ schoolId: filterId }),
    staleTime: 1000 * 60 * 10,
  });

  const { data: sessionsData } = useQuery({
    queryKey: ['school-sessions', selectedSchoolId],
    queryFn: () => sessionService.getSessions(),
    staleTime: 1000 * 60 * 10,
  });

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['teacher-grades', selectedSchoolId, currentPage, searchQuery, selectedClassId, selectedSessionId, selectedCategory],
    queryFn: async () => {
      try {
        const result = await gradeService.getGradeHub(filterId || '', {
          page: currentPage,
          search: searchQuery,
          teacherId: isPersonal ? user?.id : undefined,
          classId: selectedClassId !== 'all' ? selectedClassId : undefined,
          sessionId: selectedSessionId !== 'all' ? selectedSessionId : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          limit: 10
        });
        return result;
      } catch (err) {
        console.error("Error fetching grades:", err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const updateGradeMutation = useMutation({
    mutationFn: ({ id, score, remarks }: { id: string, score: number, remarks: string }) => 
      gradeService.updateGradeScore(id, score, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-grades'] });
      setEditingGrade(null);
    },
  });

  const rawData = response?.data || [];
  const apiPagination = response?.pagination || { totalPages: 1, total: 0 };

  const mappedGrades: StudentGrade[] = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return [];
    
    return rawData.map((item: any) => {
      const score = item.score || 0;
      const maxMarks = item.maxMarks || 100;
      const percentage = (score / maxMarks) * 100;
      
      return {
        id: String(item.id || Math.random()),
        name: item.student?.name || item.name || 'Unknown Student',
        studentCode: item.student?.studentCode || item.studentId || 'S-0000',
        subjectPaper: item.subjectPaper?.title || item.subject || '-',
        assessmentType: item.category || 'Assignment', // Backend uses 'category' for the enum
        score: `${score}/${maxMarks}`,
        rawScore: score,
        maxMarks: maxMarks,
        totalScore: `${percentage.toFixed(1)}%`,
        grade: calculateGrade(score, maxMarks, gradingScale) as GradeLetter,
        status: item.status || 'Graded',
        remarks: item.remarks || ''
      };
    });
  }, [rawData, gradingScale]);

  const filters: FilterOption[] = useMemo(() => {
    const activeFilters: FilterOption[] = [];

    const currentSession = sessionsData?.find((s: any) => s.id === selectedSessionId);
    activeFilters.push({
      label: currentSession ? `Session: ${currentSession.name}` : 'Session: All',
      value: 'session',
      icon: 'expand_more',
      options: [
        { label: 'All Sessions', value: 'all' },
        ...(sessionsData?.map((s: any) => ({ label: s.name, value: s.id })) || [])
      ]
    });

    const currentClass = classesData?.find((c: any) => c.id === selectedClassId);
    activeFilters.push({
      label: currentClass ? `Class: ${currentClass.name}` : 'Class: All',
      value: 'class',
      icon: 'expand_more',
      options: [
        { label: 'All Classes', value: 'all' },
        ...(classesData?.map((c: any) => ({ label: c.name, value: c.id })) || [])
      ]
    });

    const categories = ['EXAM', 'MIDTERM', 'ASSIGNMENT', 'QUIZ'];
    activeFilters.push({
      label: selectedCategory !== 'all' ? `Type: ${selectedCategory.toLowerCase()}` : 'Type: All',
      value: 'category',
      icon: 'expand_more',
      options: [
        { label: 'All Types', value: 'all' },
        ...categories.map(cat => ({ label: cat.charAt(0) + cat.slice(1).toLowerCase(), value: cat }))
      ]
    });
    
    return activeFilters;
  }, [classesData, sessionsData, selectedClassId, selectedSessionId, selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const fadeInUp = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50/50 dark:bg-black/5">
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="layout-content-container flex flex-col max-w-7xl mx-auto flex-1">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
          >
            <PageHeader 
              onAddGrade={() => {}} 
              selectedSchoolName={selectedSchoolName}
              isPersonal={isPersonal}
            />
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl px-4 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </motion.div>

          <GradeSettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />

          <EditGradeModal
            isOpen={!!editingGrade}
            onClose={() => setEditingGrade(null)}
            onSave={(id, score, remarks) => updateGradeMutation.mutate({ id, score, remarks })}
            grade={editingGrade}
            isSaving={updateGradeMutation.isPending}
          />
          
          {/* Stats Section */}
          <GradeStatsCards grades={mappedGrades} />

          {/* Table Container */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="flex flex-col flex-1"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-slate-200">Record Management</h2>
              <Filters 
                filters={filters}
                onFilterSelect={(type, value) => {
                  setCurrentPage(1);
                  if (type === 'session') setSelectedSessionId(value);
                  if (type === 'class') setSelectedClassId(value);
                  if (type === 'category') setSelectedCategory(value);
                }}
              />
            </div>

            <AnimatePresence mode="wait">
              {error ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-32 rounded-[2rem] border border-red-100 bg-red-50/50 dark:bg-red-900/10"
                >
                  <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/10 mb-4">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Sync Failure</h3>
                  <p className="text-slate-700 dark:text-slate-300 mt-2 text-sm font-bold">"The connection to the academic grid was interrupted."</p>
                  <Button 
                    variant="link" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['teacher-grades'] })}
                    className="mt-4 text-primary font-black"
                  >
                    Attempt Re-sync
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <GradesTable
                    grades={mappedGrades}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onFilter={() => {}}
                    onSort={() => {}}
                    onExport={() => {}}
                    onEditGrade={setEditingGrade}
                    currentPage={currentPage}
                    totalPages={apiPagination.totalPages || 1}
                    totalItems={apiPagination.total || mappedGrades.length}
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default GradesOverview;
