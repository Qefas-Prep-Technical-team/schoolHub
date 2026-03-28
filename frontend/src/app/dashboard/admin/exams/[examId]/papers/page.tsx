"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { examService } from "@/lib/api/services/examService";
import { CreatePaperForm } from "./components/CreatePaperForm";
import { Copy, FileText, Clock, Users, Check, Loader2, ShieldCheck, ChevronLeft, Settings2, Calendar, Trash2, Link as LinkIcon, Link2Off } from "lucide-react";
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
import ConfirmationModal from "../../components/ui/ConfirmationModal";

export default function ExamPapersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const schoolId = user?.defaultTenantId;
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
    scope: "SCHOOL",
    classId: "",
    departmentId: "",
    durationMinutes: 0,
  });

  // Use the school ID associated with the exam for all contextual fetches
  const activeSchoolId = exam?.schoolId || schoolId;

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

  // Sync settings when scope changes (Optional: keeping it flexible as per request)
  useEffect(() => {
    if (examSettings.scope === "SCHOOL") {
      // For school scope, class and department are optional filters
    } else if (examSettings.scope === "CLASS") {
      setExamSettings(prev => ({ ...prev, departmentId: "" }));
    } else if (examSettings.scope === "DEPARTMENT") {
      setExamSettings(prev => ({ ...prev, classId: "" }));
    }
  }, [examSettings.scope]);

  useEffect(() => {
    if (exam) {
      setExamSettings({
        title: exam.title || "",
        description: exam.description || "",
        startDate: exam.startDate ? new Date(exam.startDate).toISOString().slice(0, 16) : "",
        scope: exam.scope || "SCHOOL",
        classId: exam.classId || "",
        departmentId: exam.departmentId || "",
        durationMinutes: exam.durationMinutes || 0,
      });
    }
  }, [exam]);

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
      console.log("Fetching teachers for school ID:", activeSchoolId); // Debug log
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
              <div className="flex items-center gap-4 text-muted-foreground text-xs font-bold">
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
                    Duration: {exam.durationMinutes} min
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isPublished && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-bold"
                  onClick={() => validateExamMutation.mutate()}
                  disabled={validateExamMutation.isPending}
                >
                  {validateExamMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Validate Exam"}
                </Button>
                <Button
                  size="sm"
                  className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                  onClick={() => publishExamMutation.mutate()}
                  disabled={publishExamMutation.isPending || !allPapersPublished}
                  title={!allPapersPublished ? "All subject papers must be published first" : ""}
                >
                  {publishExamMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Publish Exam"}
                </Button>
              </div>
            )}

            {isPublished && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold text-amber-600 border-amber-200 hover:bg-amber-50"
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
              >
                {unpublishExamMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Unpublish Exam"}
              </Button>
            )}

            {user?.userType === "ADMIN" && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold text-red-600 border-red-200 hover:bg-red-50"
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
              >
                {deleteExamMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Delete Exam"}
              </Button>
            )}

            {!isPublished && (
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl font-bold flex gap-2">
                    <Settings2 size={14} /> Exam Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Edit Exam Settings</DialogTitle>
                    <DialogDescription>
                      Update global settings for this examination.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-bold">Exam Title</Label>
                      <Input
                        id="title"
                        className="rounded-xl"
                        value={examSettings.title}
                        onChange={(e) => setExamSettings({ ...examSettings, title: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-bold">Instructions/Description</Label>
                      <Textarea
                        id="description"
                        className="rounded-xl min-h-[100px]"
                        value={examSettings.description}
                        onChange={(e) => setExamSettings({ ...examSettings, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-sm font-bold flex items-center gap-2">
                        <Calendar size={14} className="text-primary" /> Start Date & Time
                      </Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        className="rounded-xl"
                        value={examSettings.startDate}
                        onChange={(e) => setExamSettings({ ...examSettings, startDate: e.target.value })}
                      />
                      <p className="text-[10px] text-muted-foreground">Students cannot start the exam before this time.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-bold flex items-center gap-2">
                        <Clock size={14} className="text-primary" /> Exam Duration (Minutes)
                      </Label>
                      <Input
                        id="duration"
                        type="number"
                        className="rounded-xl"
                        value={examSettings.durationMinutes}
                        onChange={(e) => setExamSettings({ ...examSettings, durationMinutes: parseInt(e.target.value) || 0 })}
                      />
                      <p className="text-[10px] text-muted-foreground">Total time allowed for the full examination.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                       <div className="space-y-2">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Exam Scope</Label>
                          <select 
                            className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-800 px-3 text-sm bg-transparent outline-none focus:ring-2 focus:ring-primary/20"
                            value={examSettings.scope}
                            onChange={(e) => setExamSettings({ ...examSettings, scope: e.target.value as any })}
                          >
                            <option value="SCHOOL">Whole School</option>
                            <option value="CLASS">By Class</option>
                            <option value="DEPARTMENT">By Department</option>
                          </select>
                       </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-blue-500 uppercase tracking-wider">Target Class (Optional)</Label>
                          <select 
                            className="w-full h-10 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/20 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={examSettings.classId}
                            onChange={(e) => setExamSettings({ ...examSettings, classId: e.target.value })}
                          >
                            <option value="">No specific class</option>
                            {classesData?.map((c: any) => (
                              <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-purple-500 uppercase tracking-wider">Target Dept (Optional)</Label>
                          <select 
                            className="w-full h-10 rounded-xl border border-purple-100 dark:border-purple-900/30 bg-purple-50/20 px-3 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                            value={examSettings.departmentId}
                            onChange={(e) => setExamSettings({ ...examSettings, departmentId: e.target.value })}
                          >
                            <option value="">No specific department</option>
                            {departmentsData?.map((d: any) => (
                              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                            ))}
                          </select>
                        </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsSettingsOpen(false)}
                      className="rounded-xl font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => updateExamMutation.mutate(examSettings)}
                      disabled={updateExamMutation.isPending}
                      className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-white"
                    >
                      {updateExamMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <div className="h-10 w-[1px] bg-gray-100 dark:bg-gray-800 mx-2 hidden md:block"></div>

            <div className="flex gap-6">
              <div className="flex flex-col">
                <span className="text-xl font-black text-gray-900 dark:text-white leading-none">
                  {papers.reduce((sum, p) => sum + (p.totalMarks || 0), 0)}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total Marks</span>
              </div>
              <div className="flex flex-col">
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
        {/* Left Column: Create Form */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sticky top-24">
          <h2 className="text-lg font-bold mb-4">Add Subject Paper</h2>
          <CreatePaperForm
            examId={examId}
            subjects={Array.isArray(subjectResponse) ? subjectResponse : []}
            isLoadingData={isLoadingSubjects || isLoadingTeachers}
            teachers={Array.isArray(teacherResponse) ? teacherResponse : []}
          />

          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Fast Link</h3>
            <AddExistingPaperModal 
              examId={examId} 
              trigger={
                <Button variant="outline" className="w-full justify-start gap-2 h-12 rounded-xl border-dashed hover:border-primary hover:text-primary transition-all">
                  <LinkIcon className="h-4 w-4" />
                  Link Existing Subject Paper
                </Button>
              }
            />
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Add papers you've already created for this or other terms.
            </p>
          </div>
        </div>

        {/* Right Column: Papers List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Existing Papers ({papers.length})</h2>
          </div>

          {isLoadingPapers ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isErrorPapers ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
              Failed to load existing papers.
            </div>
          ) : papers.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center flex flex-col items-center">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No papers yet</h3>
              <p className="text-gray-500 text-sm mt-1 max-w-sm">
                Create the first subject paper using the form on the left. You can add as many papers as needed.
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
                        toast.info("Only the assigned teacher or an admin can manage this paper's questions.");
                      }
                    }}
                    className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 transition-all group ${canAccess ? "hover:border-primary/50 cursor-pointer hover:shadow-md" : "opacity-80 grayscale-[0.5]"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-bold flex items-center gap-2 ${canAccess ? "text-gray-900 dark:text-white group-hover:text-primary" : "text-gray-500"}`}>
                        <FileText className={`h-4 w-4 ${canAccess ? "text-primary" : "text-gray-400"}`} />
                        {paper.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {canAccess && paper.status === "PUBLISHED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-full"
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
                            {unpublishPaperMutation.isPending && unpublishPaperMutation.variables === paper.id ? <Loader2 className="animate-spin h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                          </Button>
                        )}
                        {canAccess && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              openConfirmDialog({
                                title: "Unlink Paper",
                                description: `This will remove "${paper.title}" from this exam. The paper will NOT be deleted and can be linked later.`,
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
                            {unlinkPaperMutation.isPending && unlinkPaperMutation.variables === paper.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Link2Off className="h-4 w-4" />}
                          </Button>
                        )}
                        {!canAccess && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold">LOCKED</span>}
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300">
                          {paper.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {paper.instructions}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {paper.durationMinutes} minutes
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        Teacher: {paper.teacherId === user?.id ? "You" : paper.teacherId.substring(0, 8) + "..."}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 ml-auto">
                        Added {format(new Date(paper.createdAt || new Date()), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>
                );
              })}
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
          unpublishExamMutation.isPending || 
          deleteExamMutation.isPending || 
          unpublishPaperMutation.isPending || 
          unlinkPaperMutation.isPending
        }
      />
    </div>
  );
}
