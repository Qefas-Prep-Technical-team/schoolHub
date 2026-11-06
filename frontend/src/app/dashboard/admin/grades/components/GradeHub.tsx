

import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Plus, 
  User, 
  FileText, 
  Calendar, 
  Filter, 
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
  History,
  FileUp,
  Camera,
  LayoutGrid,
  List,
  Trash2,
  Eye,
  Send,
  Edit,
  ShieldAlert,
  Loader2,
  Lock,
  Sparkles,
  ArrowRight,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClasses } from '@/lib/api/hooks/useClasses';
import { usePublishGrade, useDeleteGrade } from '@/lib/api/hooks/useGrades';
import { useFeatureAccess } from '@/lib/api/hooks/useFeatureAccess';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import GradeEntryModal from './GradeEntryModal';
import GradeUploadModal from './GradeUploadModal';
import GradeUploadInstructionsModal from './GradeUploadInstructionsModal';
import GradeOCRModal from './GradeOCRModal';
import GradeEditModal from './GradeEditModal';
import Pagination from './Pagination';
import { groupByDate } from '../utils/dateSectioning';

interface GradeHubProps {
  grades: any[];
  isLoading: boolean;
  schoolId: string;
  primaryColor?: string;
  onOpenExam?: (examId: string, studentId: string) => void;
}

export default function GradeHub({ grades, isLoading, schoolId, primaryColor = '#2563eb', onOpenExam }: GradeHubProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Default to grid on mobile
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('grid');
    }
  }, []);

  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<any | null>(null);
  const [gradeToDelete, setGradeToDelete] = useState<any | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadInstructionsModalOpen, setIsUploadInstructionsModalOpen] = useState(false);
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [isUpgradePopupOpen, setIsUpgradePopupOpen] = useState(false);

  // Feature gate: AI Vision OCR — use env key
  const aiFeatureKey = process.env.NEXT_PUBLIC_FEATURE_KEY_AI_INSIGHTS || 'aiInsights';
  const { data: hasOCRAccess, isLoading: isCheckingOCR } = useFeatureAccess(aiFeatureKey, schoolId);

  const handleOpenOCR = () => {
    if (!hasOCRAccess) {
      setIsUpgradePopupOpen(true);
      return;
    }
    setIsOCRModalOpen(true);
  };

  const handleGradeClick = (grade: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    router.push(`/dashboard/admin/grades/${grade.id}`);
  };


  // Mutations
  const publishMutation = usePublishGrade();
  const deleteMutation = useDeleteGrade();

  const handlePublish = (grade: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    publishMutation.mutate(grade.id, {
      onSuccess: () => toast.success(`Grade for ${grade.student?.name} published successfully!`),
      onError: () => toast.error('Failed to publish grade'),
    });
  };

  const handleDeleteClick = (grade: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setGradeToDelete(grade);
    setDeleteConfirmName('');
  };

  const handleConfirmDelete = () => {
    if (!gradeToDelete) return;
    deleteMutation.mutate(gradeToDelete.id, {
      onSuccess: () => {
        toast.success(`Grade record for ${gradeToDelete.student?.name} deleted.`);
        setGradeToDelete(null);
        setDeleteConfirmName('');
      },
      onError: () => toast.error('Failed to delete grade record'),
    });
  };

  const handleOpenUploadModal = () => {
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

  const handleToggleSelectionMode = () => {
    setIsSelectionMode((prev) => {
      if (prev) {
        setSelectedIds([]);
      }
      return !prev;
    });
  };

  const handleSelectAll = (e?: React.ChangeEvent<HTMLInputElement>) => {
    const allFilteredIds = filteredGrades.map((g: any) => g.id);
    if (e) {
      if (e.target.checked) {
        setSelectedIds(allFilteredIds);
      } else {
        setSelectedIds([]);
      }
      return;
    }
    if (selectedIds.length === allFilteredIds.length && allFilteredIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allFilteredIds);
    }
  };

  const handleSelectSection = (sectionIds: string[], checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...sectionIds])));
    } else {
      setSelectedIds((prev) => prev.filter((id) => !sectionIds.includes(id)));
    }
  };

  const handleSelectOne = (id: string, checked?: boolean) => {
    setSelectedIds((prev) => {
      const isCurrentlySelected = prev.includes(id);
      const shouldSelect = checked !== undefined ? checked : !isCurrentlySelected;
      if (shouldSelect) {
        return isCurrentlySelected ? prev : [...prev, id];
      }
      return prev.filter((item) => item !== id);
    });
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map((id) => deleteMutation.mutateAsync(id)));
      setSelectedIds([]);
      setIsSelectionMode(false);
      setIsBulkDeleteOpen(false);
      toast.success("Selected grade records cleared successfully.");
    } catch (error: unknown) {
      toast.error("Some records could not be cleared.");
    }
  };

  // Fetch school classes dynamically
  const { data: classesData } = useClasses(schoolId);
  const classes = classesData || [];

  // Safely handle cases where grades might not be an array (e.g. if it's an object from the API)
  const safeGrades = Array.isArray(grades) ? grades : (grades as any)?.data || [];

  // Dynamically extract unique subjects
  const uniqueSubjects = React.useMemo(() => {
    const subjects = new Set<string>();
    safeGrades.forEach((g: any) => {
      if (g.subject && g.subjectPaperId && !g.subject.toLowerCase().includes('(total)')) {
        subjects.add(g.subject);
      }
    });
    return Array.from(subjects).sort();
  }, [safeGrades]);

  // Dynamically extract unique categories/assessment types
  const uniqueTypes = React.useMemo(() => {
    const types = new Set<string>();
    safeGrades.forEach((g: any) => {
      const t = g.assessmentType && g.assessmentType !== 'NULL' ? g.assessmentType : g.category;
      if (t) types.add(t);
    });
    return Array.from(types).sort();
  }, [safeGrades]);

  // Enhanced search and multi-filtering logic
  const filteredGrades = React.useMemo(() => {
    return safeGrades.filter((g: any) => {
      const matchSearch = searchTerm === '' || 
        g.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.student?.studentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.class?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.assessmentType && g.assessmentType !== 'NULL' ? g.assessmentType : g.category)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.exam?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.subjectPaper?.title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = selectedType === 'all' || (g.assessmentType && g.assessmentType !== 'NULL' ? g.assessmentType : g.category) === selectedType;
      const matchSubject = selectedSubject === 'all' || g.subject === selectedSubject;
      const matchClass = selectedClass === 'all' || g.classId === selectedClass;

      return matchSearch && matchType && matchSubject && matchClass;
    });
  }, [safeGrades, searchTerm, selectedType, selectedSubject, selectedClass]);

  const totalPages = Math.ceil(filteredGrades.length / itemsPerPage);
  const paginatedGrades = filteredGrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const gradeGroups = React.useMemo(() => {
    return groupByDate<{ grade: any; globalIndex: number }>(
      paginatedGrades.map((grade: any, idx: number) => ({
        grade,
        globalIndex: (currentPage - 1) * itemsPerPage + idx + 1,
      })),
      (item) => item.grade?.createdAt || item.grade?.updatedAt
    );
  }, [paginatedGrades, currentPage, itemsPerPage]);

  const { institutionalMean, publishedCount, draftCount, publishedPercentage, draftPercentage } = React.useMemo(() => {
    if (!safeGrades.length) return { institutionalMean: 0, publishedCount: 0, draftCount: 0, publishedPercentage: 0, draftPercentage: 0 };
    
    const validGrades = safeGrades.filter((g: any) => g.maxMarks > 0);
    const sum = validGrades.reduce((acc: number, g: any) => acc + (g.score / g.maxMarks), 0);
    const mean = validGrades.length > 0 ? (sum / validGrades.length) * 100 : 0;
    
    const published = safeGrades.filter((g: any) => g.status === 'PUBLISHED' || g.examAttemptId || g.subjectExamAttemptId).length;
    const drafts = safeGrades.length - published;
    
    return {
      institutionalMean: mean.toFixed(1),
      publishedCount: published,
      draftCount: drafts,
      publishedPercentage: Math.round((published / safeGrades.length) * 100),
      draftPercentage: Math.round((drafts / safeGrades.length) * 100)
    };
  }, [safeGrades]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Dynamic Filters & Search Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Text Search */}
          <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                  type="text" 
                  placeholder="Search students, subjects, categories..."
                  value={searchTerm}
                  onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                  }}
                  className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-xs font-medium"
              />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Assessment/Exam Type Filter */}
            <div className="w-full sm:w-36">
              <Select value={selectedType} onValueChange={(val) => { setSelectedType(val); setCurrentPage(1); }}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-medium text-xs">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Filter */}
            <div className="w-full sm:w-36">
              <Select value={selectedSubject} onValueChange={(val) => { setSelectedSubject(val); setCurrentPage(1); }}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-medium text-xs">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Class Filter */}
            <div className="w-full sm:w-36">
              <Select value={selectedClass} onValueChange={(val) => { setSelectedClass(val); setCurrentPage(1); }}>
                <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 font-medium text-xs">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions & View Switcher */}
          <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
            {!isSelectionMode ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleToggleSelectionMode}
                disabled={filteredGrades.length === 0}
                className="rounded-xl h-10 px-3.5 font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs gap-1.5 shadow-xs hover:bg-slate-50 cursor-pointer"
              >
                <CheckSquare size={15} className="text-indigo-600 dark:text-indigo-400" />
                <span>Select</span>
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSelectAll()}
                  className="rounded-xl h-10 px-3 font-bold border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs gap-1.5 cursor-pointer"
                >
                  {filteredGrades.length > 0 && selectedIds.length === filteredGrades.length ? (
                    <CheckSquare size={15} />
                  ) : (
                    <Square size={15} />
                  )}
                  <span>
                    {filteredGrades.length > 0 && selectedIds.length === filteredGrades.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </span>
                </Button>
                <Button
                  type="button"
                  disabled={selectedIds.length === 0 || deleteMutation.isPending}
                  onClick={() => setIsBulkDeleteOpen(true)}
                  className="rounded-xl h-10 px-3.5 font-bold bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  <span>Clear Selected {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleToggleSelectionMode}
                  className="rounded-xl h-10 px-3 font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs gap-1 cursor-pointer"
                >
                  <X size={14} />
                  <span>Cancel</span>
                </Button>
              </div>
            )}

            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer", viewMode === 'grid' ? "bg-white dark:bg-slate-900 shadow-xs text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
              >
                <LayoutGrid size={15} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer", viewMode === 'list' ? "bg-white dark:bg-slate-900 shadow-xs text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
              >
                <List size={15} />
              </button>
            </div>

            <Button 
              onClick={handleOpenOCR}
              variant="outline" 
              className="relative rounded-xl h-10 w-10 p-0 font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:bg-slate-50 transition-all flex items-center justify-center group cursor-pointer"
              title={hasOCRAccess ? 'AI Vision Grade Scanner' : 'Upgrade to unlock AI Vision Scanner'}
            >
              {hasOCRAccess ? (
                <Camera size={16} className="text-indigo-600 dark:text-indigo-400" />
              ) : (
                <>
                  <Camera size={16} className="text-slate-400" />
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900" />
                </>
              )}
            </Button>
            <Button 
              onClick={handleOpenUploadModal}
              variant="outline" 
              className="rounded-xl h-10 w-10 p-0 font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:bg-slate-50 transition-all flex items-center justify-center cursor-pointer"
              title="Batch Upload"
            >
              <FileUp size={16} />
            </Button>
            <Button 
              onClick={() => setIsEntryModalOpen(true)}
              className="rounded-xl h-10 px-4 font-bold bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus size={15} /> <span>Record Grade</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Bento Grid Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[2.5rem] shadow-xl group relative overflow-hidden text-white" style={{ backgroundColor: primaryColor, boxShadow: `0 20px 25px -5px ${primaryColor}30` }}>
                <TrendingUp className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform duration-700" size={160} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Average Score</p>
                <h3 className="text-4xl font-black tracking-tighter mb-4">{institutionalMean}%</h3>
                <p className="text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10 whitespace-nowrap">
                   Aggregated Performance
                </p>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Records</p>
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{filteredGrades.length}</h3>
                </div>
                <div className="flex gap-2 mt-6">
                   <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${publishedPercentage}%` }} />
                   <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${draftPercentage}%` }} />
                   {filteredGrades.length === 0 && <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-800" />}
                </div>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white border border-slate-800 shadow-xl shadow-slate-900/20 overflow-hidden relative group">
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Status Overview</p>
                    <div className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={14} /> Published</span>
                            <span className="text-xs font-black">{publishedPercentage}%</span>
                        </div>
                        <div className="flex items-center justify-between opacity-60">
                            <span className="text-xs font-bold flex items-center gap-2"><Clock className="text-amber-400" size={14} /> Drafts</span>
                            <span className="text-xs font-black">{draftPercentage}%</span>
                        </div>
                    </div>
                </div>
                <History className="absolute -left-6 -bottom-6 text-white/5" size={120} />
          </div>
      </div>

      {/* Main Content Rendering (Grid vs List) */}
      {isSelectionMode && selectedIds.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {selectedIds.length} record{selectedIds.length !== 1 ? 's' : ''} selected
              </span>
              <Button 
                  onClick={() => setIsBulkDeleteOpen(true)}
                  variant="ghost"
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg text-sm font-bold transition-colors"
              >
                  <Trash2 className="w-4 h-4" />
                  Clear Selected
              </Button>
          </div>
      )}

      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                        <th className="p-4 w-14"><div className="h-4 w-4 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                        <th className="p-4 w-12"><div className="h-4 w-6 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                        <th className="p-4 w-40"><div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" /></th>
                        <th className="p-4"><div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" /></th>
                        <th className="p-4"><div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" /></th>
                        <th className="p-4"><div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" /></th>
                        <th className="p-4"><div className="h-4 w-16 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" /></th>
                        <th className="p-4 text-center"><div className="h-4 w-8 rounded-md bg-slate-200 dark:bg-slate-700 mx-auto animate-pulse" /></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <tr key={i} className="border-b border-slate-100 dark:border-slate-800/40">
                            <td className="p-4 text-center"><div className="h-4 w-4 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                            <td className="p-4 text-center"><div className="h-4 w-4 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                            <td className="p-4"><div className="h-4 w-16 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" /></td>
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 animate-pulse" />
                                    <div className="h-4 w-32 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
                                </div>
                            </td>
                            <td className="p-4"><div className="h-4 w-24 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" /></td>
                            <td className="p-4"><div className="h-5 w-16 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" /></td>
                            <td className="p-4"><div className="h-5 w-16 rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" /></td>
                            <td className="p-4 text-center"><div className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 mx-auto animate-pulse" /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        )
      ) : paginatedGrades.length === 0 ? (
        <div className="text-center py-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-400">
          <AlertCircle size={40} />
          <span className="text-xs font-black uppercase tracking-widest">No student grades found matching criteria</span>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout Mode */
        <div className="space-y-8">
          {gradeGroups.map((section) => {
            const sectionIds = section.items.map(({ grade }) => grade.id);
            const isSectionAllSelected = sectionIds.length > 0 && sectionIds.every((id) => selectedIds.includes(id));

            return (
              <div key={section.label} className="space-y-4">
                <div className="flex items-center gap-2.5 px-1 py-1">
                  {isSelectionMode && (
                    <input
                      type="checkbox"
                      checked={isSectionAllSelected}
                      onChange={(e) => handleSelectSection(sectionIds, e.target.checked)}
                      className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600"
                    />
                  )}
                  <div className="size-2 rounded-full bg-indigo-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    {section.label}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                    {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {section.items.map(({ grade }) => {
                    const percent = grade.maxMarks > 0 ? Math.round((grade.score / grade.maxMarks) * 100) : 0;
                    const isPublished = grade.status === 'PUBLISHED' || grade.examAttemptId || grade.subjectExamAttemptId;
                    const isSelected = selectedIds.includes(grade.id);

                    return (
                      <div 
                        key={grade.id} 
                        onClick={() => {
                          if (isSelectionMode) {
                            handleSelectOne(grade.id);
                          } else {
                            handleGradeClick(grade);
                          }
                        }}
                        className={cn(
                          "bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between group cursor-pointer",
                          isSelectionMode && isSelected && "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/30"
                        )}
                      >
                        <div>
                          {/* Card Header: Type Pill & Status Badge */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              {isSelectionMode && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleSelectOne(grade.id, e.target.checked)}
                                  className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600"
                                />
                              )}
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/80">
                                {(grade.assessmentType && grade.assessmentType !== 'NULL' ? grade.assessmentType : grade.category) || 'Assessment'}
                              </span>
                            </div>

                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isPublished
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              <span className={`size-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>

                        {/* Student Name & Class */}
                        <h3 className="font-bold text-slate-900 dark:text-white text-base truncate mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {grade.student?.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {grade.subject}
                          </span>
                          <span>•</span>
                          <span className="truncate">Lvl {grade.student?.gradeLevel}</span>
                          <span>•</span>
                          <span className="truncate">{grade.class?.name || 'Class'}{grade.class?.section || ''}</span>
                        </div>

                        {/* Student Code Badge if available */}
                        {grade.student?.studentCode && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-3 px-2.5 py-1 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                            <span className="text-slate-400 dark:text-slate-500 font-normal">Student Code:</span>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 truncate uppercase">
                              {grade.student.studentCode}
                            </span>
                          </div>
                        )}

                        {/* Score & Progress Metrics Card */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 mb-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Recorded Score:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                                {grade.score} / {grade.maxMarks} ({percent}%)
                              </span>
                              {grade.grade && (
                                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-black border bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
                                  {grade.grade}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                            <span>Passing: <strong>{Math.round(grade.maxMarks * 0.5)}</strong> pts</span>
                            <div className="flex items-center gap-1.5">
                              <span>Term: {grade.term || '1'}</span>
                              {grade.createdAt && (
                                <>
                                  <span>•</span>
                                  <span title={new Date(grade.createdAt).toLocaleString()}>
                                    {new Date(grade.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Button
                          type="button"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setSelectedGrade(grade); setIsEditModalOpen(true); }}
                          className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 shadow-sm"
                        >
                          <Edit size={13} />
                          <span>Edit Grade</span>
                        </Button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleGradeClick(grade); }}
                            className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical size={16} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-slate-200 dark:border-slate-800 w-48 p-2 shadow-2xl">
                              <DropdownMenuItem className="rounded-xl font-bold text-xs py-2.5 cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); setSelectedGrade(grade); setIsEditModalOpen(true); }}>
                                <Edit size={14} /> Edit Grade
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl font-bold text-xs py-2.5 cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); handleGradeClick(grade); }}>
                                <Eye size={14} /> View Details
                              </DropdownMenuItem>
                              {!isPublished && (
                                <DropdownMenuItem className="rounded-xl font-bold text-xs py-2.5 cursor-pointer text-emerald-600 gap-2" onClick={(e) => handlePublish(grade, e)}>
                                  <Send size={14} /> Publish Now
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="rounded-xl font-bold text-xs py-2.5 cursor-pointer text-rose-600 gap-2" onClick={(e) => handleDeleteClick(grade, e)}>
                                <Trash2 size={14} /> Delete Record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        /* Unified List View (matches SubjectPapersView) */
        <div className="space-y-6">
          {gradeGroups.map((section) => {
            const sectionIds = section.items.map(({ grade }) => grade.id);
            const isSectionAllSelected = sectionIds.length > 0 && sectionIds.every((id) => selectedIds.includes(id));

            return (
              <div key={section.label} className="space-y-3">
                <div className="flex items-center gap-2.5 px-1 py-1">
                  <div className="size-2 rounded-full bg-indigo-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    {section.label}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                    {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="border-b border-slate-200/80 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                              {isSelectionMode && (
                                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center w-14">
                                    <input 
                                        type="checkbox" 
                                        className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600" 
                                        checked={isSectionAllSelected}
                                        onChange={(e) => handleSelectSection(sectionIds, e.target.checked)}
                                    />
                                </th>
                              )}
                              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-12 text-center">#</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-40">Code</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Subject / Type</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Score</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                          {section.items.map(({ grade, globalIndex }) => {
                              const percent = Math.round((grade.score / grade.maxMarks) * 100);
                              const isSelected = selectedIds.includes(grade.id);
                              
                              return (
                                  <tr 
                                      key={grade.id}
                                      onClick={() => {
                                        if (isSelectionMode) {
                                          handleSelectOne(grade.id);
                                        } else {
                                          handleGradeClick(grade);
                                        }
                                      }}
                                      className={cn(
                                        "group border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all relative cursor-pointer",
                                        isSelectionMode && isSelected && "bg-indigo-50/50 dark:bg-indigo-950/30"
                                      )}
                                  >
                                      {isSelectionMode && (
                                        <td className="p-4 text-center relative z-10" onClick={(e) => e.stopPropagation()}>
                                            <input 
                                                type="checkbox" 
                                                className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer accent-indigo-600" 
                                                checked={isSelected}
                                                onChange={(e) => handleSelectOne(grade.id, e.target.checked)}
                                            />
                                        </td>
                                      )}
                                    <td className="p-4 text-center text-xs font-bold text-slate-400 relative z-10">
                                        #{globalIndex}
                                    </td>
                                    <td className="p-4 text-xs font-bold text-slate-600 dark:text-slate-300 relative z-10 uppercase tracking-wider">
                                        {grade.student?.studentCode || 'N/A'}
                                    </td>
                                    <td className="p-4 relative">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                                                {grade.student?.name?.substring(0, 2).toUpperCase() || 'ST'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                    {grade.student?.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 font-medium truncate">
                                                    Lvl {grade.student?.gradeLevel} • {grade.class?.name || 'Class'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 relative">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{grade.subject}</span>
                                            <span className="text-xs text-slate-400 font-medium truncate">{(grade.assessmentType && grade.assessmentType !== 'NULL' ? grade.assessmentType : grade.category) || 'General'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 relative">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">
                                                {grade.score}<span className="text-[10px] text-slate-400 font-medium ml-0.5">/{grade.maxMarks}</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 relative">
                                        {(grade.status === 'PUBLISHED' || grade.examAttemptId || grade.subjectExamAttemptId) ? (
                                            <div className="flex items-center gap-1.5">
                                               <div className="size-2 rounded-full bg-emerald-500" />
                                               <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Published</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                               <div className="size-2 rounded-full bg-amber-500" />
                                               <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Draft</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 relative text-center" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" className="h-8 px-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 hover:text-primary transition-all" onClick={(e) => handleGradeClick(grade, e)}>
                                                Details
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary transition-all">
                                                        <MoreVertical size={14} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl border-slate-200 dark:border-slate-800 w-48 p-2 shadow-2xl">
                                                    <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); handleGradeClick(grade); }}>
                                                        <Eye size={14} /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); setSelectedGrade(grade); setIsEditModalOpen(true); }}>
                                                        <Edit size={14} /> Edit
                                                    </DropdownMenuItem>
                                                    {grade.status !== 'PUBLISHED' && !grade.examAttemptId && !grade.subjectExamAttemptId && (
                                                        <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer text-emerald-600 gap-2" onClick={(e) => handlePublish(grade, e)}>
                                                            <Send size={14} /> Publish
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer text-rose-600 gap-2" onClick={(e) => handleDeleteClick(grade, e)}>
                                                        <Trash2 size={14} /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* Sliding Pagination Control */}
      {filteredGrades.length > 0 && (
          <div className="px-8 py-6 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
              <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredGrades.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  primaryColor={primaryColor}
              />
          </div>
      )}

      <GradeEntryModal 
        isOpen={isEntryModalOpen} 
        onClose={() => setIsEntryModalOpen(false)} 
        schoolId={schoolId}
      />
      <GradeUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        schoolId={schoolId}
      />
      <GradeUploadInstructionsModal
        isOpen={isUploadInstructionsModalOpen}
        onClose={() => setIsUploadInstructionsModalOpen(false)}
        onProceed={proceedToUpload}
      />
      <GradeOCRModal 
        isOpen={isOCRModalOpen} 
        onClose={() => setIsOCRModalOpen(false)} 
        schoolId={schoolId}
      />

        {/* Bulk Clear Confirmation Dialog */}
        <Dialog open={isBulkDeleteOpen} onOpenChange={(open) => !deleteMutation.isPending && setIsBulkDeleteOpen(open)}>
          <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-900/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl">
                  <AlertTriangle size={24} />
                </div>
                <DialogTitle className="text-xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">
                  Clear Selected Grades
                </DialogTitle>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <DialogDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to clear <span className="font-black text-slate-900 dark:text-white">{selectedIds.length}</span> selected grade {selectedIds.length === 1 ? 'record' : 'records'}? This action cannot be undone.
              </DialogDescription>
            </div>
            <DialogFooter className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <Button variant="outline" disabled={deleteMutation.isPending} onClick={() => setIsBulkDeleteOpen(false)} className="h-11 px-6 rounded-xl font-medium">
                Cancel
              </Button>
              <Button
                disabled={selectedIds.length === 0 || deleteMutation.isPending}
                onClick={handleBulkDelete}
                className="h-11 px-6 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
              >
                {deleteMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Clearing...</>
                ) : (
                  `Clear ${selectedIds.length} ${selectedIds.length === 1 ? 'Grade' : 'Grades'}`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!gradeToDelete} onOpenChange={(open) => !open && setGradeToDelete(null)}>
          <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-2xl">
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
              <DialogDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
                This action cannot be undone. To proceed, please type <span className="font-black text-slate-900 dark:text-white">{gradeToDelete?.student?.name}</span> to confirm deletion.
              </DialogDescription>
              <Input
                placeholder="Student name"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
              />
            </div>
            <DialogFooter className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setGradeToDelete(null)} className="h-11 px-6 rounded-xl font-medium">
                  Cancel
                </Button>
                <Button
                  disabled={!gradeToDelete || deleteConfirmName !== gradeToDelete.student?.name || deleteMutation.isPending}
                  onClick={handleConfirmDelete}
                  className="h-11 px-6 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
                >
                  {deleteMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                  ) : (
                    'Delete Forever'
                  )}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {/* Grade Edit Modal */}
      <GradeEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        grade={selectedGrade}
      />

      {/* Premium Upgrade Popup */}
      <Dialog open={isUpgradePopupOpen} onOpenChange={setIsUpgradePopupOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 overflow-hidden border-0 shadow-2xl">
          {/* Header with gradient */}
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

          {/* Feature list */}
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
              <Button
                onClick={() => { setIsUpgradePopupOpen(false); window.location.href = '/dashboard/admin/billing'; }}
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Upgrade Your Plan <ArrowRight size={16} />
              </Button>
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
}
