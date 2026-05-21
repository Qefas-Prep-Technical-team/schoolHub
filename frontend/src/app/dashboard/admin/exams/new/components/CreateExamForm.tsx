"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { 
  Loader2, 
  School, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Trophy, 
  Sparkles, 
  BookOpen,
  Info,
  Clock
} from "lucide-react";

import { examService, CreateExamDTO } from "@/lib/api/services/examService";
import { useExamStore } from "@/store/examStore";
import { useSessions } from "@/lib/api/hooks/useSessions";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  scope: z.enum(["SCHOOL", "CLASS", "DEPARTMENT"]),
  creationMode: z.enum(["MANUAL", "AI", "OMR"]),
  category: z.enum(["EXAM", "QUIZ"]),
  mode: z.enum(["SINGLE_SUBJECT", "COMBINED"]),
  schoolId: z.string().min(1, "Please select a school"),
  sessionId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  classId: z.string().optional(),
  departmentIds: z.array(z.string()),
  allowImmediateResult: z.boolean(),
  resultReleaseAt: z.string().optional(),
});

type ExamFormValues = z.infer<typeof examSchema>;

export default function CreateExamForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get("category");
  const defaultCategory = (categoryParam === "QUIZ" ? "QUIZ" : "EXAM") as "EXAM" | "QUIZ";

  const { setExamContext } = useExamStore();
  const { user } = useAuthStore();
  const [activeStep, setActiveStep] = useState(1);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      description: "",
      scope: "SCHOOL",
      creationMode: "MANUAL",
      category: defaultCategory,
      mode: "SINGLE_SUBJECT",
      schoolId: "",
      sessionId: "",
      startDate: "",
      endDate: "",
      classId: "",
      departmentIds: [],
      allowImmediateResult: true,
      resultReleaseAt: "",
    },
  });

  const watchedSchoolId = watch("schoolId");
  const watchedScope = watch("scope");
  const watchedCategory = watch("category");
  const watchedAllowImmediateResult = watch("allowImmediateResult");
  const { data: settings } = useSchoolSettings(watchedSchoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  // Fetch academic sessions for the selected school
  const { data: sessions, isLoading: loadingSessions } = useSessions(watchedSchoolId);

  // Fetch Classes
  const { data: classesData } = useQuery({
    queryKey: ["school-classes", watchedSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/classes?schoolId=${watchedSchoolId}`);
      return data.data || [];
    },
    enabled: !!watchedSchoolId,
  });

  // Fetch Departments - Now dependent on classId
  const watchedClassId = watch("classId");
  const { data: departmentsData } = useQuery({
    queryKey: ["school-departments", watchedSchoolId, watchedClassId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/academic/departments?schoolId=${watchedSchoolId}${watchedClassId ? `&classId=${watchedClassId}` : ''}`
      );
      return data.data || [];
    },
    enabled: !!watchedSchoolId,
  });

  // TRIGGER 1: Auto-select school if exactly 1 school is available
  useEffect(() => {
    const schools = (user as { schools?: { schoolId: string }[] })?.schools;
    if (user && schools?.length === 1 && !watchedSchoolId) {
      setValue("schoolId", schools[0].schoolId);
    }
  }, [user, setValue, watchedSchoolId]);

  // TRIGGER 2: Sync target fields based on scope
  useEffect(() => {
    if (watchedScope === "SCHOOL") {
      // For school scope, class and department are optional filters
    } else if (watchedScope === "CLASS") {
      setValue("departmentIds", []);
    } else if (watchedScope === "DEPARTMENT") {
      setValue("classId", "");
    }
  }, [watchedScope, setValue]);

  // TRIGGER 2.5: Clear departments if class changes
  useEffect(() => {
    if (watchedClassId) {
      setValue("departmentIds", []);
    }
  }, [watchedClassId, setValue]);

  // TRIGGER 3: Clear session if school changes
  useEffect(() => {
    if (watchedSchoolId) {
      setValue("sessionId", "");
    }
  }, [watchedSchoolId, setValue]);

  // TRIGGER 4: Auto-select if exactly 1 session is found
  useEffect(() => {
    if (sessions?.data && sessions.data.length === 1) {
      setValue("sessionId", sessions.data[0].id);
    }
  }, [sessions, setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateExamDTO) => examService.createExam(data),
    onSuccess: (data) => {
      toast.success("Exam created successfully!");
      setExamContext(data.id, data.schoolId, data.sessionId || "");
      router.push(`/dashboard/admin/exams/${data.id}/papers`);
    },
    onError: (error: { response?: { data?: { message?: string } }, message?: string }) => {
      const message = error.response?.data?.message || error.message || "Failed to create exam";
      toast.error(typeof message === 'string' ? message : "An error occurred");
    },
  });

  const onSubmit = (data: ExamFormValues) => mutate({
    ...data,
    description: data.description || "",
    startDate: data.startDate || undefined,
    endDate: data.endDate || undefined,
    resultReleaseAt: data.resultReleaseAt || undefined,
  });

  const handleNextStep = async () => {
    if (activeStep === 1) {
      const isValid = await trigger(["schoolId", "title", "category"]);
      if (isValid) {
        setActiveStep(2);
      } else {
        toast.error("Please fill in all required fields before proceeding.");
      }
    } else if (activeStep === 2) {
      if (watchedScope === "CLASS") {
        const isValid = await trigger(["classId"]);
        if (!isValid) {
          toast.error("Please select a target class.");
          return;
        }
      } else if (watchedScope === "DEPARTMENT") {
        const selectedDeps = watch("departmentIds") || [];
        if (selectedDeps.length === 0) {
          toast.error("Please select at least one department.");
          return;
        }
      }
      setActiveStep(3);
    }
  };

  const handleBackStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const steps = [
    { id: 1, label: "Basic Info", desc: "Exam Name & Category" },
    { id: 2, label: "Scope & Target", desc: "Who is taking this?" },
    { id: 3, label: "Results Release", desc: "Sharing Settings" }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
      
      {/* Premium Visual Stepper */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative">
          
          {/* Connector Line behind steps (hidden on mobile) */}
          <div className="absolute top-[26px] left-[10%] right-[10%] h-0.5 bg-slate-100 dark:bg-white/5 hidden md:block z-0" />
          <div 
            className="absolute top-[26px] left-[10%] h-0.5 transition-all duration-500 hidden md:block z-0" 
            style={{ 
              backgroundColor: primaryColor,
              width: `${(activeStep - 1) * 40}%`
            }} 
          />

          {steps.map((step, idx) => {
            const isCompleted = activeStep > step.id;
            const isActive = activeStep === step.id;
            return (
              <div 
                key={step.id} 
                className="flex items-center gap-4 z-10 w-full md:w-auto cursor-pointer"
                onClick={async () => {
                  if (step.id < activeStep) {
                    setActiveStep(step.id);
                  } else if (step.id > activeStep) {
                    // Let the user skip forward only if valid
                    if (activeStep === 1) {
                      const val = await trigger(["schoolId", "title", "category"]);
                      if (val) {
                        if (step.id === 3) {
                          if (watchedScope === "CLASS") {
                            const valClass = await trigger(["classId"]);
                            if (valClass) setActiveStep(3);
                          } else if (watchedScope === "DEPARTMENT") {
                            const selectedDeps = watch("departmentIds") || [];
                            if (selectedDeps.length > 0) setActiveStep(3);
                          } else {
                            setActiveStep(3);
                          }
                        } else {
                          setActiveStep(2);
                        }
                      }
                    } else if (activeStep === 2) {
                      if (watchedScope === "CLASS") {
                        const valClass = await trigger(["classId"]);
                        if (valClass) setActiveStep(3);
                      } else if (watchedScope === "DEPARTMENT") {
                        const selectedDeps = watch("departmentIds") || [];
                        if (selectedDeps.length > 0) setActiveStep(3);
                      } else {
                        setActiveStep(3);
                      }
                    }
                  }
                }}
              >
                <div 
                  className={cn(
                    "size-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 border shadow-inner",
                    isCompleted 
                      ? "text-white" 
                      : isActive 
                        ? "text-white border-transparent scale-110 shadow-lg" 
                        : "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-white/5"
                  )}
                  style={{
                    backgroundColor: isCompleted || isActive ? primaryColor : undefined,
                    borderColor: isActive ? primaryColor : undefined,
                    boxShadow: isActive ? `0 8px 24px -6px ${primaryColor}40` : undefined
                  }}
                >
                  {isCompleted ? <Check size={18} strokeWidth={3} /> : step.id}
                </div>
                <div className="flex flex-col text-left">
                  <span className={cn(
                    "text-xs font-black uppercase tracking-wider",
                    isActive ? "text-slate-900 dark:text-white" : "text-slate-400"
                  )}>
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Ambient background glow matching primaryColor */}
        <div 
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] opacity-[0.03] pointer-events-none transition-all duration-500" 
          style={{ backgroundColor: primaryColor }} 
        />
        
        <AnimatePresence mode="wait">
          {activeStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="size-12 rounded-2xl flex items-center justify-center border shadow-inner" 
                  style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20`, color: primaryColor }}
                >
                  <BookOpen size={20} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Exam Details</h2>
                  <p className="text-xs text-slate-500">Provide the basic context and category of your assessment.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Select School */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Select School</span>
                    <School size={12} className="text-slate-400" />
                  </Label>
                  <select
                    {...register("schoolId")}
                    className="w-full h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40 px-5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-sm text-slate-700 dark:text-slate-200"
                    style={{ borderColor: watchedSchoolId ? `${primaryColor}30` : undefined } as React.CSSProperties}
                  >
                    <option value="">Select a school...</option>
                    {(user as { schools?: { schoolId: string, schoolName: string }[] })?.schools?.map((s) => (
                      <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
                    ))}
                  </select>
                  {errors.schoolId && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{errors.schoolId.message}</p>}
                </div>

                {/* Academic Session */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Academic Session</span>
                    <Calendar size={12} className="text-slate-400" />
                  </Label>
                  
                  {sessions?.data && sessions.data.length > 0 ? (
                    <select
                      {...register("sessionId")}
                      className="w-full h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40 px-5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-sm text-slate-700 dark:text-slate-200"
                    >
                      <option value="">No Session Link (Optional)</option>
                      {sessions.data.map((session: { id: string, name: string }) => (
                        <option key={session.id} value={session.id}>{session.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="h-14 flex items-center px-5 rounded-2xl bg-slate-50 dark:bg-slate-800/20 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-white/5 font-semibold">
                      {loadingSessions ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin text-slate-400" /> Fetching academic sessions...
                        </span>
                      ) : !watchedSchoolId ? (
                        "Select a school first..."
                      ) : (
                        "No academic sessions found"
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exam Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. First Term Mathematics Final Exam"
                  {...register("title")}
                  className="h-14 px-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-800 dark:text-slate-100"
                />
                {errors.title && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{errors.title.message}</p>}
              </div>

              {/* Category card selections */}
              <div className="space-y-4">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Category</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Exam Card */}
                  <div
                    onClick={() => setValue("category", "EXAM")}
                    className={cn(
                      "cursor-pointer p-6 rounded-3xl border-2 transition-all flex items-start gap-4 hover:shadow-md",
                      watchedCategory === "EXAM" 
                        ? "bg-slate-50/80 dark:bg-slate-900/50 shadow-sm" 
                        : "bg-white dark:bg-slate-900/10 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10"
                    )}
                    style={{ borderColor: watchedCategory === "EXAM" ? primaryColor : undefined }}
                  >
                    <div 
                      className="size-10 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: watchedCategory === "EXAM" ? `${primaryColor}15` : "rgba(148, 163, 184, 0.1)",
                        color: watchedCategory === "EXAM" ? primaryColor : "#94a3b8"
                      }}
                    >
                      <Trophy size={18} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                        Formal Exam
                        {watchedCategory === "EXAM" && <CheckCircle2 size={14} className="text-primary" style={{ color: primaryColor }} />}
                      </span>
                      <p className="text-xs text-slate-400 font-medium">Standard school-wide examinations with formal weight.</p>
                    </div>
                  </div>

                  {/* Quiz Card */}
                  <div
                    onClick={() => setValue("category", "QUIZ")}
                    className={cn(
                      "cursor-pointer p-6 rounded-3xl border-2 transition-all flex items-start gap-4 hover:shadow-md",
                      watchedCategory === "QUIZ" 
                        ? "bg-slate-50/80 dark:bg-slate-900/50 shadow-sm" 
                        : "bg-white dark:bg-slate-900/10 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10"
                    )}
                    style={{ borderColor: watchedCategory === "QUIZ" ? primaryColor : undefined }}
                  >
                    <div 
                      className="size-10 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: watchedCategory === "QUIZ" ? `${primaryColor}15` : "rgba(148, 163, 184, 0.1)",
                        color: watchedCategory === "QUIZ" ? primaryColor : "#94a3b8"
                      }}
                    >
                      <Zap size={18} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                        Short Quiz / Test
                        {watchedCategory === "QUIZ" && <CheckCircle2 size={14} className="text-primary" style={{ color: primaryColor }} />}
                      </span>
                      <p className="text-xs text-slate-400 font-medium">Informal class tests, weekly quizzes, or diagnostic checkpoints.</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Instructions / Description */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="description" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructions & Guidelines</Label>
                  <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <Info size={10} /> Optional
                  </span>
                </div>
                <Textarea
                  id="description"
                  placeholder="e.g. Ensure all students bring their scientific calculators. The test starts promptly at 8:00 AM."
                  {...register("description")}
                  className="rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm text-slate-700 dark:text-slate-200 min-h-[100px] p-4"
                />
              </div>

            </motion.div>
          )}

          {activeStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="size-12 rounded-2xl flex items-center justify-center border shadow-inner" 
                  style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20`, color: primaryColor }}
                >
                  <Layers size={20} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Scope & Target Audience</h2>
                  <p className="text-xs text-slate-500">Determine who will participate in this examination.</p>
                </div>
              </div>

              {/* Scope selectors */}
              <div className="space-y-4">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exam Scope</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Whole School Card */}
                  <div
                    onClick={() => setValue("scope", "SCHOOL")}
                    className={cn(
                      "cursor-pointer p-6 rounded-3xl border-2 transition-all flex flex-col gap-3 hover:shadow-md",
                      watchedScope === "SCHOOL" 
                        ? "bg-slate-50/80 dark:bg-slate-900/50 shadow-sm" 
                        : "bg-white dark:bg-slate-900/10 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10"
                    )}
                    style={{ borderColor: watchedScope === "SCHOOL" ? primaryColor : undefined }}
                  >
                    <div 
                      className="size-10 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: watchedScope === "SCHOOL" ? `${primaryColor}15` : "rgba(148, 163, 184, 0.1)",
                        color: watchedScope === "SCHOOL" ? primaryColor : "#94a3b8"
                      }}
                    >
                      <School size={18} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                        Whole School
                        {watchedScope === "SCHOOL" && <CheckCircle2 size={14} className="text-primary" style={{ color: primaryColor }} />}
                      </span>
                      <p className="text-[11px] text-slate-400 font-medium">Available to all classes and student segments across the school.</p>
                    </div>
                  </div>

                  {/* Class Card */}
                  <div
                    onClick={() => setValue("scope", "CLASS")}
                    className={cn(
                      "cursor-pointer p-6 rounded-3xl border-2 transition-all flex flex-col gap-3 hover:shadow-md",
                      watchedScope === "CLASS" 
                        ? "bg-slate-50/80 dark:bg-slate-900/50 shadow-sm" 
                        : "bg-white dark:bg-slate-900/10 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10"
                    )}
                    style={{ borderColor: watchedScope === "CLASS" ? primaryColor : undefined }}
                  >
                    <div 
                      className="size-10 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: watchedScope === "CLASS" ? `${primaryColor}15` : "rgba(148, 163, 184, 0.1)",
                        color: watchedScope === "CLASS" ? primaryColor : "#94a3b8"
                      }}
                    >
                      <BookOpen size={18} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                        Specific Class
                        {watchedScope === "CLASS" && <CheckCircle2 size={14} className="text-primary" style={{ color: primaryColor }} />}
                      </span>
                      <p className="text-[11px] text-slate-400 font-medium">Target a specific class group or grade level (e.g. Senior Class 1).</p>
                    </div>
                  </div>

                  {/* Department Card */}
                  <div
                    onClick={() => setValue("scope", "DEPARTMENT")}
                    className={cn(
                      "cursor-pointer p-6 rounded-3xl border-2 transition-all flex flex-col gap-3 hover:shadow-md",
                      watchedScope === "DEPARTMENT" 
                        ? "bg-slate-50/80 dark:bg-slate-900/50 shadow-sm" 
                        : "bg-white dark:bg-slate-900/10 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10"
                    )}
                    style={{ borderColor: watchedScope === "DEPARTMENT" ? primaryColor : undefined }}
                  >
                    <div 
                      className="size-10 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: watchedScope === "DEPARTMENT" ? `${primaryColor}15` : "rgba(148, 163, 184, 0.1)",
                        color: watchedScope === "DEPARTMENT" ? primaryColor : "#94a3b8"
                      }}
                    >
                      <Layers size={18} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                        Specific Department
                        {watchedScope === "DEPARTMENT" && <CheckCircle2 size={14} className="text-primary" style={{ color: primaryColor }} />}
                      </span>
                      <p className="text-[11px] text-slate-400 font-medium">Target one or more specialized departments or faculties (e.g. Science).</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Contextual Options */}
              <AnimatePresence mode="popLayout">
                
                {/* Specific Class Selector */}
                {watchedScope === "CLASS" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      Target Class <span className="text-red-500">*</span>
                    </Label>
                    <select
                      {...register("classId")}
                      className="w-full h-14 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/40 px-5 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-sm text-slate-700 dark:text-slate-200"
                    >
                      <option value="">Select Target Class...</option>
                      {classesData?.map((c: { id: string, name: string, section?: string }) => (
                        <option key={c.id} value={c.id}>{c.name} {c.section ? `(${c.section})` : ''}</option>
                      ))}
                    </select>
                    {errors.classId && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{errors.classId.message}</p>}
                  </motion.div>
                )}

                {/* Specific Department Selection */}
                {watchedScope === "DEPARTMENT" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Select Departments <span className="text-red-500">*</span>
                      </Label>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 font-bold">
                        {watch("departmentIds")?.length || 0} Selected
                      </span>
                    </div>

                    {departmentsData && departmentsData.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {departmentsData.map((d: { id: string, name: string, code?: string }) => {
                          const isSelected = watch("departmentIds")?.includes(d.id);
                          return (
                            <div 
                              key={d.id}
                              onClick={() => {
                                const current = watch("departmentIds") || [];
                                const next = current.includes(d.id) 
                                  ? current.filter(id => id !== d.id)
                                  : [...current, d.id];
                                setValue("departmentIds", next);
                              }}
                              className={cn(
                                "cursor-pointer group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200",
                                isSelected 
                                  ? "bg-slate-50/80 dark:bg-slate-900/50 shadow-sm" 
                                  : "bg-white dark:bg-slate-900/10 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10"
                              )}
                              style={{ 
                                borderColor: isSelected ? primaryColor : undefined,
                              }}
                            >
                              <div 
                                className={cn(
                                  "size-6 rounded-lg flex items-center justify-center transition-all border",
                                  isSelected ? "text-white scale-105" : "bg-transparent text-transparent border-slate-200 dark:border-white/10"
                                )}
                                style={{ 
                                  backgroundColor: isSelected ? primaryColor : undefined,
                                  borderColor: isSelected ? primaryColor : undefined
                                }}
                              >
                                <Check size={12} strokeWidth={4} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{d.name}</span>
                                {d.code && <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{d.code}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/5 text-slate-400 text-xs italic font-semibold">
                        {watchedSchoolId ? "No departments found for this school." : "Select a school first."}
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          )}

          {activeStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="size-12 rounded-2xl flex items-center justify-center border shadow-inner" 
                  style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20`, color: primaryColor }}
                >
                  <ShieldCheck size={20} strokeWidth={2} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Results Release</h2>
                  <p className="text-xs text-slate-500">Decide when students can view their grades and AI insights.</p>
                </div>
              </div>

              {/* Release mode options */}
              <div className="space-y-4">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">How should results be shared?</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Immediate Sync */}
                  <div
                    onClick={() => {
                      setValue("allowImmediateResult", true);
                      setValue("resultReleaseAt", "");
                    }}
                    className={cn(
                      "cursor-pointer p-6 rounded-3xl border-2 transition-all flex items-start gap-4 hover:shadow-md",
                      watchedAllowImmediateResult === true 
                        ? "bg-slate-50/80 dark:bg-slate-900/50 shadow-sm" 
                        : "bg-white dark:bg-slate-900/10 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10"
                    )}
                    style={{ borderColor: watchedAllowImmediateResult === true ? primaryColor : undefined }}
                  >
                    <div 
                      className="size-10 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: watchedAllowImmediateResult === true ? `${primaryColor}15` : "rgba(148, 163, 184, 0.1)",
                        color: watchedAllowImmediateResult === true ? primaryColor : "#94a3b8"
                      }}
                    >
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                        Release Immediately
                        {watchedAllowImmediateResult === true && <CheckCircle2 size={14} className="text-primary" style={{ color: primaryColor }} />}
                      </span>
                      <p className="text-xs text-slate-400 font-medium">Students see their marks and performance insights immediately after submitting.</p>
                    </div>
                  </div>

                  {/* Scheduled release */}
                  <div
                    onClick={() => setValue("allowImmediateResult", false)}
                    className={cn(
                      "cursor-pointer p-6 rounded-3xl border-2 transition-all flex items-start gap-4 hover:shadow-md",
                      watchedAllowImmediateResult === false 
                        ? "bg-slate-50/80 dark:bg-slate-900/50 shadow-sm" 
                        : "bg-white dark:bg-slate-900/10 border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10"
                    )}
                    style={{ borderColor: watchedAllowImmediateResult === false ? primaryColor : undefined }}
                  >
                    <div 
                      className="size-10 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: watchedAllowImmediateResult === false ? `${primaryColor}15` : "rgba(148, 163, 184, 0.1)",
                        color: watchedAllowImmediateResult === false ? primaryColor : "#94a3b8"
                      }}
                    >
                      <Clock size={18} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                        Schedule Release Date
                        {watchedAllowImmediateResult === false && <CheckCircle2 size={14} className="text-primary" style={{ color: primaryColor }} />}
                      </span>
                      <p className="text-xs text-slate-400 font-medium">Lock grades and release them all at once at a specific date and time.</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Conditional Scheduled Date Picker */}
              <AnimatePresence mode="popLayout">
                {watchedAllowImmediateResult === false && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <Label htmlFor="resultReleaseAt" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Release Date & Time</Label>
                    <Input
                      id="resultReleaseAt"
                      type="datetime-local"
                      {...register("resultReleaseAt")}
                      className="h-14 px-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-primary/20 transition-all font-semibold text-slate-800 dark:text-slate-100"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controller Buttons / Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-3xl shadow-lg">
        <div className="text-center sm:text-left space-y-0.5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Step {activeStep} of 3
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {activeStep === 1 ? "Provide core parameters" : activeStep === 2 ? "Select exam participants" : "Finalize grading settings"}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {activeStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBackStep}
              className="flex-1 sm:flex-none px-6 h-12 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-white/10 transition-transform active:scale-95"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          )}

          {activeStep < 3 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              style={{ backgroundColor: primaryColor }}
              className="flex-1 sm:flex-none px-8 h-12 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:opacity-95 shadow-md active:scale-95 border-none"
            >
              Continue
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending || !watchedSchoolId}
              style={{ backgroundColor: primaryColor }}
              className="flex-1 sm:flex-none px-8 h-12 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:opacity-95 shadow-lg active:scale-95 border-none"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Exam & Add Papers
                  <Check size={16} strokeWidth={3} />
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
