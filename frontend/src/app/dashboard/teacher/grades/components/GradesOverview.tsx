'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Settings2,
  Lock,
  Sparkles,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { FilterOption, GradeLetter, StudentGrade, GradeStatus } from './types';
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
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useFeatureAccess } from '@/lib/api/hooks/useFeatureAccess';
import { usePublicPlatformSettings } from '@/lib/api/hooks/usePlatformGovernance';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useSubscriptionUsage } from '@/lib/api/hooks/useSubscriptionUsage';
import { toast } from 'react-toastify';
import GradeEntryModal from '@/app/dashboard/admin/grades/components/GradeEntryModal';
import GradeUploadModal from '@/app/dashboard/admin/grades/components/GradeUploadModal';
import GradeUploadInstructionsModal from '@/app/dashboard/admin/grades/components/GradeUploadInstructionsModal';
import GradeOCRModal from '@/app/dashboard/admin/grades/components/GradeOCRModal';

const GradesOverview: React.FC = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<StudentGrade | null>(null);
  const [gradeToDelete, setGradeToDelete] = useState<StudentGrade | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  
  // Standalone Grade options modal states
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadInstructionsModalOpen, setIsUploadInstructionsModalOpen] = useState(false);
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [isUpgradePopupOpen, setIsUpgradePopupOpen] = useState(false);

  // Filter States
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
  const { user } = useAuthStore();
  const { gradingScale } = useGradeSettingsStore();

  const isPersonal = !selectedSchoolId || selectedSchoolId === user?.id;
  const filterId = isPersonal ? undefined : selectedSchoolId;

  // Standalone Grade options logic
  const modalSchoolId = selectedSchoolId || user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const aiFeatureKey = process.env.NEXT_PUBLIC_FEATURE_KEY_AI_INSIGHTS || 'aiInsights';
  const { data: hasOCRAccess } = useFeatureAccess(aiFeatureKey, modalSchoolId);
  const { data: platformSettings } = usePublicPlatformSettings();
  const subEnforcedTeachers = platformSettings?.sub_enforced_teachers !== "false";

  const { data: usageData } = useSubscriptionUsage();
  const { data: schoolProfile } = useSchoolProfile(modalSchoolId);

  const isTeacherPaying = usageData?.subscriptionStatus?.toLowerCase() === 'active' || usageData?.isTrial;
  const isSchoolPaying = schoolProfile?.subscriptionStatus?.toLowerCase() === 'active' || schoolProfile?.isTrialActive;

  const hasCSVAccess = subEnforcedTeachers ? !!isTeacherPaying : !!isSchoolPaying;

  const handleOpenOCR = () => {
    if (!hasOCRAccess) {
      setIsUpgradePopupOpen(true);
      return;
    }
    setIsOCRModalOpen(true);
  };

  const handleOpenUploadModal = () => {
    if (!hasCSVAccess) {
      setIsUpgradePopupOpen(true);
      return;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      const hideInstructions = localStorage.getItem('hideGradeUploadInstructions') === 'true';
      if (hideInstructions) {
        setIsUploadModalOpen(true);
      } else {
        setIsUploadInstructionsModalOpen(true);
      }
    } else {
      setIsUploadInstructionsModalOpen(true);
    }
  };

  const proceedToUpload = () => {
    setIsUploadInstructionsModalOpen(false);
    setIsUploadModalOpen(true);
  };

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
      gradeService.updateGradeScore(id, { score, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-grades'] });
      setEditingGrade(null);
    },
  });

  const publishGradeMutation = useMutation({
    mutationFn: (id: string) => gradeService.publishGrade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-grades'] });
      toast.success("Grade published successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to publish grade");
    }
  });

  const deleteGradeMutation = useMutation({
    mutationFn: (id: string) => gradeService.deleteGrade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-grades'] });
      toast.success("Grade record deleted successfully!");
      setGradeToDelete(null);
      setDeleteConfirmName('');
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete grade");
    }
  });

  const handleConfirmDelete = () => {
    if (!gradeToDelete) return;
    deleteGradeMutation.mutate(gradeToDelete.id);
  };

  const handleViewDetails = (grade: StudentGrade) => {
    if (grade.studentId) {
      router.push(`/dashboard/teacher/students/${grade.studentId}?tab=academic`);
    } else {
      toast.error("Student ID not found for this record");
    }
  };

  const rawData = useMemo(() => response?.data || [], [response?.data]);
  const apiPagination = response?.pagination || { totalPages: 1, total: 0 };

  const mappedGrades: StudentGrade[] = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return [];
    
    return rawData.map((item: {
      id?: string | number;
      score?: number;
      maxMarks?: number;
      student?: { name?: string; studentCode?: string; profilePicture?: string; avatar?: string };
      name?: string;
      studentId?: string;
      subjectPaper?: { title?: string };
      subject?: string;
      category?: string;
      status?: string;
      remarks?: string;
    }) => {
      const score = item.score || 0;
      const maxMarks = item.maxMarks || 100;
      const percentage = (score / maxMarks) * 100;
      
      return {
        id: String(item.id || Math.random()),
        studentId: item.studentId || (item.student as any)?.id || '',
        name: item.student?.name || item.name || 'Unknown Student',
        studentCode: item.student?.studentCode || item.studentId || 'S-0000',
        subjectPaper: item.subjectPaper?.title || item.subject || '-',
        assessmentType: item.category || 'Assignment', // Backend uses 'category' for the enum
        score: `${score}/${maxMarks}`,
        rawScore: score,
        maxMarks: maxMarks,
        totalScore: `${percentage.toFixed(1)}%`,
        grade: calculateGrade(score, maxMarks, gradingScale) as GradeLetter,
        status: (item.status || 'Graded') as GradeStatus,
        remarks: item.remarks || '',
        profilePicture: item.student?.profilePicture || item.student?.avatar || ''
      };
    });
  }, [rawData, gradingScale]);

  const filters: FilterOption[] = useMemo(() => {
    const activeFilters: FilterOption[] = [];

    const currentSession = (sessionsData as any[])?.find((s: any) => s.id === selectedSessionId);
    activeFilters.push({
      label: currentSession ? `Session: ${currentSession.name}` : 'Session: All',
      value: 'session',
      icon: 'expand_more',
      options: [
        { label: 'All Sessions', value: 'all' },
        ...((sessionsData as any[])?.map((s: any) => ({ label: s.name as string, value: s.id as string })) || [])
      ]
    });

    const currentClass = (classesData as any[])?.find((c: any) => c.id === selectedClassId);
    activeFilters.push({
      label: currentClass ? `Class: ${currentClass.name}` : 'Class: All',
      value: 'class',
      icon: 'expand_more',
      options: [
        { label: 'All Classes', value: 'all' },
        ...((classesData as any[])?.map((c: any) => ({ label: c.name as string, value: c.id as string })) || [])
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
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50/50 dark:bg-slate-950/50">
      <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col flex-1">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
          >
            <PageHeader 
              onAddGrade={() => setIsEntryModalOpen(true)}
              onOCRClick={handleOpenOCR}
              onUploadClick={handleOpenUploadModal}
              hasOCRAccess={!!hasOCRAccess}
              hasCSVAccess={hasCSVAccess}
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
                  <p className="text-slate-700 dark:text-slate-300 mt-2 text-sm font-bold">&quot;The connection to the academic grid was interrupted.&quot;</p>
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
                    onPublishGrade={(grade) => publishGradeMutation.mutate(grade.id)}
                    onDeleteGrade={setGradeToDelete}
                    onViewDetailsGrade={handleViewDetails}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!gradeToDelete} onOpenChange={(open) => { if (!open) { setGradeToDelete(null); setDeleteConfirmName(''); } }}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 z-50">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-900/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
              <DialogTitle className="text-xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">
                Delete Record
              </DialogTitle>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <DialogDescription className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              This action cannot be undone. To proceed, please type <span className="font-black text-slate-900 dark:text-white">{gradeToDelete?.name}</span> to confirm deletion.
            </DialogDescription>
            <Input
              placeholder="Student name"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>
          <DialogFooter className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setGradeToDelete(null); setDeleteConfirmName(''); }} className="h-10 rounded-xl px-4 font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
              Cancel
            </Button>
            <Button
              disabled={!gradeToDelete || deleteConfirmName !== gradeToDelete.name || deleteGradeMutation.isPending}
              onClick={handleConfirmDelete}
              className="h-10 rounded-xl px-4 font-black uppercase tracking-wider text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
            >
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grade entry, upload, instructions, OCR modals and Upgrade popup */}
      <GradeEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['teacher-grades'] });
        }}
        schoolId={modalSchoolId}
      />

      <GradeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['teacher-grades'] });
        }}
        schoolId={modalSchoolId}
      />

      <GradeUploadInstructionsModal
        isOpen={isUploadInstructionsModalOpen}
        onClose={() => setIsUploadInstructionsModalOpen(false)}
        onProceed={proceedToUpload}
      />

      <GradeOCRModal
        isOpen={isOCRModalOpen}
        onClose={() => {
          setIsOCRModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ['teacher-grades'] });
        }}
        schoolId={modalSchoolId}
      />

      <Dialog open={isUpgradePopupOpen} onOpenChange={setIsUpgradePopupOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10" />
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-400/5 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500/5 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <Lock size={24} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Premium Feature</p>
                  <h2 className="text-xl font-black tracking-tight text-white">AI Vision Scanner</h2>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Snap a photo of any physical mark sheet and let AI automatically extract all student names and scores for you.
              </p>
            </div>
          </div>

          <div className="p-8 bg-white dark:bg-slate-950 space-y-6">
            <div className="space-y-3">
              {[
                'Scan handwritten or printed mark sheets',
                'AI extracts names & scores automatically',
                'Review & edit before saving',
                'Works with any image format',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 flex items-center justify-center shrink-0">
                    <Sparkles size={10} className="text-amber-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feat}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {subEnforcedTeachers ? (
                <Button
                  onClick={() => { setIsUpgradePopupOpen(false); window.location.href = '/dashboard/teacher/billing'; }}
                  className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> Upgrade Your Plan <ArrowRight size={16} />
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 dark:bg-amber-500/5 p-3 rounded-xl border border-amber-500/20 leading-relaxed">
                    Individual teacher subscriptions are deactivated. Access to the AI Vision Scanner is managed via your school's institutional plan. Please notify your school administration to upgrade their plan.
                  </p>
                  <Button
                    onClick={() => {
                      if (typeof navigator !== 'undefined') {
                        navigator.clipboard.writeText("Hi Administrator, we need the AI Vision Grade Scanner feature to scan physical mark sheets and automatically record grades. Could you please upgrade our school's Qefas Hub subscription plan to unlock it for teachers? Thank you!");
                        toast.success("Request message copied to clipboard!");
                      }
                    }}
                    className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} /> Copy Request for Admin <ArrowRight size={16} />
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                onClick={() => setIsUpgradePopupOpen(false)}
                className="w-full h-10 rounded-xl font-bold text-slate-500 hover:text-slate-700 text-sm"
              >
                Maybe later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GradesOverview;
