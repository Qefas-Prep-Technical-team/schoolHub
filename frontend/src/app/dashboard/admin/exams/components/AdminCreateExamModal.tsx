'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { examService, CreateExamDTO } from '@/lib/api/services/examService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { Loader2, Calendar, BookOpen, User, Layers, Info, Building2 } from 'lucide-react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { apiClient } from '@/lib/api/client';
import { useSessions } from '@/lib/api/hooks/useSessions';

const examSchema = z.object({
  title: z.string().min(3, 'Title is required (min 3 characters)'),
  description: z.string().optional(),
  mode: z.enum(['SINGLE_SUBJECT', 'COMBINED']),
  subjectId: z.string().optional(),
  classId: z.string().optional(),
  departmentIds: z.array(z.string()).default([]),
  sessionId: z.string().optional(),
  teacherId: z.string().optional(),
  startDate: z.string().optional(),
  resultReleaseAt: z.string().optional(),
  durationMinutes: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  totalMarks: z.coerce.number().min(1, 'Total marks must be at least 1'),
});

type ExamFormValues = z.infer<typeof examSchema>;

interface AdminCreateExamModalProps {
  category: 'EXAM' | 'QUIZ' | 'CA';
  initialMode?: 'SINGLE_SUBJECT' | 'COMBINED';
  onSuccess?: (examId: string, paperId?: string) => void;
}

export default function AdminCreateExamModal({
  category,
  initialMode = 'SINGLE_SUBJECT',
  onSuccess,
}: AdminCreateExamModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || (user as any)?.defaultTenantId;

  const isMultiPaperMode = (mode: string) => mode === 'COMBINED';

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

  // 2. Fetch Classes
  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['admin-school-classes', schoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/classes?schoolId=${schoolId}`);
      return data.data || [];
    },
    enabled: !!schoolId,
  });

  // 3. Fetch Departments
  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['admin-school-departments', schoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/academic/departments?schoolId=${schoolId}`);
      return data.data || [];
    },
    enabled: !!schoolId,
  });

  // 4. Fetch Teachers
  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['admin-school-teachers', schoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/schools/${schoolId}/teachers`);
      return data.data || [];
    },
    enabled: !!schoolId,
  });

  // 5. Fetch Sessions
  const { data: rawSessions, isLoading: isLoadingSessions } = useSessions(schoolId);
  const sessions = Array.isArray(rawSessions) ? rawSessions : (rawSessions?.data || []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      mode: category === 'EXAM' ? initialMode : 'SINGLE_SUBJECT',
      subjectId: '',
      classId: '',
      departmentIds: [],
      sessionId: '',
      teacherId: '',
      startDate: '',
      resultReleaseAt: '',
      durationMinutes: 60,
      totalMarks: 100,
    },
  });

  const selectedMode = watch('mode');
  const selectedDepartmentIds = watch('departmentIds') || [];

  const toggleDepartment = (deptId: string) => {
    const current = watch('departmentIds') || [];
    if (current.includes(deptId)) {
      setValue('departmentIds', current.filter((id) => id !== deptId));
    } else {
      setValue('departmentIds', [...current, deptId]);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: ExamFormValues) => {
      // 1. Create the Exam
      const isSingle = data.mode === 'SINGLE_SUBJECT';
      const exam = await examService.createExam({
        title: data.title,
        description: data.description || undefined,
        category,
        schoolId: schoolId || undefined,
        scope: data.classId ? 'CLASS' : 'SCHOOL',
        creationMode: 'MANUAL',
        mode: data.mode,
        classId: data.classId || undefined,
        departmentIds: data.departmentIds,
        sessionId: data.sessionId || undefined,
        teacherId: data.teacherId || user?.id,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        resultReleaseAt: data.resultReleaseAt ? new Date(data.resultReleaseAt).toISOString() : undefined,
        allowImmediateResult: !data.resultReleaseAt,
      } as CreateExamDTO);

      if (!exam?.id) throw new Error('Exam creation failed — no ID returned');

      // 2. If Single Subject, auto-create the default Subject Paper for this exam
      let paper = null;
      if (isSingle) {
        try {
          paper = await examService.createSubjectPaper(exam.id, {
            title: data.title,
            subjectId: data.subjectId || null,
            teacherId: data.teacherId || user?.id,
            schoolId: schoolId || undefined,
            durationMinutes: data.durationMinutes,
            totalMarks: data.totalMarks,
            instructions: data.description || '',
            creationMode: 'MANUAL',
          });
        } catch (paperError: any) {
          console.error('[AdminCreateExamModal] Paper creation failed:', paperError);
          toast.warn(
            paperError?.response?.data?.message ||
              'Assessment created, but the default subject paper could not be created.',
            { autoClose: 6000 }
          );
        }
      }

      return { exam, paper, isSingle };
    },
    onSuccess: (data: { exam: any; paper: any; isSingle: boolean }) => {
      const typeLabel = category === 'CA' ? 'Continuous Assessment' : category === 'QUIZ' ? 'Quiz' : 'Exam';
      toast.success(`${typeLabel} created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['subject-papers'] });

      if (onSuccess) {
        onSuccess(data.exam.id, data.paper?.id);
      }
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.response?.data?.message || `Failed to create ${category.toLowerCase()}`);
    },
  });

  const onSubmit = (data: ExamFormValues) => {
    mutation.mutate(data);
  };

  const typeLabel =
    category === 'CA'
      ? 'Continuous Assessment'
      : category === 'QUIZ'
      ? 'Quiz'
      : selectedMode === 'COMBINED'
      ? 'Multi-Paper Exam'
      : 'Single Paper Exam';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-2xl text-xs flex gap-2.5 items-start border border-blue-200/60 dark:border-blue-800/60">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="space-y-1">
          <p>
            <strong>Quick Setup:</strong> Create this assessment instantly. You can manage questions, grading formulas, and publishing anytime.
          </p>
        </div>
      </div>

      {/* Mode Selector for EXAM category only */}
      {category === 'EXAM' && (
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Exam Structure</Label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setValue('mode', 'SINGLE_SUBJECT')}
              className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                selectedMode === 'SINGLE_SUBJECT'
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 shrink-0">
                <BookOpen size={16} />
              </div>
              <div>
                <p className="text-xs font-black">Single Paper</p>
                <p className="text-[10px] text-slate-500">One subject paper</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setValue('mode', 'COMBINED')}
              className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                selectedMode === 'COMBINED'
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 shrink-0">
                <Layers size={16} />
              </div>
              <div>
                <p className="text-xs font-black">Multi-Paper</p>
                <p className="text-[10px] text-slate-500">Multiple subject papers</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Assessment Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Title <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder={`E.g., 2026 First Term ${typeLabel}`}
          {...register('title')}
          className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
        {errors.title && <p className="text-rose-500 text-xs">{errors.title.message}</p>}
      </div>

      {/* Subject & Teacher row (Only required or relevant for Single Paper) */}
      {selectedMode === 'SINGLE_SUBJECT' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="subjectId" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Subject
            </Label>
            <div className="relative">
              <select
                id="subjectId"
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
            {errors.subjectId && <p className="text-rose-500 text-xs">{errors.subjectId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="teacherId" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Assigned Teacher
            </Label>
            <div className="relative">
              <select
                id="teacherId"
                {...register('teacherId')}
                disabled={isLoadingTeachers}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">{isLoadingTeachers ? 'Loading teachers...' : 'Select Teacher (Optional)'}</option>
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
      )}

      {/* Class & Academic Session */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="classId" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Target Class
          </Label>
          <div className="relative">
            <select
              id="classId"
              {...register('classId')}
              disabled={isLoadingClasses}
              className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">{isLoadingClasses ? 'Loading classes...' : 'All Classes (School-wide)'}</option>
              {!isLoadingClasses &&
                (classes as any[]).map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.section || ''}
                  </option>
                ))}
            </select>
            {isLoadingClasses && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400 pointer-events-none" />
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sessionId" className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Academic Session
          </Label>
          <div className="relative">
            <select
              id="sessionId"
              {...register('sessionId')}
              disabled={isLoadingSessions}
              className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">{isLoadingSessions ? 'Loading sessions...' : 'No Session Selected'}</option>
              {!isLoadingSessions &&
                (sessions as any[]).map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
            {isLoadingSessions && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400 pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      {/* Target Departments Selector */}
      {departments && departments.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 size={13} className="text-purple-500" />
              Target Departments <span className="text-[10px] font-normal text-slate-400">(Optional — multi-select)</span>
            </Label>
            {selectedDepartmentIds.length > 0 && (
              <button
                type="button"
                onClick={() => setValue('departmentIds', [])}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                Clear all ({selectedDepartmentIds.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            {departments.map((dept: any) => {
              const isSelected = selectedDepartmentIds.includes(dept.id);
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => toggleDepartment(dept.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all border cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-2xs font-bold'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 pointer-events-none shrink-0"
                  />
                  <span className="truncate">{dept.code ? `[${dept.code}] ` : ''}{dept.name}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Leave unselected to target all departments in the selected scope.
          </p>
        </div>
      )}

      {/* Timing and Marks for Single Paper */}
      {selectedMode === 'SINGLE_SUBJECT' ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="durationMinutes" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Duration (Minutes)
            </Label>
            <Input
              id="durationMinutes"
              type="number"
              {...register('durationMinutes')}
              className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            {errors.durationMinutes && <p className="text-rose-500 text-xs">{errors.durationMinutes.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="totalMarks" className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Total Marks
            </Label>
            <Input
              id="totalMarks"
              type="number"
              {...register('totalMarks')}
              className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            {errors.totalMarks && <p className="text-rose-500 text-xs">{errors.totalMarks.message}</p>}
          </div>
        </div>
      ) : null}

      {/* Start Date & Result Release (Optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="startDate" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar size={13} className="text-blue-500" /> Start Date (Optional)
          </Label>
          <Input
            id="startDate"
            type="datetime-local"
            {...register('startDate')}
            className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="resultReleaseAt" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar size={13} className="text-purple-500" /> Result Release (Optional)
          </Label>
          <Input
            id="resultReleaseAt"
            type="datetime-local"
            {...register('resultReleaseAt')}
            className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          />
        </div>
      </div>

      {/* Description / Instructions */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Description / Instructions (Optional)
        </Label>
        <Textarea
          id="description"
          placeholder="Brief instructions for candidates..."
          {...register('description')}
          className="min-h-[85px] rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs leading-relaxed"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={mutation.isPending}
          className={`w-full h-11 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 text-white ${
            category === 'QUIZ'
              ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
              : category === 'CA'
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
          }`}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating {typeLabel}...</span>
            </>
          ) : (
            <span>Create {typeLabel}</span>
          )}
        </Button>
      </div>
    </form>
  );
}
