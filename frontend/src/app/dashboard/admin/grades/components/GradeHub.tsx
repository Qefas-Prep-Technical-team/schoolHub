

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
  ArrowRight
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
  const itemsPerPage = 6; // Set to 6 to stay premium and consistent

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<any | null>(null);
  const [gradeToDelete, setGradeToDelete] = useState<any | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
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
    const studentId = grade.student?.id || grade.studentId;
    if (grade.examId && onOpenExam) {
      onOpenExam(grade.examId, studentId);
    } else {
      router.push(`/dashboard/admin/students/${studentId}?tab=academic`);
    }
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
      const t = g.category || g.assessmentType;
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
        (g.category || g.assessmentType)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.exam?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.subjectPaper?.title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = selectedType === 'all' || (g.category || g.assessmentType) === selectedType;
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 w-full">
          {/* Text Search */}
          <div className="relative group flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" style={{ color: searchTerm ? primaryColor : undefined } as any} />
              <Input 
                  type="text" 
                  placeholder="Search students, subjects, categories..."
                  value={searchTerm}
                  onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                  }}
                  className="w-full pl-12 h-12 bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 transition-all font-bold"
                  style={{ '--tw-ring-color': `${primaryColor}20`, borderColor: searchTerm ? primaryColor : undefined } as any}
              />
          </div>

          {/* Assessment/Exam Type Filter */}
          <div className="w-full sm:w-44">
            <Select value={selectedType} onValueChange={(val) => { setSelectedType(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 font-bold focus:ring-4 transition-all" style={{ '--tw-ring-color': `${primaryColor}20` } as any}>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Filter */}
          <div className="w-full sm:w-44">
            <Select value={selectedSubject} onValueChange={(val) => { setSelectedSubject(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 font-bold focus:ring-4 transition-all" style={{ '--tw-ring-color': `${primaryColor}20` } as any}>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Filter */}
          <div className="w-full sm:w-44">
            <Select value={selectedClass} onValueChange={(val) => { setSelectedClass(val); setCurrentPage(1); }}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 font-bold focus:ring-4 transition-all" style={{ '--tw-ring-color': `${primaryColor}20` } as any}>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Layout Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 self-start lg:self-center">
          <div className="flex bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-1.5 shadow-inner">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("size-10 rounded-xl flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600")}
              style={{ color: viewMode === 'grid' ? primaryColor : undefined }}
            >
              <LayoutGrid size={18} strokeWidth={3} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("size-10 rounded-xl flex items-center justify-center transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600")}
              style={{ color: viewMode === 'list' ? primaryColor : undefined }}
            >
              <List size={18} strokeWidth={3} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={handleOpenOCR}
              variant="outline" 
              className="relative rounded-xl h-12 w-12 p-0 font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center group cursor-pointer"
              style={hasOCRAccess ? { color: primaryColor, borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}10` } : {}}
              title={hasOCRAccess ? 'AI Vision Grade Scanner' : 'Upgrade to unlock AI Vision Scanner'}
            >
              {hasOCRAccess ? (
                <Camera size={18} />
              ) : (
                <>
                  <Camera size={18} className="text-slate-400" />
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>
                  </span>
                </>
              )}
            </Button>
            <Button 
              onClick={handleOpenUploadModal}
              variant="outline" 
              className="rounded-xl h-12 w-12 p-0 font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center"
              title="Batch Upload"
            >
              <FileUp size={18} />
            </Button>
            <Button 
              onClick={() => setIsEntryModalOpen(true)}
              className="rounded-xl h-12 px-6 font-black uppercase tracking-widest hover:opacity-90 shadow-lg active:scale-95 transition-all text-white whitespace-nowrap text-xs"
              style={{ backgroundColor: primaryColor, boxShadow: `0 10px 15px -3px ${primaryColor}40` }}
            >
              <Plus size={18} className="mr-1.5" /> Create
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
      {isLoading ? (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            : "space-y-4"
        )}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : paginatedGrades.length === 0 ? (
        <div className="text-center py-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-400">
          <AlertCircle size={40} />
          <span className="text-xs font-black uppercase tracking-widest">No student grades found matching criteria</span>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedGrades.map((grade: any) => {
            const percent = Math.round((grade.score / grade.maxMarks) * 100);
            
            const isPassed = percent >= 50;
            const theme = isPassed ? {
                border: 'border-emerald-500/20 hover:border-emerald-500/50',
                bg: 'bg-gradient-to-br from-white to-emerald-50 dark:from-slate-900 dark:to-emerald-950/20',
                textHighlight: 'text-emerald-600 dark:text-emerald-400',
                iconBg: 'bg-emerald-500 text-white shadow-emerald-500/30',
                progress: 'bg-emerald-500',
                accentColor: 'bg-emerald-500'
            } : {
                border: 'border-amber-500/20 hover:border-amber-500/50',
                bg: 'bg-gradient-to-br from-white to-amber-50 dark:from-slate-900 dark:to-amber-950/20',
                textHighlight: 'text-amber-600 dark:text-amber-400',
                iconBg: 'bg-amber-500 text-white shadow-amber-500/30',
                progress: 'bg-amber-500',
                accentColor: 'bg-amber-500'
            };

            return (
              <div 
                key={grade.id} 
                onClick={() => handleGradeClick(grade)}
                className={`group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer rounded-3xl border ${theme.border} ${theme.bg} min-h-[260px] flex flex-col justify-between`}
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 ${theme.accentColor}`} />
                <div className="p-7 relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3.5 rounded-2xl shadow-lg transition-transform duration-500 group-hover:-rotate-6 ${theme.iconBg}`}>
                                <FileText className="h-6 w-6" strokeWidth={2.5} />
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {(grade.status === 'PUBLISHED' || grade.examAttemptId || grade.subjectExamAttemptId) ? (
                                    <span className="px-3 py-1 text-[11px] font-black uppercase tracking-widest rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        Published
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 text-[11px] font-black uppercase tracking-widest rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                        Draft
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className={`font-black text-2xl mb-1 text-slate-900 dark:text-white line-clamp-1 transition-colors group-hover:${theme.textHighlight}`}>
                                {grade.student?.name}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">
                                Lvl {grade.student?.gradeLevel} • {grade.class?.name || 'Class'}{grade.class?.section || ''}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 mt-2">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subject</span>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <span className="truncate">{grade.subject}</span>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</span>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <span className="truncate">{grade.category || grade.assessmentType || 'Assessment'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-white/10 mt-6">
                        <div className="space-y-1.5 flex-1 pr-4">
                            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none flex items-baseline">
                                {grade.score}<span className="text-xs text-slate-400 ml-1">/{grade.maxMarks}</span>
                            </span>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${theme.progress}`} 
                                    style={{ width: `${percent}%` }} 
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 w-10 p-0 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary transition-all" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical size={18} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-2xl border-slate-200 dark:border-slate-800 w-48 p-2 shadow-2xl">
                                <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); setSelectedGrade(grade); setIsEditModalOpen(true); }}>
                                  <Edit size={14} /> Edit Grade
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); setSelectedGrade(grade); }}>
                                  <Eye size={14} /> View Details
                                </DropdownMenuItem>
                                {grade.status !== 'PUBLISHED' && !grade.examAttemptId && !grade.subjectExamAttemptId && (
                                  <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer text-emerald-600 gap-2" onClick={(e) => handlePublish(grade, e)}>
                                    <Send size={14} /> Publish Now
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer text-rose-600 gap-2" onClick={(e) => handleDeleteClick(grade, e)}>
                                  <Trash2 size={14} /> Delete Record
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Unified List View (matches SubjectPapersView) */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm divide-y divide-slate-200 dark:divide-slate-800">
            {paginatedGrades.map((grade: any, index: number) => {
                const percent = Math.round((grade.score / grade.maxMarks) * 100);
                
                return (
                    <div 
                        key={grade.id}
                        onClick={() => handleGradeClick(grade)}
                        className="group relative overflow-hidden transition-all duration-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 lg:gap-8 hover:border-primary/30"
                    >
                        <div className="flex items-center gap-4 lg:gap-6 w-full sm:w-auto">
                            <div className="text-sm font-bold text-slate-400 w-6 text-center shrink-0 hidden sm:block">
                                {index + 1 + (currentPage - 1) * itemsPerPage}.
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0">
                                <User size={20} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate flex items-center gap-2">
                                    {grade.student?.name}
                                    <span className="sm:hidden text-xs text-slate-400 font-bold">#{index + 1 + (currentPage - 1) * itemsPerPage}</span>
                                </h3>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-xs text-slate-500 font-medium">Lvl {grade.student?.gradeLevel} • {grade.class?.name || 'Class'}</span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span className="text-xs text-slate-500 font-medium truncate flex items-center gap-1"><FileText size={12} /> {grade.subject}</span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span className="text-xs text-slate-500 font-medium">{grade.category || grade.assessmentType}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-16 sm:pl-0">
                            <div className="flex flex-col sm:items-end">
                                <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
                                    {grade.score}<span className="text-[10px] text-slate-400">/{grade.maxMarks}</span>
                                </span>
                                <div className="w-16 h-1 rounded-full bg-slate-100 dark:bg-slate-800 mt-1.5 overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: primaryColor }} />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {(grade.status === 'PUBLISHED' || grade.examAttemptId || grade.subjectExamAttemptId) ? (
                                    <span className="hidden sm:inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                        Published
                                    </span>
                                ) : (
                                    <span className="hidden sm:inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                        Draft
                                    </span>
                                )}

                                <div onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all duration-300 shrink-0">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl border-slate-200 dark:border-slate-800 w-48 p-2 shadow-2xl">
                                            <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer gap-2" onClick={(e) => { e.stopPropagation(); setSelectedGrade(grade); setIsEditModalOpen(true); }}>
                                                <Edit size={14} /> Edit Grade
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer gap-2" onClick={(e) => handleGradeClick(grade, e)}>
                                                <Eye size={14} /> View Details
                                            </DropdownMenuItem>
                                            {grade.status !== 'PUBLISHED' && !grade.examAttemptId && !grade.subjectExamAttemptId && (
                                                <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer text-emerald-600 gap-2" onClick={(e) => handlePublish(grade, e)}>
                                                    <Send size={14} /> Publish Now
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer text-rose-600 gap-2" onClick={(e) => handleDeleteClick(grade, e)}>
                                                <Trash2 size={14} /> Delete Record
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
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
            <DialogFooter className="mt-6 flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setGradeToDelete(null)} className="min-w-[80px]">
                  Cancel
                </Button>
                <Button
                  disabled={!gradeToDelete || deleteConfirmName !== gradeToDelete.student?.name}
                  onClick={handleConfirmDelete}
                  className="bg-rose-600 hover:bg-rose-700 min-w-[120px]"
                >
                  Delete Forever
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
