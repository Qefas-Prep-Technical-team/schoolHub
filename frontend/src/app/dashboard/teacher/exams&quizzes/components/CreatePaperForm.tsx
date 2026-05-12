'use client';

import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { examService } from '@/lib/api/services/examService';
import { teacherService } from '@/lib/api/services/teacherService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { Loader2, Sparkles, Building2, User } from 'lucide-react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';


const paperSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  title: z.string().min(3, "Title is too short"),
  instructions: z.string().min(5, "Please provide instructions"),
  durationMinutes: z.number().min(1, "Duration is required"),
  totalMarks: z.number().min(1, "Total marks is required"),
  readingContent: z.string().optional(),
});

type PaperFormValues = z.infer<typeof paperSchema>;

interface CreatePaperFormProps {
    onSuccess?: (paperId: string) => void;
}

export default function CreatePaperForm({ onSuccess }: CreatePaperFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { selectedSchoolId, selectedSchoolName } = useDashboardStore();

  const isPersonal = selectedSchoolId === user?.id || !selectedSchoolId;

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['teacher-assigned-subjects', selectedSchoolId],
    queryFn: () => teacherService.getSubjects({ schoolId: isPersonal ? undefined : selectedSchoolId }),
    enabled: !!selectedSchoolId,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<PaperFormValues>({
    resolver: zodResolver(paperSchema),
    defaultValues: {
      subjectId: "",
      title: "",
      instructions: "",
      durationMinutes: 60,
      totalMarks: 100,
      readingContent: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PaperFormValues) => 
      examService.createSubjectPaper(null, { 
        ...data, 
        schoolId: selectedSchoolId,
        teacherId: user?.id 
      }),
    onSuccess: (response: Record<string, unknown>) => {
      console.log("DEBUG: [CreatePaperForm] Response received:", response);
      toast.success("Subject paper created successfully!");
      queryClient.invalidateQueries({ queryKey: ["teacher-exams"] });
      if (response?.id) {
        onSuccess?.(response.id);
      } else {
        console.error("DEBUG: [CreatePaperForm] No paper ID found in response");
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error?.response?.data?.message || "Failed to create paper");
    },
  });


  return (
    <div className="space-y-8">
      {/* Context Header */}
      <div className="flex flex-col gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Building2 className="text-primary w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Context</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">{isPersonal ? "Personal Dashboard" : (selectedSchoolName || "Unknown School")}</p>
                </div>
            </div>
            <div className="hidden md:block h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <User className="text-emerald-500 w-5 h-5" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Teacher</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">{user?.name || user?.email}</p>
                </div>
            </div>
        </div>
        
        {/* New: Assigned Subjects List */}
        {!isLoadingSubjects && subjects?.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Your Assigned Subjects in this School:</p>
                <div className="flex flex-wrap gap-2">
                    {(subjects as Record<string, unknown>[]).map((s: Record<string, unknown>) => (
                        <span key={s.id} className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {s.name}
                        </span>
                    ))}
                </div>
            </div>
        )}
      </div>

      <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Subject Selector */}
          <div className="space-y-2.5 relative">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1 flex justify-between items-center">
               <span>Subject</span>
               {isLoadingSubjects && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
            </Label>
            <div className="relative">
              <select
                {...register("subjectId")}
                disabled={isLoadingSubjects}
                className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all shadow-inner disabled:opacity-50 appearance-none"
              >
                <option value="">{isLoadingSubjects ? "Loading subjects..." : "Select a subject..."}</option>
                {!isLoadingSubjects && (subjects as Record<string, unknown>[]).map((s: Record<string, unknown>) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {isLoadingSubjects && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              )}
            </div>
            {errors.subjectId && <p className="text-red-500 text-[10px] font-bold px-1 uppercase">{errors.subjectId.message}</p>}
          </div>

          {/* Duration */}
          <div className="space-y-2.5">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">
               Duration (Mins)
            </Label>
            <Input
              type="number"
              {...register("durationMinutes", { valueAsNumber: true })}
              className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 font-bold focus:ring-primary/5 shadow-inner"
            />
            {errors.durationMinutes && <p className="text-red-500 text-[10px] font-bold px-1 uppercase">{errors.durationMinutes.message}</p>}
          </div>
        </div>

        <div className="space-y-2.5">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">
             Paper Title
          </Label>
          <Input
            {...register("title")}
            placeholder="e.g. Mathematics Mid-Term"
            className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 font-bold focus:ring-primary/5 shadow-inner"
          />
          {errors.title && <p className="text-red-500 text-[10px] font-bold px-1 uppercase">{errors.title.message}</p>}
        </div>

        <div className="space-y-2.5">
          <Label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">Instructions</Label>
          <Textarea
            {...register("instructions")}
            placeholder="Review all instructions before starting..."
            className="rounded-2xl min-h-[100px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 font-bold focus:ring-primary/5 shadow-inner text-sm leading-relaxed"
          />
          {errors.instructions && <p className="text-red-500 text-[10px] font-bold px-1 uppercase">{errors.instructions.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
           {/* Total Marks */}
           <div className="space-y-2.5">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">Total Marks</Label>
            <Input
              type="number"
              {...register("totalMarks", { valueAsNumber: true })}
              className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 font-bold focus:ring-primary/5 shadow-inner"
            />
            {errors.totalMarks && <p className="text-red-500 text-[10px] font-bold px-1 uppercase">{errors.totalMarks.message}</p>}
          </div>
          
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Sparkles size={18} />
                  <span className="text-xs">Create & Continue</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
