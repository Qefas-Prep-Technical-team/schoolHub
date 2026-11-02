'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { examService } from '@/lib/api/services/examService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { Loader2, Sparkles, BookOpen, Clock, FileText, User } from 'lucide-react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { apiClient } from '@/lib/api/client';

const paperSchema = z.object({
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
  title: z.string().min(3, 'Title is too short'),
  instructions: z.string().min(5, 'Please provide instructions'),
  durationMinutes: z.coerce.number().min(1, 'Duration is required'),
  totalMarks: z.coerce.number().min(1, 'Total marks is required'),
  readingContent: z.string().optional(),
});

type PaperFormValues = z.infer<typeof paperSchema>;

interface AdminCreatePaperModalProps {
  onSuccess?: (paperId: string) => void;
}

export default function AdminCreatePaperModal({ onSuccess }: AdminCreatePaperModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || (user as any)?.defaultTenantId;

  // 1. Fetch Subjects
  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['admin-school-subjects', schoolId],
    queryFn: async () => {
      const url = schoolId ? `/academic/subjects?schoolId=${schoolId}` : '/academic/subjects';
      const { data } = await apiClient.get(url);
      return data.data || [];
    },
    enabled: !!schoolId,
  });

  // 2. Fetch Teachers
  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['admin-school-teachers', schoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/schools/${schoolId}/teachers`);
      return data.data || [];
    },
    enabled: !!schoolId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaperFormValues>({
    resolver: zodResolver(paperSchema) as any,
    defaultValues: {
      subjectId: '',
      teacherId: '',
      title: '',
      instructions: '',
      durationMinutes: 60,
      totalMarks: 100,
      readingContent: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PaperFormValues) =>
      examService.createSubjectPaper(null, {
        ...data,
        schoolId: schoolId || undefined,
        teacherId: data.teacherId || user?.id,
      }),
    onSuccess: (response: any) => {
      toast.success('Subject paper created successfully!');
      queryClient.invalidateQueries({ queryKey: ['subject-papers'] });
      if (response?.id) {
        onSuccess?.(response.id);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create subject paper');
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Subject Selector */}
        <div className="space-y-1.5 relative">
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <BookOpen size={13} className="text-blue-500" /> Subject (Optional)
          </Label>
          <div className="relative">
            <select
              {...register('subjectId')}
              disabled={isLoadingSubjects}
              className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">{isLoadingSubjects ? 'Loading subjects...' : 'Select Subject...'}</option>
              {!isLoadingSubjects &&
                (subjects as any[]).map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
            {isLoadingSubjects && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400 pointer-events-none" />
            )}
          </div>
        </div>

        {/* Teacher Selector */}
        <div className="space-y-1.5 relative">
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <User size={13} className="text-emerald-500" /> Teacher (Optional)
          </Label>
          <div className="relative">
            <select
              {...register('teacherId')}
              disabled={isLoadingTeachers}
              className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">{isLoadingTeachers ? 'Loading teachers...' : 'Select Teacher...'}</option>
              {!isLoadingTeachers &&
                (teachers as any[]).map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.user?.name || t.email || 'Teacher'}
                  </option>
                ))}
            </select>
            {isLoadingTeachers && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400 pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      {/* Paper Title */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Paper Title <span className="text-rose-500">*</span>
        </Label>
        <Input
          {...register('title')}
          placeholder="e.g. Mathematics Mid-Term Paper 1"
          className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
        />
        {errors.title && <p className="text-rose-500 text-xs">{errors.title.message}</p>}
      </div>

      {/* Duration and Total Marks */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Clock size={13} className="text-amber-500" /> Duration (Mins)
          </Label>
          <Input
            type="number"
            {...register('durationMinutes')}
            className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          />
          {errors.durationMinutes && <p className="text-rose-500 text-xs">{errors.durationMinutes.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Marks</Label>
          <Input
            type="number"
            {...register('totalMarks')}
            className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          />
          {errors.totalMarks && <p className="text-rose-500 text-xs">{errors.totalMarks.message}</p>}
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Instructions</Label>
        <Textarea
          {...register('instructions')}
          placeholder="Enter instructions for candidates before they begin..."
          className="rounded-xl min-h-[85px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs leading-relaxed"
        />
        {errors.instructions && <p className="text-rose-500 text-xs">{errors.instructions.message}</p>}
      </div>

      {/* Reading Section (Optional) */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <FileText size={13} className="text-purple-500" /> Reading Section / Comprehension (Optional)
        </Label>
        <Textarea
          {...register('readingContent')}
          placeholder="Paste comprehension passage or reference text here..."
          className="rounded-xl min-h-[90px] border-purple-200 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/20 text-xs leading-relaxed"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold uppercase tracking-wider text-xs transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Creating Subject Paper...</span>
            </>
          ) : (
            <>
              <Sparkles size={15} />
              <span>Create Subject Paper</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
