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
import { Loader2, LayoutGrid, FileText, Settings2, School, Calendar, ArrowRight, AlertCircle, Check, CheckCircle2 } from "lucide-react";

import { examService, CreateExamDTO } from "@/lib/api/services/examService";
import { useExamStore } from "@/store/examStore";
import { useSessions } from "@/lib/api/hooks/useSessions";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8">

        {/* <div className="border-b border-slate-100 dark:border-slate-800 pb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Exam</h2>
          <p className="text-sm text-slate-500">Initialize your examination settings and link a session.</p>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          {/* School Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-bold flex items-center gap-2">
              <School size={16} className="text-blue-500" /> Select School
            </Label>
            <select
              {...register("schoolId")}
              className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">Choose a school...</option>
              {(user as any)?.schools?.map((s: any) => (
                <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
              ))}
            </select>
            {errors.schoolId && <p className="text-red-500 text-xs font-medium">{errors.schoolId.message}</p>}
          </div>

          {/* Session Selector - Now using array logic */}
          <div className="space-y-3">
            {sessions && sessions.data?.length > 0 ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-sm font-bold flex items-center gap-2 text-emerald-600">
                  <Calendar size={16} /> Active Session Found (Optional)
                </Label>
                <select
                  {...register("sessionId")}
                  className="w-full h-12 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-900/10 px-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                >
                  <option value="">No Session (Select to link)</option>
                  {sessions.data?.map((session: any) => (
                    <option key={session.id} value={session.id}>{session.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="h-12 flex items-center px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs italic border border-dashed border-slate-200">
                {loadingSessions ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Fetching sessions...
                  </span>
                ) : isError ? (
                  <span className="flex items-center gap-2 text-red-400">
                    <AlertCircle size={14} /> Error loading data
                  </span>
                ) : !watchedSchoolId ? (
                  "Waiting for school selection..."
                ) : (
                  "No sessions found for this school"
                )}
              </div>
            )}
            {errors.sessionId && <p className="text-red-500 text-xs font-medium">{errors.sessionId.message}</p>}
          </div>
        </div>

        {/* --- Exam Content --- */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-bold">Exam Title</Label>
            <Input
              id="title"
              placeholder="e.g. 2026 First Term Mock Exam"
              {...register("title")}
              className="h-12 rounded-2xl border-slate-200 dark:border-slate-800"
            />
            {errors.title && <p className="text-red-500 text-xs font-medium">{errors.title.message}</p>}
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-bold">Instructions</Label>
            <Textarea
              id="description"
              placeholder="Describe the exam guidelines..."
              {...register("description")}
              className="rounded-2xl border-slate-200 dark:border-slate-800 min-h-[100px]"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="startDate" className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <Calendar size={16} className="text-blue-500/50" /> Start Date & Time (Optional)
            </Label>
            <Input
              id="startDate"
              type="datetime-local"
              {...register("startDate")}
              className="h-12 rounded-2xl border-slate-200 dark:border-slate-800"
            />
            <p className="text-[10px] text-slate-500 font-medium">If set, students cannot start before this time.</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="endDate" className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <Calendar size={16} className="text-rose-500/50" /> Concludes At (Optional)
            </Label>
            <Input
              id="endDate"
              type="datetime-local"
              {...register("endDate")}
              className="h-12 rounded-2xl border-slate-200 dark:border-slate-800"
            />
            <p className="text-[10px] text-slate-500 font-medium">If set, the exam becomes unavailable after this time.</p>
          </div>
        </div>

        {/* --- Config --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Assessment Type</Label>
            <select
              {...register("category")}
              className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 text-sm outline-none bg-transparent font-bold text-blue-600"
            >
              <option value="EXAM">Formal Examination</option>
              <option value="QUIZ">Quick Quiz</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Scope</Label>
            <select {...register("scope")} className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 text-sm outline-none bg-transparent">
              <option value="SCHOOL">Whole School</option>
              <option value="CLASS">By Class</option>
              <option value="DEPARTMENT">By Department</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-black text-blue-500">Target Class (Optional)</Label>
            <select
              {...register("classId")}
              className="w-full h-12 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/20 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Select a class...</option>
              {classesData?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} {c.section}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] uppercase tracking-widest font-black text-purple-500">
                Target Departments (Optional) {watchedClassId && "for selected class"}
              </Label>
              <span className="text-[10px] font-bold text-slate-400">
                {watch("departmentIds")?.length || 0} Selected
              </span>
            </div>
            
            {departmentsData && departmentsData.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                      className={`cursor-pointer group flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                        isSelected 
                          ? "bg-purple-50 border-purple-500/50 text-purple-700 shadow-sm shadow-purple-100" 
                          : "bg-slate-50 shadow-none border-slate-100 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
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
                {watchedSchoolId ? "No departments found for this selection" : "Select a school first"}
              </div>
            )}
            <p className="text-[10px] text-slate-500 font-medium">Leave empty for a class-wide or school-wide general exam.</p>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Creation</Label>
            <select {...register("creationMode")} className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 text-sm outline-none bg-transparent">
              <option value="MANUAL">Manual</option>
              <option value="AI">AI Assistant</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-black text-slate-400">Mode</Label>
            <select {...register("mode")} className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 text-sm outline-none bg-transparent">
              <option value="SINGLE_SUBJECT">Single Subject</option>
              <option value="COMBINED">Combined</option>
            </select>
          </div>
        </div>

        {/* --- Result Settings --- */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-sm font-bold flex items-center gap-2">
                <FileText size={16} className="text-blue-500" /> Result Visibility
              </Label>
              <select
                {...register("allowImmediateResult", {
                  setValueAs: (v) => v === "true",
                })}
                className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 px-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              >
                <option value="true">Immediate (After Submission)</option>
                <option value="false">Hidden (Till Release Date)</option>
              </select>
              <p className="text-[10px] text-slate-500 font-medium">Determines if students see their scores immediately.</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="resultReleaseAt" className="text-sm font-bold flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" /> Result Release Date
              </Label>
              <Input
                id="resultReleaseAt"
                type="datetime-local"
                disabled={watch("allowImmediateResult") === true}
                {...register("resultReleaseAt")}
                className="h-12 rounded-2xl border-slate-200 dark:border-slate-800"
              />
              <p className="text-[10px] text-slate-500 font-medium">If hidden, scores will be revealed at this time.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl">
        <div className="text-center sm:text-left">
          <p className="text-sm font-bold text-slate-900 dark:text-white">Next Step: Papers & Questions</p>
          <p className="text-xs text-slate-500">Redirecting to paper setup after save.</p>
        </div>
        <Button
          type="submit"
          disabled={isPending || !watchedSchoolId}
          className="w-full sm:w-auto px-10 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all flex gap-3 shadow-lg shadow-blue-200 dark:shadow-none"
        >
          {isPending ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
          {isPending ? "Initializing..." : "Create & Continue"}
        </Button>
      </div>
    </form>
  );
}