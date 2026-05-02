/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { Loader2, LayoutGrid, FileText, Settings2, School, Calendar, ArrowRight, AlertCircle, Check, CheckCircle2, Zap, ShieldCheck, Cpu, Globe, Target, Layers } from "lucide-react";

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
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema) as any,
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
  const { data: settings } = useSchoolSettings(watchedSchoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  // sessions now represents the Array [{id, name...}]
  const { data: sessions, isLoading: loadingSessions, isError } = useSessions(watchedSchoolId);

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
    if (user && (user as any).schools?.length === 1 && !watchedSchoolId) {
      setValue("schoolId", (user as any).schools[0].schoolId);
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

  // TRIGGER 3: Auto-select if exactly 1 session is found
  useEffect(() => {
    if (sessions && sessions.length === 1) {
      setValue("sessionId", sessions[0].id);
    }
  }, [sessions, setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateExamDTO) => examService.createExam(data),
    onSuccess: (data) => {
      toast.success("Exam created successfully!");
      setExamContext(data.id, data.schoolId, data.sessionId || "");
      router.push(`/dashboard/admin/exams/${data.id}/papers`);
    },
    onError: (error: any) => {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 pb-20">
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[4rem] p-12 lg:p-16 shadow-2xl space-y-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-[0.03] pointer-events-none" style={{ backgroundColor: primaryColor }} />
        
        <div className="space-y-10">
          <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-white/10 shadow-inner" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                  <Cpu size={24} strokeWidth={2.5} />
              </div>
              <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Core Configuration</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Ingress Parameters</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>Institutional Node</span>
                <School size={14} className="text-slate-300" />
              </Label>
              <select
                {...register("schoolId")}
                className="w-full h-16 rounded-2xl border-2 border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 px-6 outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                style={{ '--tw-ring-color': `${primaryColor}20` } as any}
              >
                <option value="">Choose a school...</option>
                {(user as any)?.schools?.map((s: any) => (
                  <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
                ))}
              </select>
              {errors.schoolId && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{errors.schoolId.message}</p>}
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>Temporal Registry</span>
                <Calendar size={14} className="text-slate-300" />
              </Label>
              {sessions && sessions.data?.length > 0 ? (
                <select
                  {...register("sessionId")}
                  className="w-full h-16 rounded-2xl border-2 border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 px-6 outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                  style={{ '--tw-ring-color': `${primaryColor}20` } as any}
                >
                  <option value="">No Session (Select to link)</option>
                  {sessions.data?.map((session: any) => (
                    <option key={session.id} value={session.id}>{session.name}</option>
                  ))}
                </select>
              ) : (
                <div className="h-16 flex items-center px-6 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 text-xs italic border-2 border-dashed border-slate-100 dark:border-white/5 font-bold uppercase tracking-widest">
                  {loadingSessions ? (
                    <span className="flex items-center gap-3">
                      <Loader2 size={16} className="animate-spin" /> Fetching...
                    </span>
                  ) : !watchedSchoolId ? (
                    "Awaiting School Node..."
                  ) : (
                    "No sessions discovered"
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 dark:border-white/5 space-y-10">
          <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-white/10 shadow-inner" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                  <FileText size={24} strokeWidth={2.5} />
              </div>
              <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Identity & Scope</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Targeting</p>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Node Designation (Title)</Label>
              <Input
                id="title"
                placeholder="e.g. 2026 FIRST TERM PERFORMANCE SYNC"
                {...register("title")}
                className="h-16 px-6 rounded-2xl bg-slate-50/50 dark:bg-white/5 border-2 border-slate-50 dark:border-white/5 focus:border-primary transition-all font-bold text-slate-700 dark:text-slate-200"
                style={{ '--tw-ring-color': `${primaryColor}20` } as any}
              />
              {errors.title && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{errors.title.message}</p>}
            </div>

            <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Category</Label>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        type="button"
                        onClick={() => setValue("category", "EXAM")}
                        className={cn(
                            "h-16 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all",
                            watch("category") === "EXAM" ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-slate-50 dark:bg-white/5 border-slate-50 dark:border-white/5 text-slate-400"
                        )}
                        style={{ backgroundColor: watch("category") === "EXAM" ? primaryColor : undefined, borderColor: watch("category") === "EXAM" ? primaryColor : undefined }}
                    >
                        Formal Exam
                    </button>
                    <button 
                        type="button"
                        onClick={() => setValue("category", "QUIZ")}
                        className={cn(
                            "h-16 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all",
                            watch("category") === "QUIZ" ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-slate-50 dark:bg-white/5 border-slate-50 dark:border-white/5 text-slate-400"
                        )}
                        style={{ backgroundColor: watch("category") === "QUIZ" ? primaryColor : undefined, borderColor: watch("category") === "QUIZ" ? primaryColor : undefined }}
                    >
                        Tactical Quiz
                    </button>
                </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Instructions</Label>
            <Textarea
              id="description"
              placeholder="Provide tactical guidelines for participants..."
              {...register("description")}
              className="rounded-3xl bg-slate-50/50 dark:bg-white/5 border-2 border-slate-50 dark:border-white/5 focus:border-primary transition-all font-bold text-slate-700 dark:text-slate-200 min-h-[120px] p-6"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Target size={14} className="text-slate-300" /> Operational Scope
                </Label>
                <select 
                    {...register("scope")} 
                    className="w-full h-16 rounded-2xl border-2 border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 px-6 outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                    style={{ '--tw-ring-color': `${primaryColor}20` } as any}
                >
                  <option value="SCHOOL">Whole Institutional Network</option>
                  <option value="CLASS">Specific Class Cluster</option>
                  <option value="DEPARTMENT">Departmental Segment</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} className="text-slate-300" /> Target Class (Optional)
                </Label>
                <select
                  {...register("classId")}
                  className="w-full h-16 rounded-2xl border-2 border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 px-6 outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                  style={{ '--tw-ring-color': `${primaryColor}20` } as any}
                >
                  <option value="">Select Class Module...</option>
                  {classesData?.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} {c.section}</option>
                  ))}
                </select>
              </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Departmental Targeting
              </Label>
              <div className="px-3 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-500">
                {watch("departmentIds")?.length || 0} Nodes Selected
              </div>
            </div>
            
            {departmentsData && departmentsData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentsData.map((d: any) => {
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
                          "cursor-pointer group flex items-center gap-5 p-5 rounded-3xl border-2 transition-all duration-300",
                          isSelected 
                            ? "bg-primary/5 border-primary shadow-xl shadow-primary/10" 
                            : "bg-slate-50/50 dark:bg-white/5 border-slate-50 dark:border-white/5 hover:border-primary/30"
                      )}
                      style={{ 
                        borderColor: isSelected ? primaryColor : undefined,
                        backgroundColor: isSelected ? `${primaryColor}10` : undefined,
                        boxShadow: isSelected ? `0 20px 40px -10px ${primaryColor}20` : undefined
                      } as any}
                    >
                      <div className={cn(
                          "size-8 rounded-xl flex items-center justify-center transition-all duration-500",
                          isSelected ? "bg-primary text-white scale-110" : "bg-slate-200 dark:bg-white/10 text-transparent"
                      )}
                      style={{ backgroundColor: isSelected ? primaryColor : undefined }}
                      >
                        <Check size={14} strokeWidth={4} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={cn("text-xs font-black uppercase tracking-tight truncate", isSelected ? "text-slate-900 dark:text-white" : "text-slate-500")}>{d.name}</span>
                        <span className="text-[9px] uppercase font-black opacity-40 tracking-widest">{d.code}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center rounded-3xl bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-100 dark:border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
                {watchedSchoolId ? "No departmental nodes discovered" : "Initialize school node selection"}
              </div>
            )}
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 dark:border-white/5 space-y-10">
          <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-white/10 shadow-inner" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                  <ShieldCheck size={24} strokeWidth={2.5} />
              </div>
              <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Result Protocols</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visibility & Authorization</p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronization Mode</Label>
              <select
                {...register("allowImmediateResult", {
                  setValueAs: (v) => v === "true",
                })}
                className="w-full h-16 rounded-2xl border-2 border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 px-6 outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                style={{ '--tw-ring-color': `${primaryColor}20` } as any}
              >
                <option value="true">Immediate Sync (Visible On Completion)</option>
                <option value="false">Temporal Delay (Released on Date)</option>
              </select>
            </div>

            <div className="space-y-4">
              <Label htmlFor="resultReleaseAt" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry Release (Optional)</Label>
              <Input
                id="resultReleaseAt"
                type="datetime-local"
                disabled={watch("allowImmediateResult") === true}
                {...register("resultReleaseAt")}
                className="h-16 px-6 rounded-2xl bg-slate-50/50 dark:bg-white/5 border-2 border-slate-50 dark:border-white/5 focus:border-primary transition-all font-bold text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 p-10 bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[3.5rem] shadow-2xl">
        <div className="text-center sm:text-left space-y-1">
          <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">PHASE 01 COMPLETED</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Phase: Performance Node Infrastructure (Papers)</p>
        </div>
        <Button
          type="submit"
          disabled={isPending || !watchedSchoolId}
          style={{ backgroundColor: primaryColor }}
          className="w-full sm:w-auto px-12 h-16 rounded-[2rem] text-white font-black uppercase tracking-widest transition-all flex gap-4 shadow-2xl hover:scale-105 active:scale-95 border-none"
        >
          {isPending ? (
              <span className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  INITIALIZING...
              </span>
          ) : (
              <span className="flex items-center gap-3">
                  INITIALIZE NODE
                  <ArrowRight size={20} strokeWidth={3} />
              </span>
          )}
        </Button>
      </div>
    </form>
  );
}

