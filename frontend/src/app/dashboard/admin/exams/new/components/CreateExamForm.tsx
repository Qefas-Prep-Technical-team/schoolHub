/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { Loader2, LayoutGrid, FileText, Settings2, School, Calendar, ArrowRight, AlertCircle, Check, CheckCircle2, Users, Building2, Wand2, Settings, Eye, EyeOff, BookOpen, User } from "lucide-react";

import { examService, CreateExamDTO } from "@/lib/api/services/examService";
import { useExamStore } from "@/store/examStore";
import { SearchableSelect } from "./SearchableSelect";
import { useSessions } from "@/lib/api/hooks/useSessions";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";


import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Typography from '@mui/material/Typography';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  scope: z.enum(["SCHOOL", "CLASS", "DEPARTMENT"]),
  creationMode: z.enum(["MANUAL", "AI", "OMR"]),
  category: z.enum(["EXAM", "QUIZ", "CA"]),
  mode: z.enum(["SINGLE_SUBJECT", "COMBINED"]),
  schoolId: z.string().min(1, "Please select a school"),
  sessionId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  classId: z.string().optional(),
  departmentIds: z.array(z.string()),
  allowImmediateResult: z.boolean(),
  resultReleaseAt: z.string().optional(),
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
  durationMinutes: z.coerce.number().optional(),
  passMark: z.coerce.number().optional(),
});

type ExamFormValues = z.infer<typeof examSchema>;

export default function CreateExamForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams?.get("category");
  const defaultCategory = (categoryParam === "QUIZ" ? "QUIZ" : categoryParam === "CA" ? "CA" : "EXAM") as "EXAM" | "QUIZ" | "CA";
  const typeLabel = defaultCategory === "CA" ? "CA" : defaultCategory === "QUIZ" ? "Quiz" : "Exam";

  const modeParam = searchParams?.get("mode");
  const defaultMode = (modeParam === "COMBINED" ? "COMBINED" : "SINGLE_SUBJECT") as "SINGLE_SUBJECT" | "COMBINED";

  const steps = defaultMode === "SINGLE_SUBJECT" 
    ? [`${typeLabel} Details`, 'Scheduling & Targets', 'Result Settings']
    : [`${typeLabel} Details`, 'Scheduling & Targets'];
    
  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState<{ [k: number]: boolean }>({});
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [canSubmit, setCanSubmit] = React.useState(false);

  React.useEffect(() => {
    if (activeStep === steps.length - 1) {
      setCanSubmit(false);
      const timer = setTimeout(() => setCanSubmit(true), 600);
      return () => clearTimeout(timer);
    }
  }, [activeStep, steps.length]);

  const totalSteps = () => steps.length;
  const completedSteps = () => Object.keys(completed).length;
  const isLastStep = () => activeStep === totalSteps() - 1;
  const allStepsCompleted = () => completedSteps() === totalSteps();

  const handleNext = async () => {
    // Validate Step 0
    if (activeStep === 0) {
      const isValid = await trigger(["title"]);
      if (!isValid) {
        toast.error(`Please enter a valid ${typeLabel.toLowerCase()} title (at least 3 characters)`);
        return;
      }
    }
    // Validate Step 1
    if (activeStep === 1) {
      if (watchedScope === "CLASS" && !watch("classId")) {
        toast.error("Please select a target class");
        return;
      }
      if (watchedScope === "DEPARTMENT" && (!watch("departmentIds") || watch("departmentIds").length === 0)) {
        toast.error("Please select at least one department");
        return;
      }
    }

    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);
  const handleStep = (step: number) => async () => {
    if (step > activeStep) {
      if (activeStep === 0) {
        const isValid = await trigger(["title"]);
        if (!isValid) {
          toast.error(`Please enter a valid ${typeLabel.toLowerCase()} title first`);
          return;
        }
      }
    }
    setActiveStep(step);
  };
  const handleComplete = () => {
    setCompleted({ ...completed, [activeStep]: true });
    handleNext();
  };

  const { setExamContext } = useExamStore();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      scope: "SCHOOL",
      creationMode: "MANUAL",
      category: defaultCategory,
      mode: defaultMode,
      schoolId: "",
      sessionId: "",
      startDate: "",
      endDate: "",
      classId: "",
      departmentIds: [],
      allowImmediateResult: true,
      resultReleaseAt: "",
      subjectId: "",
      teacherId: "",
      durationMinutes: 60,
      passMark: 50,
    },
  });

  const watchedSchoolId = watch("schoolId");
  const watchedScope = watch("scope");

  // sessions now represents the Array [{id, name...}]
  const { data: sessions, isLoading: loadingSessions, isError } = useSessions(watchedSchoolId);

  // Fetch Subjects for SINGLE_SUBJECT
  const { data: subjectsData, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["school-subjects", watchedSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/academic/subjects?schoolId=${watchedSchoolId}`);
      return data.data || [];
    },
    enabled: !!watchedSchoolId && defaultMode === "SINGLE_SUBJECT",
  });

  // Fetch Teachers for SINGLE_SUBJECT
  const { data: teachersData, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["school-teachers", watchedSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/schools/${watchedSchoolId}/teachers`);
      return data.data || [];
    },
    enabled: !!watchedSchoolId && defaultMode === "SINGLE_SUBJECT",
  });

  // Fetch Classes
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["school-classes", watchedSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/classes?schoolId=${watchedSchoolId}`);
      return data.data || [];
    },
    enabled: !!watchedSchoolId,
  });

  // Fetch Departments - Now dependent on classId
  const watchedClassId = watch("classId");
  const { data: departmentsData, isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["school-departments", watchedSchoolId, watchedClassId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/academic/departments?schoolId=${watchedSchoolId}${watchedClassId ? `&classId=${watchedClassId}` : ''}`
      );
      return data.data || [];
    },
    enabled: !!watchedSchoolId,
  });




  // Set school automatically and securely from auth context
  const activeSchoolId = (user as any)?.schools?.[0]?.schoolId || (user as any)?.defaultTenantId;
  useEffect(() => {
    if (activeSchoolId && !watchedSchoolId) {
      setValue("schoolId", activeSchoolId);
    }
  }, [activeSchoolId, watchedSchoolId, setValue]);

  // TRIGGER 2: Sync target fields based on scope
  useEffect(() => {
    if (watchedScope === "SCHOOL") {
      // For school scope, class and department are optional filters
    } else if (watchedScope === "DEPARTMENT") {
      // If purely department-scoped without class
      // classId is optional
    }
  }, [watchedScope, setValue]);

  // TRIGGER 2.5: Resync department selection if class changes and selected departments no longer exist in that class
  useEffect(() => {
    if (watchedClassId && departmentsData && departmentsData.length > 0) {
      const validDeptIds = new Set(departmentsData.map((d: any) => d.id));
      const current = watch("departmentIds") || [];
      const filtered = current.filter(id => validDeptIds.has(id));
      if (filtered.length !== current.length) {
        setValue("departmentIds", filtered);
      }
    }
  }, [watchedClassId, departmentsData, setValue, watch]);

  // TRIGGER 3: Clear session if school changes
  useEffect(() => {
    if (watchedSchoolId) {
      setValue("sessionId", "");
    }
  }, [watchedSchoolId, setValue]);

  // TRIGGER 3: Auto-select if exactly 1 session is found
  useEffect(() => {
    if (sessions && sessions.length === 1) {
      setValue("sessionId", sessions[0].id);
    }
  }, [sessions, setValue]);

  const { mutate: createFullExam, isPending } = useMutation({
    mutationFn: async (data: ExamFormValues) => {
      const payload = {
        ...data,
        description: data.description || "",
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
        resultReleaseAt: !data.allowImmediateResult && data.resultReleaseAt ? data.resultReleaseAt : undefined,
      };

      // 1. Create Exam
      const createdExam = await examService.createExam(payload as CreateExamDTO);

      // 2. If SINGLE_SUBJECT, create Subject Paper and link it
      if (defaultMode === "SINGLE_SUBJECT") {
        let createdPaper = null;
        let paperFailed = false;
        try {
          const paperPayload = {
            subjectId: data.subjectId || null,
            teacherId: data.teacherId || null,
            title: data.title,
            instructions: data.description || "",
            durationMinutes: data.durationMinutes || 60,
            passMark: data.passMark || 50,
            schoolId: data.schoolId,
            creationMode: data.creationMode,
            category: data.category,
          };
          createdPaper = await examService.createSubjectPaper(createdExam.id, paperPayload);
        } catch (paperError: any) {
          console.error('[CreateExamForm] Paper creation failed:', paperError);
          paperFailed = true;
        }
        return { createdExam, createdPaper, isSingle: true, paperFailed };
      }
      
      return { createdExam, isSingle: false };
    },
    onSuccess: (result: any) => {
      setIsRedirecting(true);
      setExamContext(result.createdExam.id, result.createdExam.schoolId, result.createdExam.sessionId || "");
      if (result.isSingle && result.createdPaper) {
        toast.success(`${typeLabel} and Subject Paper created successfully!`);
        router.push(`/dashboard/admin/exams/papers/${result.createdPaper.id}`);
      } else {
        if (result.paperFailed) {
          toast.warn(`Assessment created, but the default subject paper could not be created.`, { autoClose: 6000 });
        } else {
          toast.success(`${typeLabel} created successfully!`);
        }
        router.push(`/dashboard/admin/exams/${result.createdExam.id}/papers`);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || `Failed to create ${typeLabel.toLowerCase()}`;
      toast.error(typeof message === 'string' ? message : "An error occurred");
    },
  });

  const onSubmit = (data: ExamFormValues) => createFullExam(data);


  return (
    <Box sx={{ width: '100%' }} className="max-w-6xl mx-auto space-y-5 sm:space-y-8 pb-16 sm:pb-20">
      {/* Mobile Step Indicator (sm:hidden) */}
      <div className="sm:hidden bg-white dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm shadow-blue-500/20">
              {activeStep + 1}
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Step {activeStep + 1} of {steps.length}
              </span>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {steps[activeStep]}
              </h2>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {Math.round(((activeStep + 1) / steps.length) * 100)}%
          </span>
        </div>
        {/* Progress pill tracks */}
        <div className="grid grid-cols-3 gap-1.5">
          {steps.map((stepName, idx) => (
            <button
              key={stepName}
              type="button"
              onClick={handleStep(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === activeStep
                  ? "bg-blue-600"
                  : idx < activeStep || completed[idx]
                  ? "bg-emerald-500"
                  : "bg-slate-200 dark:bg-slate-800"
              }`}
              title={stepName}
            />
          ))}
        </div>
      </div>

      {/* Desktop / Tablet Stepper (hidden sm:block) */}
      <div className="hidden sm:block">
        <Stepper 
          nonLinear 
          activeStep={activeStep} 
          className="mb-8"
          sx={{
            '& .MuiStepIcon-root': {
              width: 32,
              height: 32,
            },
            '& .MuiStepIcon-text': {
              fontSize: '1rem',
              fontWeight: 'bold',
            }
          }}
        >
          {steps.map((label, index) => (
            <Step key={label} completed={completed[index]}>
              <StepButton type="button" color="inherit" onClick={handleStep(index)}>
                <span className="text-slate-800 dark:text-slate-200 font-LexendMedium text-sm lg:text-base">
                  {label}
                </span>
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </div>

      <form 
        onSubmit={handleSubmit(onSubmit)} 
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target instanceof HTMLElement && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
          }
        }}
        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm space-y-6 sm:space-y-8"
      >
        
        {/* Hidden internal configuration fields */}
        <input type="hidden" {...register("schoolId")} />
        <input type="hidden" {...register("category")} />
        <input type="hidden" {...register("mode")} />
        <input type="hidden" {...register("scope")} />
        <input type="hidden" {...register("creationMode")} />

        {activeStep === 0 && (
          <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="title" className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">{typeLabel} Title</Label>
              <Input
                id="title"
                placeholder={`e.g. 2026 First Term Mock ${typeLabel}`}
                {...register("title")}
                className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-3.5 sm:px-4 focus:ring-2 focus:ring-primary/20 transition-all text-base sm:text-lg font-medium"
              />
              {errors.title && <p className="text-red-500 text-xs font-bold">{errors.title.message}</p>}
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="description" className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Instructions</Label>
              <Textarea
                id="description"
                placeholder={`Describe the ${typeLabel.toLowerCase()} guidelines...`}
                {...register("description")}
                className="rounded-xl sm:rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-3.5 sm:p-4 focus:ring-2 focus:ring-primary/20 transition-all min-h-[120px] sm:min-h-[160px] text-sm sm:text-base resize-none"
              />
            </div>

            {defaultMode === "SINGLE_SUBJECT" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800/50">
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-xs sm:text-sm font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <BookOpen size={16} className="text-blue-500" /> Subject
                  </Label>
                  <SearchableSelect
                    options={(subjectsData || []).map((sub: any) => ({ value: sub.id, label: sub.name }))}
                    value={watch("subjectId") || ""}
                    onChange={(val) => setValue("subjectId", val)}
                    placeholder="Select Subject"
                    isLoading={isLoadingSubjects}
                  />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-xs sm:text-sm font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <User size={16} className="text-indigo-500" /> Assign Teacher
                  </Label>
                  <SearchableSelect
                    options={(teachersData || []).map((t: any) => ({ value: t.id, label: `${t.user?.name || t.name || "Unknown"} ${t.user?.email ? `(${t.user.email})` : ""}` }))}
                    value={watch("teacherId") || ""}
                    onChange={(val) => setValue("teacherId", val)}
                    placeholder="Select Teacher (Optional)"
                    isLoading={isLoadingTeachers}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-6 col-span-1 md:col-span-2">
                  <div className="space-y-2 sm:space-y-3">
                    <Label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Duration (Mins)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 60"
                      {...register("durationMinutes")}
                      className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-3.5 sm:px-4 font-medium text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">Pass Mark (%)</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 50"
                      {...register("passMark")}
                      className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-3.5 sm:px-4 font-medium text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeStep === 1 && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Session Selector */}
            {(() => {
              const sessionList = Array.isArray(sessions) ? sessions : (sessions?.data || []);
              return (
                <div className="space-y-3 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                  {sessionList.length > 0 ? (
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                        <Calendar size={14} /> Academic Session
                      </Label>
                      <SearchableSelect
                        options={[
                          { value: "", label: "No Session (Select to link)" },
                          ...sessionList.map((session: any) => ({ value: session.id, label: session.name }))
                        ]}
                        value={watch("sessionId") || ""}
                        onChange={(val) => setValue("sessionId", val)}
                        placeholder="Select Academic Session"
                        isLoading={loadingSessions}
                      />
                    </div>
                  ) : (
                    <div className="h-12 flex items-center px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs sm:text-sm font-medium border border-dashed border-slate-200 dark:border-slate-700">
                      {loadingSessions ? (
                        <span className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin" /> Fetching active sessions...
                        </span>
                      ) : isError ? (
                        <span className="flex items-center gap-2 text-red-400">
                          <AlertCircle size={16} /> Error loading session data
                        </span>
                      ) : (
                        "No active sessions found. Proceed without session."
                      )}
                    </div>
                  )}
                  {errors.sessionId && <p className="text-red-500 text-xs font-bold">{errors.sessionId.message}</p>}
                </div>
              );
            })()}

            <div className="space-y-3 pt-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Assessment Scope</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {[
                  { value: "SCHOOL", label: "Whole School", desc: "For everyone", icon: School },
                  { value: "CLASS", label: "Specific Class", desc: "Target a class", icon: Users },
                  { value: "DEPARTMENT", label: "Specific Dept", desc: "Target a dept", icon: Building2 },
                ].map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setValue("scope", opt.value as any)}
                    className={`cursor-pointer p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 flex items-center sm:items-start sm:flex-col gap-3 sm:gap-2 ${watch("scope") === opt.value ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-md shadow-blue-500/10 scale-[1.01]" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"}`}
                  >
                    <div className={`p-2 rounded-xl sm:p-0 sm:rounded-none ${watch("scope") === opt.value ? "bg-blue-500/10 sm:bg-transparent" : "bg-slate-100 dark:bg-slate-800 sm:bg-transparent"}`}>
                      <opt.icon size={20} className={watch("scope") === opt.value ? "text-blue-500" : "text-slate-400"} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 leading-none mb-1">{opt.label}</h4>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`space-y-2 transition-all duration-300 ${watchedScope === "CLASS" ? "opacity-100 h-auto" : "opacity-50 pointer-events-none"}`}>
              <Label className="text-xs font-black uppercase tracking-widest text-blue-500">Target Class</Label>
              <SearchableSelect
                options={[
                  { value: "", label: "Select a class..." },
                  ...(classesData || []).map((c: any) => ({ value: c.id, label: `${c.name} ${c.section || ""}`.trim() }))
                ]}
                value={watch("classId") || ""}
                onChange={(val) => setValue("classId", val)}
                disabled={watchedScope !== "CLASS"}
                isLoading={isLoadingClasses}
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className={`text-xs font-black uppercase tracking-widest ${watchedScope === "DEPARTMENT" || (watchedScope === "CLASS" && watch("classId")) ? "text-purple-500" : "text-slate-400"}`}>
                  Target Departments {watchedScope === "CLASS" && <span className="text-[10px] lowercase font-normal opacity-70">(optional - filter by department)</span>}
                </Label>
                {watch("departmentIds") && watch("departmentIds").length > 0 && (
                  <button
                    type="button"
                    onClick={() => setValue("departmentIds", [])}
                    className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    Clear selection
                  </button>
                )}
              </div>
              {isLoadingDepartments ? (
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3`}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 animate-pulse"></div>
                  ))}
                </div>
              ) : departmentsData && departmentsData.length > 0 ? (
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3`}>
                  {departmentsData.map((d: any) => {
                    const isSelected = watch("departmentIds")?.includes(d.id);
                    return (
                      <div key={d.id} onClick={() => {
                          const current = watch("departmentIds") || [];
                          setValue("departmentIds", current.includes(d.id) ? current.filter(id => id !== d.id) : [...current, d.id]);
                        }}
                        className={`cursor-pointer group flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 ${isSelected ? "bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300 shadow-md shadow-purple-500/10 scale-[1.01]" : "bg-white dark:bg-slate-900 shadow-sm border-slate-100 hover:border-slate-300 dark:border-slate-800"}`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${isSelected ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-transparent"}`}>
                          <Check size={12} strokeWidth={4} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold truncate leading-tight">{d.name}</span>
                          <span className="text-[10px] uppercase font-black opacity-50 tracking-widest mt-0.5">{d.code}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-12 flex items-center px-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-xs font-medium border border-dashed border-slate-200 dark:border-slate-800">
                  No departments found.
                </div>
              )}
            </div>

            <div className="pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800/50 space-y-3 sm:space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Creation Mode</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { value: "MANUAL", label: "Manual Configuration", desc: "Build it yourself", icon: Settings },
                  { value: "AI", label: "AI Generation Assistant", desc: "Let AI build it", icon: Wand2, isAi: true },
                ].map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setValue("creationMode", opt.value as any)}
                    className={`cursor-pointer p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 flex items-center gap-3.5 sm:gap-4 ${watch("creationMode") === opt.value ? (opt.isAi ? "border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 shadow-md shadow-purple-500/10 scale-[1.01]" : "border-slate-500 bg-slate-50 dark:bg-slate-800 shadow-md scale-[1.01]") : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"}`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${watch("creationMode") === opt.value ? (opt.isAi ? "bg-purple-500 text-white" : "bg-slate-700 text-white") : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                      <opt.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 leading-none mb-1">{opt.label}</h4>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500/70" /> Start Date & Time
                </Label>
                <Input id="startDate" type="datetime-local" {...register("startDate")} className="h-12 sm:h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-sm sm:text-base" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Calendar size={14} className="text-rose-500/70" /> Concludes At
                </Label>
                <Input id="endDate" type="datetime-local" {...register("endDate")} className="h-12 sm:h-14 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-sm sm:text-base" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <Label className="text-xs sm:text-sm font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FileText size={16} className="text-blue-500" /> Result Visibility
                </Label>
                <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                  {[
                    { value: true, label: "Immediate Visibility", desc: "Students see results instantly", icon: Eye },
                    { value: false, label: "Hidden Results", desc: "Delay till release date", icon: EyeOff },
                  ].map((opt) => (
                    <div
                      key={opt.value.toString()}
                      onClick={() => setValue("allowImmediateResult", opt.value)}
                      className={`cursor-pointer p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 flex items-center gap-3.5 sm:gap-4 ${watch("allowImmediateResult") === opt.value ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-md shadow-emerald-500/10 scale-[1.01]" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"}`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${watch("allowImmediateResult") === opt.value ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                        <opt.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 leading-none mb-1">{opt.label}</h4>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{opt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {watch("allowImmediateResult") === false && (
                <div className="space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-left-4 duration-500">
                  <Label htmlFor="resultReleaseAt" className="text-xs sm:text-sm font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Calendar size={16} className="text-emerald-500" /> Result Release Date
                  </Label>
                  <Input
                    id="resultReleaseAt"
                    type="datetime-local"
                    {...register("resultReleaseAt")}
                    className="h-12 sm:h-14 rounded-xl sm:rounded-2xl border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10 font-medium focus:ring-emerald-500/30 shadow-sm text-sm sm:text-base"
                  />
                  <p className="text-xs text-slate-500 leading-relaxed pl-1">
                    Results will remain hidden from students until this exact date and time.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outline"
            type="button"
            className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl font-bold border-slate-200 dark:border-slate-800"
          >
            Back
          </Button>

          {activeStep !== steps.length - 1 ? (
            <Button
              onClick={handleNext}
              type="button"
              className="h-11 sm:h-12 px-5 sm:px-8 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending || isRedirecting || !watchedSchoolId || !canSubmit}
              className="h-11 sm:h-12 px-5 sm:px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : isRedirecting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Redirecting...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Create {typeLabel}</span>
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Box>
  );
}
