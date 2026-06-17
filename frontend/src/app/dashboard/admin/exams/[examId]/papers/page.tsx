"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { examService } from "@/lib/api/services/examService";
import { CreatePaperForm } from "./components/CreatePaperForm";
import { sessionService } from "@/lib/api/services/sessionService";
import { Copy, FileText, Clock, Users, Check, Loader2, ShieldCheck, ChevronLeft, Settings2, Calendar, Trash2, Link as LinkIcon, Link2Off, Globe, Lock, Unlock, AlertCircle, Shuffle } from "lucide-react";
import { useUnlinkPaper } from "@/lib/api/hooks/useExams";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import AddExistingPaperModal from "../../components/AddExistingPaperModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

export default function ExamPapersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const schoolId = user?.schools?.[0]?.schoolId; // Assuming user is associated with at least one school
  const params = useParams();
  const examId = params.examId as string;

  const queryClient = useQueryClient();

  const { data: exam, isLoading: isLoadingExam, isError: isErrorExam } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => examService.getExamById(examId),
    enabled: !!examId,
  });

  const { data: papers = [], isLoading: isLoadingPapers, isError: isErrorPapers } = useQuery({
    queryKey: ["exam-papers", examId],
    queryFn: () => examService.getExamPapers(examId),
    enabled: !!examId,
  });

  const validateExamMutation = useMutation({
    mutationFn: () => examService.validateExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      toast.success("Exam validated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Exam validation failed");
    }
  });

  const publishExamMutation = useMutation({
    mutationFn: () => examService.publishExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      toast.success("Exam published successfully!");
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Exam publish failed");
    }
  });

  const unpublishExamMutation = useMutation({
    mutationFn: () => examService.unpublishExam(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      toast.success("Exam unpublished successfully!");
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unpublish exam");
    }
  });

  const deleteExamMutation = useMutation({
    mutationFn: () => examService.deleteExam(examId),
    onSuccess: () => {
      router.push("/dashboard/admin/exams");
      toast.success("Exam deleted successfully");
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete exam");
    }
  });

  const unpublishPaperMutation = useMutation({
    mutationFn: (paperId: string) => examService.unpublishPaper(examId, paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-papers", examId] });
      toast.success("Subject paper unpublished!");
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to unpublish paper");
    }
  });

  const unlinkPaperMutation = useUnlinkPaper(examId);

  const { data: attempts = [], isLoading: isLoadingAttempts } = useQuery({
    queryKey: ["exam-attempts", examId],
    queryFn: () => examService.getExamAttempts(examId),
    enabled: !!examId,
  });

  const [attemptsPage, setAttemptsPage] = useState(1);
  const ATTEMPTS_PER_PAGE = 10;
  const totalAttemptsPages = Math.ceil(attempts.length / ATTEMPTS_PER_PAGE);
  const paginatedAttempts = attempts.slice((attemptsPage - 1) * ATTEMPTS_PER_PAGE, attemptsPage * ATTEMPTS_PER_PAGE);

  const deleteAttemptMutation = useMutation({
    mutationFn: (studentId: string) => examService.deleteExamAttempt(examId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-attempts", examId] });
      toast.success("Student record cleared. They can now retake the exam.");
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete attempt");
    }
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant: "danger" | "warning";
    confirmText: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    variant: "danger",
    confirmText: "Confirm",
  });

  const openConfirmDialog = (config: Partial<typeof confirmDialog>) => {
    setConfirmDialog({
      ...confirmDialog,
      ...config,
      isOpen: true,
    });
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [examSettings, setExamSettings] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    resultReleaseAt: "",
    allowImmediateResult: false,
    shuffleQuestions: false,
    scope: "SCHOOL",
    classId: "",
    departmentIds: [] as string[],
    durationMinutes: 0,
    sessionId: "",
    term: "",
    teacherId: "",
  });

  // Use the school ID associated with the exam for all contextual fetches
  const activeSchoolId = user?.schools?.[0]?.schoolId|| schoolId;

  // Fetch Classes for the selector
  const { data: classesData } = useQuery({
    queryKey: ["school-classes", activeSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/classes?schoolId=${activeSchoolId}`);
      return data.data || [];
    },
    enabled: isSettingsOpen && !!activeSchoolId,
  });

  // Fetch Departments for the selector
  const { data: departmentsData } = useQuery({
    queryKey: ["school-departments", activeSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/academic/departments?schoolId=${activeSchoolId}`);
      return data.data || [];
    },
    enabled: isSettingsOpen && !!activeSchoolId,
  });

  // Fetch Sessions for the selector
  const { data: sessionsData } = useQuery({
    queryKey: ["school-sessions", activeSchoolId],
    queryFn: () => sessionService.getSessions(),
    enabled: isSettingsOpen && !!activeSchoolId,
  });

  // Sync settings when scope changes
  useEffect(() => {
    if (examSettings.scope === "SCHOOL") {
      // For school scope, class and department are optional filters
    } else if (examSettings.scope === "CLASS") {
      setExamSettings(prev => ({ ...prev, departmentIds: [] }));
    } else if (examSettings.scope === "DEPARTMENT") {
      setExamSettings(prev => ({ ...prev, classId: "" }));
    }

    if (examSettings.allowImmediateResult) {
      setExamSettings(prev => ({ ...prev, resultReleaseAt: "" }));
    }
  }, [examSettings.scope, examSettings.allowImmediateResult]);

  useEffect(() => {
    if (exam && isSettingsOpen) {
      setExamSettings({
        title: exam.title || "",
        description: exam.description || "",
        startDate: exam.startDate ? new Date(exam.startDate).toISOString().slice(0, 16) : "",
        endDate: exam.endDate ? new Date(exam.endDate).toISOString().slice(0, 16) : "",
        resultReleaseAt: exam.resultReleaseAt ? new Date(exam.resultReleaseAt).toISOString().slice(0, 16) : "",
        allowImmediateResult: !!exam.allowImmediateResult,
        scope: exam.scope || "SCHOOL",
        classId: exam.classId || "",
        departmentIds: exam.departments?.map((d: any) => d.departmentId || d.department?.id) || [],
        durationMinutes: exam.durationMinutes || 0,
        sessionId: exam.sessionId || "",
        term: exam.term || "",
        teacherId: exam.teacherId || "",
        shuffleQuestions: !!exam.shuffleQuestions,
      });
    }
  }, [exam, isSettingsOpen]);

  const updateExamMutation = useMutation({
    mutationFn: (data: any) => examService.updateExam(examId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      toast.success("Exam settings updated!");
      setIsSettingsOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update exam settings");
    }
  });

  const allPapersPublished = papers.length > 0 && papers.every(p => p.status === "PUBLISHED");
  const isPublished = exam?.status === "PUBLISHED";
  const { data: subjectResponse, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["all-subjects"],
    queryFn: async () => {
      const { data } = await apiClient.get(`/academic/subjects?schoolId=${activeSchoolId}`);
      // Based on your previous session data structure, 
      // your API likely wraps the array in a 'data' property
      return data.data || data;
    },
  });

  // 2. Fetch Teachers
  const { data: teacherResponse, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["all-teachers", activeSchoolId],
    queryFn: async () => {
      // console.log("Fetching teachers for school ID:", activeSchoolId); // Debug log
      // Adjust this URL to match your actual backend route
      const { data } = await apiClient.get(`/schools/${activeSchoolId}/teachers`);
      return data.data || data;
    },
    enabled: !!activeSchoolId,
  });
  const copyExamId = () => {
    navigator.clipboard.writeText(examId);
    toast.success("Exam ID copied!");
  };

  if (isLoadingExam) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] lg:col-span-1 border rounded-xl" />
          <Skeleton className="h-[400px] lg:col-span-2 border rounded-xl" />
        </div>
      </div>
    );
  }

  if (isErrorExam) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          Error loading exam details. This exam might not exist or you lack permissions.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 -mx-6 md:-mx-8 px-6 md:px-8 py-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/admin/exams')}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  {exam?.title || "Exam Papers"}
                </h1>
                {isPublished ? (
                  <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded uppercase border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-1">
                    <Check size={10} /> Published
                  </span>
                ) : (
                  <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase border border-primary/20">
                    {exam?.status || "DRAFT"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-muted-foreground text-xs font-bold mt-1">
                <div className="flex items-center gap-2">
                  <span>ID: <span className="font-mono">{examId}</span></span>
                  <button onClick={copyExamId} className="hover:text-primary transition-colors">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                {exam?.startDate && (
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Calendar size={12} />
                    Starts: {format(new Date(exam.startDate), "MMM d, yyyy h:mm a")}
                  </div>
                )}
                {exam?.durationMinutes && (
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock size={12} />
                    {exam.durationMinutes} min
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-6 pr-4 border-r border-gray-100 dark:border-gray-800 hidden sm:flex">
              <div className="flex flex-col items-end">
                <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                  {papers.reduce((sum, p) => sum + (p.totalMarks || 0), 0)}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total Marks</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                  {papers.reduce((sum, p) => sum + (p.durationMinutes || 0), 0)}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total Mins</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Administration & Create Form */}
        {/* Left Column: Create Form & Administration */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          {/* Create Subject Paper Form Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm overflow-hidden relative">
            <h2 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary" /> Add Subject Paper
            </h2>
            <CreatePaperForm
              examId={examId}
              subjects={Array.isArray(subjectResponse) ? subjectResponse : []}
              isLoadingData={isLoadingSubjects || isLoadingTeachers}
              teachers={Array.isArray(teacherResponse) ? teacherResponse : []}
            />

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Link</h3>
              <AddExistingPaperModal 
                examId={examId} 
                trigger={
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-2xl border-dashed border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                    <LinkIcon className="h-4 w-4" />
                    <span className="text-sm font-bold">Link Existing Paper</span>
                  </Button>
                }
              />
              <p className="text-[10px] text-slate-400 mt-3 text-center font-medium">
                Link papers from other exams or drafts.
              </p>
            </div>
          </div>

          {/* Exam Administration Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck size={80} />
            </div>
            
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Settings2 size={16} className="text-primary" /> Exam Administration
            </h2>

            <div className="space-y-4 relative z-10">
              {!isPublished ? (
                <Button
                  onClick={() => openConfirmDialog({
                    title: "Publish Examination",
                    description: `Are you sure you want to publish "${exam?.title}"? Once published, eligible students will immediately gain access to the exam.`,
                    variant: "warning",
                    confirmText: "Publish Exam",
                    onConfirm: () => publishExamMutation.mutate()
                  })}
                  disabled={publishExamMutation.isPending || !allPapersPublished}
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-base shadow-xl shadow-primary/25 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {publishExamMutation.isPending ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      <Globe size={20} />
                      Publish Examination
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => openConfirmDialog({
                    title: "Unpublish Exam",
                    description: `Are you sure you want to unpublish "${exam?.title}"? Student access will be restricted immediately.`,
                    variant: "warning",
                    confirmText: "Unpublish",
                    onConfirm: () => unpublishExamMutation.mutate(undefined, {
                      onSuccess: () => {
                        setIsSettingsOpen(false);
                        setConfirmDialog({ ...confirmDialog, isOpen: false });
                      },
                      onError: (error: any) => {
                        toast.error(error.response?.data?.message || "Failed to unpublish exam");
                      }
                    })
                  })}
                  disabled={unpublishExamMutation.isPending}
                  className="w-full h-14 rounded-2xl border-amber-200 text-amber-600 hover:bg-amber-50 font-black text-base flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                >
                  {unpublishExamMutation.isPending ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      <Lock size={20} />
                      Unpublish Exam
                    </>
                  )}
                </Button>
              )}

              {!allPapersPublished && !isPublished && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-4">
                  <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-tight">
                    All subject papers must be published before the full examination can be released.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full h-12 rounded-2xl font-bold flex gap-2 border-slate-200 hover:border-primary/50 hover:text-primary transition-all">
                      <Settings2 size={16} /> Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl w-[95vw] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl focus:outline-none">
                    <div className="bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-8 pb-0">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Settings2 size={20} />
                          </div>
                          Edit Exam Settings
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium ml-11">
                          Refine the global parameters and targeting for this examination.
                        </DialogDescription>
                      </DialogHeader>
                    </div>

                    <div className="p-8 pt-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-slate-400">General Information</Label>
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <Label htmlFor="title" className="text-xs font-bold text-slate-600">Exam Title</Label>
                                <Input
                                  id="title"
                                  className="rounded-2xl border-slate-200 focus:ring-primary/20 h-12"
                                  value={examSettings.title}
                                  onChange={(e) => setExamSettings({ ...examSettings, title: e.target.value })}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-xs font-bold text-slate-600">Instructions / Description</Label>
                                <Textarea
                                  id="description"
                                  className="rounded-2xl border-slate-200 focus:ring-primary/20 min-h-[120px] resize-none"
                                  value={examSettings.description}
                                  onChange={(e) => setExamSettings({ ...examSettings, description: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Timing & Schedule</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label htmlFor="startDate" className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                  <Calendar size={14} className="text-primary" /> Start Date
                                </Label>
                                <Input
                                  id="startDate"
                                  type="datetime-local"
                                  className="rounded-2xl border-slate-200 h-12"
                                  value={examSettings.startDate}
                                  onChange={(e) => setExamSettings({ ...examSettings, startDate: e.target.value })}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="endDate" className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                  <Calendar size={14} className="text-rose-500" /> End Date
                                </Label>
                                <Input
                                  id="endDate"
                                  type="datetime-local"
                                  className="rounded-2xl border-slate-200 h-12"
                                  value={examSettings.endDate}
                                  onChange={(e) => setExamSettings({ ...examSettings, endDate: e.target.value })}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="duration" className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                  <Clock size={14} className="text-primary" /> Duration (Mins)
                                </Label>
                                <Input
                                  id="duration"
                                  type="number"
                                  className="rounded-2xl border-slate-200 h-12"
                                  value={examSettings.durationMinutes}
                                  onChange={(e) => setExamSettings({ ...examSettings, durationMinutes: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-600">Result Visibility</Label>
                                <select 
                                  className="w-full h-12 rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                  value={examSettings.allowImmediateResult ? "immediate" : "scheduled"}
                                  onChange={(e) => setExamSettings({ ...examSettings, allowImmediateResult: e.target.value === "immediate" })}
                                >
                                  <option value="immediate">Show results immediately</option>
                                  <option value="scheduled">Release on specific date</option>
                                </select>
                              </div>
                              {!examSettings.allowImmediateResult && (
                                <div className="space-y-1.5">
                                  <Label htmlFor="resultReleaseAt" className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                    <Calendar size={14} className="text-purple-500" /> Result Release Date
                                  </Label>
                                  <Input
                                    id="resultReleaseAt"
                                    type="datetime-local"
                                    className="rounded-2xl border-slate-200 h-12"
                                    value={examSettings.resultReleaseAt}
                                    onChange={(e) => setExamSettings({ ...examSettings, resultReleaseAt: e.target.value })}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3 p-6 bg-primary/5 dark:bg-primary/10 rounded-[2rem] border border-primary/10">
                            <Label className="text-xs font-black uppercase tracking-widest text-primary/60">Exam Integrity</Label>
                            <div className="flex items-center justify-between gap-4">
                              <div className="space-y-0.5">
                                <Label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                  <Shuffle size={14} className="text-primary" /> Shuffle Questions
                                </Label>
                                <p className="text-[10px] text-slate-500 font-medium">Randomize question order for every student attempt.</p>
                              </div>
                              <Switch 
                                checked={examSettings.shuffleQuestions}
                                onCheckedChange={(checked) => setExamSettings({ ...examSettings, shuffleQuestions: checked })}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-3 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Targeting & Scope</Label>
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-slate-600">Exam Scope</Label>
                                <select 
                                  className="w-full h-12 rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                  value={examSettings.scope}
                                  onChange={(e) => setExamSettings({ ...examSettings, scope: e.target.value as any })}
                                >
                                  <option value="SCHOOL">Whole School</option>
                                  <option value="CLASS">By Class Group</option>
                                  <option value="DEPARTMENT">By Academic Department</option>
                                </select>
                              </div>

                              <div className="space-y-4">
                                <div className="space-y-1.5 flex flex-col">
                                  <Label className="text-xs font-bold text-blue-600">Target Class</Label>
                                  <select 
                                    className="w-full h-12 rounded-2xl border border-blue-100 bg-white dark:bg-slate-900 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                                    value={examSettings.classId}
                                    onChange={(e) => setExamSettings({ ...examSettings, classId: e.target.value })}
                                  >
                                    <option value="">No specific class</option>
                                    {classesData?.map((c: any) => (
                                      <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-[10px] uppercase tracking-widest font-black text-purple-500">
                                      Target Departments (Optional) {examSettings.classId && "for selected class"}
                                    </Label>
                                    <span className="text-[10px] font-bold text-slate-400">
                                      {examSettings.departmentIds?.length || 0} Selected
                                    </span>
                                  </div>
                                  
                                  {departmentsData && departmentsData.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                      {departmentsData.map((d: any) => {
                                        const isSelected = examSettings.departmentIds?.includes(d.id);
                                        return (
                                          <div 
                                            key={d.id}
                                            onClick={() => {
                                              const current = examSettings.departmentIds || [];
                                              const next = current.includes(d.id) 
                                                ? current.filter((id) => id !== d.id)
                                                : [...current, d.id];
                                              setExamSettings({ ...examSettings, departmentIds: next });
                                            }}
                                            className={`cursor-pointer group flex items-center gap-2 p-2 rounded-2xl border-2 transition-all ${
                                              isSelected 
                                                ? "bg-purple-50 border-purple-500/50 text-purple-700 shadow-sm shadow-purple-100" 
                                                : "bg-slate-50 shadow-none border-slate-100 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                                            }`}
                                          >
                                            <div className={`w-5 h-5 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors ${
                                              isSelected ? "bg-purple-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-transparent"
                                            }`}>
                                              <Check size={12} strokeWidth={3} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                              <span className="text-xs font-bold truncate leading-tight">{d.name}</span>
                                              <span className="text-[10px] uppercase font-black opacity-50 tracking-tighter">{d.code}</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="h-14 flex items-center px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] italic border border-dashed border-slate-200">
                                      {activeSchoolId ? "No departments found for this selection" : "Select a school first"}
                                    </div>
                                  )}
                                  <p className="text-[10px] text-slate-500 font-medium">Leave empty for a class-wide or school-wide general exam.</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Academic Context</Label>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-bold text-emerald-600">Session</Label>
                                  <select 
                                    className="w-full h-12 rounded-2xl border border-emerald-100 bg-white dark:bg-slate-900 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                                    value={examSettings.sessionId}
                                    onChange={(e) => setExamSettings({ ...examSettings, sessionId: e.target.value })}
                                  >
                                    <option value="">No specific session</option>
                                    {sessionsData?.map((s: any) => (
                                      <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-xs font-bold text-orange-600">Term</Label>
                                  <select 
                                    className="w-full h-12 rounded-2xl border border-orange-100 bg-white dark:bg-slate-900 px-4 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
                                    value={examSettings.term}
                                    onChange={(e) => setExamSettings({ ...examSettings, term: e.target.value as any })}
                                  >
                                    <option value="">No specific term</option>
                                    <option value="FIRST">First Term</option>
                                    <option value="SECOND">Second Term</option>
                                    <option value="THIRD">Third Term</option>
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-blue-600">Assigned Global Teacher</Label>
                                <select 
                                  className="w-full h-12 rounded-2xl border border-blue-100 bg-white dark:bg-slate-900 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                                  value={examSettings.teacherId}
                                  onChange={(e) => setExamSettings({ ...examSettings, teacherId: e.target.value })}
                                >
                                  <option value="">No global teacher assigned</option>
                                  {Array.isArray(teacherResponse) && teacherResponse.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                                  {Array.isArray(teacherResponse?.data) && teacherResponse.data.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                      <DialogFooter className="w-full flex sm:justify-between items-center sm:gap-0 gap-4">
                        <p className="text-[11px] text-slate-400 font-medium max-w-[300px] leading-tight hidden sm:block">
                          Careful! Updating scope or targeting will immediately affect student visibility.
                        </p>
                        <div className="flex gap-3 ml-auto">
                          <Button
                            variant="outline"
                            onClick={() => setIsSettingsOpen(false)}
                            className="rounded-2xl font-bold h-12 px-6"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => updateExamMutation.mutate(examSettings)}
                            disabled={updateExamMutation.isPending}
                            className="rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 h-12 px-8"
                          >
                            {updateExamMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                            Save Changes
                          </Button>
                        </div>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={() => openConfirmDialog({
                    title: exam?.allowImmediateResult ? "Hide Grades" : "Publish Grades",
                    description: exam?.allowImmediateResult 
                      ? "Are you sure you want to hide grades? Students will no longer be able to see their results."
                      : "Are you sure you want to publish grades? All students will immediately be able to see their results.",
                    variant: exam?.allowImmediateResult ? "warning" : "warning",
                    confirmText: exam?.allowImmediateResult ? "Hide Grades" : "Publish Grades",
                    onConfirm: () => updateExamMutation.mutate({ allowImmediateResult: !exam?.allowImmediateResult }, {
                      onSuccess: () => {
                        setConfirmDialog({ ...confirmDialog, isOpen: false });
                      },
                      onError: (error: any) => {
                        toast.error(error.response?.data?.message || "Failed to update grades visibility");
                      }
                    })
                  })}
                  disabled={updateExamMutation.isPending}
                  className={`w-full h-12 rounded-2xl font-bold flex gap-2 transition-all ${
                    exam?.allowImmediateResult 
                      ? "border-amber-100 text-amber-600 hover:bg-amber-50"
                      : "border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                  }`}
                >
                  {exam?.allowImmediateResult ? <Lock size={16} /> : <Unlock size={16} />}
                  {exam?.allowImmediateResult ? "Hide Grades" : "Publish Grades"}
                </Button>

                {user?.userType === "ADMIN" && (
                  <Button
                    variant="outline"
                    onClick={() => openConfirmDialog({
                      title: "Delete Exam",
                      description: `This will permanently delete "${exam?.title}" and all its subject papers. This action cannot be undone.`,
                      variant: "danger",
                      confirmText: "Delete Exam",
                      onConfirm: () => deleteExamMutation.mutate(undefined, {
                        onSuccess: () => {
                          setConfirmDialog({ ...confirmDialog, isOpen: false });
                        },
                        onError: (error: any) => {
                          toast.error(error.response?.data?.message || "Failed to delete exam");
                        }
                      })
                    })}
                    disabled={deleteExamMutation.isPending}
                    className="col-span-2 w-full h-12 rounded-2xl font-bold flex gap-2 border-red-100 text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={16} /> Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Right Column: Papers List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              Subject Papers <span className="text-primary ml-1">({papers.length})</span>
            </h2>
          </div>

          {isLoadingPapers ? (
            <div className="grid grid-cols-1 gap-4">
              <Skeleton className="h-32 w-full rounded-3xl" />
              <Skeleton className="h-32 w-full rounded-3xl" />
            </div>
          ) : isErrorPapers ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="font-bold">Failed to load examination papers.</p>
            </div>
          ) : papers.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[2.5rem] p-16 text-center flex flex-col items-center">
              <div className="h-16 w-16 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-6">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">No papers yet</h3>
              <p className="text-gray-500 text-sm mt-2 max-w-sm font-medium">
                Get started by creating a subject paper using the form on the left.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {papers.map((paper) => {
                const isTeacher = user?.userType === "TEACHER";
                const isAdmin = user?.userType === "ADMIN";
                const isAssignedTeacher = paper.teacherId === user?.id;
                const canAccess = isAdmin || (isTeacher && isAssignedTeacher);

                return (
                  <div
                    key={paper.id}
                    onClick={() => {
                      if (canAccess) {
                        router.push(`/dashboard/admin/exams/${examId}/papers/${paper.id}`);
                      } else {
                        toast.info("Only the assigned teacher or an admin can manage this paper.");
                      }
                    }}
                    className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 transition-all group ${canAccess ? "hover:border-primary/50 cursor-pointer hover:shadow-xl hover:shadow-primary/5" : "opacity-80 grayscale-[0.5]"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${canAccess ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white" : "bg-gray-100 text-gray-400"}`}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <h3 className={`text-lg font-black tracking-tight ${canAccess ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                            {paper.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 uppercase">
                              {paper.status}
                            </span>
                            {!canAccess && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-black flex items-center gap-1 uppercase tracking-tighter border border-amber-100"><Lock size={10} /> Locked</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {canAccess && paper.status === "PUBLISHED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl"
                            onClick={(e) => {
                              e.stopPropagation();
                              openConfirmDialog({
                                title: "Unpublish Paper",
                                description: `Are you sure you want to unpublish "${paper.title}"? It will be moved back to draft.`,
                                variant: "warning",
                                confirmText: "Unpublish",
                                onConfirm: () => unpublishPaperMutation.mutate(paper.id, {
                                  onSuccess: () => {
                                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                                  },
                                  onError: (error: any) => {
                                    toast.error(error.response?.data?.message || "Failed to unpublish paper");
                                  }
                                })
                              });
                            }}
                          >
                            {unpublishPaperMutation.isPending && unpublishPaperMutation.variables === paper.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Unlock size={18} />}
                          </Button>
                        )}
                        {canAccess && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                            onClick={(e) => {
                              e.stopPropagation();
                              openConfirmDialog({
                                title: "Unlink Paper",
                                description: `This will remove "${paper.title}" from this exam. The paper can be linked later from the "Quick Link" section.`,
                                variant: "warning",
                                confirmText: "Unlink Paper",
                                onConfirm: () => unlinkPaperMutation.mutate(paper.id, {
                                  onSuccess: () => {
                                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                                  },
                                })
                              });
                            }}
                          >
                            {unlinkPaperMutation.isPending && unlinkPaperMutation.variables === paper.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Link2Off size={18} />}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 text-xs font-bold text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                          <Clock size={12} className="text-primary" />
                        </div>
                        {paper.durationMinutes} minutes
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-blue-50 dark:bg-blue-800 flex items-center justify-center border border-blue-100 dark:border-blue-700">
                          <Users size={12} className="text-blue-500" />
                        </div>
                        {paper.teacherId ? (paper.teacherId === user?.id ? "You (Assigned)" : "Assigned Teacher") : "Unassigned"}
                      </div>
                      <div className="ml-auto text-gray-400 font-medium">
                          Updated {format(new Date((paper as any).updatedAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Participants Section */}
      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                Exam Participants <span className="text-primary ml-1">({attempts.length})</span>
              </h2>
              <p className="text-xs font-medium text-muted-foreground">Students who have started or submitted this examination.</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] overflow-hidden shadow-sm">
          {isLoadingAttempts ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          ) : attempts.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="h-16 w-16 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 mb-4">
                <Users size={32} />
              </div>
              <p className="text-gray-500 font-bold">No students have attempted this exam yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Name</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Progress</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Score</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {paginatedAttempts.map((attempt: any) => (
                    <tr key={attempt.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 dark:text-white">{attempt.student?.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{attempt.student?.studentCode}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${
                          attempt.status === 'SCORED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          attempt.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          attempt.status === 'EXPIRED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {attempt.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className="text-xs font-bold text-gray-600">
                          {(attempt.subjectExamAttempts || attempt.subjectAttempts)?.length || 0} / {papers.length} Papers
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className="text-sm font-black text-primary">
                          {attempt.totalScore} <span className="text-slate-300">/</span> {attempt.totalMarks}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfirmDialog({
                            title: "Clear Student Record",
                            description: `Are you sure you want to delete ${attempt.student?.name}'s attempt? This will permanently remove their answers and allow them to take the exam again.`,
                            variant: "danger",
                            confirmText: "Clear & Reset",
                            onConfirm: () => deleteAttemptMutation.mutate(attempt.studentId)
                          })}
                          className="h-9 rounded-xl text-red-600 hover:bg-red-50 font-bold text-xs flex items-center gap-2 ml-auto"
                        >
                          <Trash2 size={14} /> Clear Record
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalAttemptsPages > 1 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAttemptsPage(prev => Math.max(prev - 1, 1))} 
                    disabled={attemptsPage === 1}
                    className="rounded-xl font-bold h-9 px-4"
                  >
                    Previous
                  </Button>
                  <span className="text-xs font-bold text-slate-500">
                    Page {attemptsPage} of {totalAttemptsPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setAttemptsPage(prev => Math.min(prev + 1, totalAttemptsPages))} 
                    disabled={attemptsPage === totalAttemptsPages}
                    className="rounded-xl font-bold h-9 px-4"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        isLoading={
          publishExamMutation.isPending ||
          unpublishExamMutation.isPending || 
          deleteExamMutation.isPending || 
          unpublishPaperMutation.isPending || 
          unlinkPaperMutation.isPending ||
          deleteAttemptMutation.isPending ||
          updateExamMutation.isPending
        }
      />
    </div>
  );
}
