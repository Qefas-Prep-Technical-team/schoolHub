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
import { Loader2 } from 'lucide-react';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { teacherService } from '@/lib/api/services/teacherService';
import { schoolService } from '@/lib/api/services/schoolService';
import { InfoIcon, Calendar, Check, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

const examSchema = z.object({
  title: z.string().min(3, "Title is required (min 3 characters)"),
  description: z.string().optional(),
  subjectId: z.string().min(1, "Subject is required"),
  classId: z.string().min(1, "Class is required"),
  departmentIds: z.array(z.string()).default([]),
  teacherId: z.string().optional(),
  startDate: z.string().optional(),
  resultReleaseAt: z.string().optional(),
  durationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  totalMarks: z.coerce.number().min(1, "Total marks must be at least 1"),
});

type ExamFormValues = z.infer<typeof examSchema>;

interface CreateExamFormProps {
  category: 'EXAM' | 'QUIZ' | 'CA';
  onSuccess?: (examId: string, paperId?: string) => void;
}

export default function CreateExamForm({ category, onSuccess }: CreateExamFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { selectedSchoolId } = useDashboardStore();
  const isPersonal = selectedSchoolId === user?.id || !selectedSchoolId;

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['teacher-assigned-subjects', selectedSchoolId],
    queryFn: () => teacherService.getSubjects({ schoolId: isPersonal ? undefined : selectedSchoolId }),
    enabled: !!selectedSchoolId,
  });

  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['school-teachers', selectedSchoolId],
    queryFn: () => schoolService.getTeachers(selectedSchoolId),
    enabled: !!selectedSchoolId && !isPersonal,
  });

  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['teacher-assigned-classes', selectedSchoolId],
    queryFn: () => teacherService.getClasses({ schoolId: isPersonal ? undefined : selectedSchoolId }),
    enabled: !!selectedSchoolId,
  });

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['school-departments', selectedSchoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/academic/departments?schoolId=${selectedSchoolId}`);
      return data.data || [];
    },
    enabled: !!selectedSchoolId && !isPersonal,
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      subjectId: '',
      classId: '',
      departmentIds: [],
      teacherId: '',
      startDate: '',
      resultReleaseAt: '',
      durationMinutes: 60,
      totalMarks: 100,
    }
  });

  const selectedDepartmentIds = watch("departmentIds") || [];

  const toggleDepartment = (deptId: string) => {
    const current = watch("departmentIds") || [];
    if (current.includes(deptId)) {
      setValue("departmentIds", current.filter(id => id !== deptId));
    } else {
      setValue("departmentIds", [...current, deptId]);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: ExamFormValues) => {
      // 1. Create the Exam
      const exam = await examService.createExam({
        ...data,
        category,
        schoolId: isPersonal ? undefined : selectedSchoolId,
        scope: data.classId ? "CLASS" : "SCHOOL", 
        creationMode: "MANUAL",
        mode: "SINGLE_SUBJECT",
        teacherId: user?.id,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        resultReleaseAt: data.resultReleaseAt ? new Date(data.resultReleaseAt).toISOString() : undefined,
        departmentIds: data.departmentIds,
      });

      if (!exam?.id) throw new Error('Exam creation failed — no ID returned');

      // 2. Auto-create the default Subject Paper for this exam
      let paper = null;
      try {
        paper = await examService.createSubjectPaper(exam.id, {
          title: data.title,
          subjectId: data.subjectId,
          teacherId: data.teacherId || user?.id,
          schoolId: isPersonal ? undefined : selectedSchoolId,
          durationMinutes: data.durationMinutes,
          totalMarks: data.totalMarks,
          instructions: data.description || '',
          creationMode: "MANUAL",
        });
      } catch (paperError: any) {
        console.error('[CreateExamForm] Paper creation failed:', paperError);
        // Show a warning but don't block — exam was created
        toast.warn(
          paperError?.response?.data?.message ||
          'Assessment created, but the default subject paper could not be created. You may not be assigned to this subject.',
          { autoClose: 6000 }
        );
      }

      return { exam, paper };
    },
    onSuccess: (data: any) => {
      toast.success(`${category} created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['teacher-exams'] });
      if (onSuccess) {
        onSuccess(data.exam.id, data.paper?.id);
      }
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.response?.data?.message || `Failed to create ${category.toLowerCase()}`);
    }
  });

  const onSubmit = (data: ExamFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-xl text-xs flex gap-2 items-start mb-4">
        <InfoIcon className="w-4 h-4 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p><strong>Note:</strong> You can access more advanced settings (like shuffling, grading method) on the edit page after creation.</p>
          <p>This assessment will remain invisible to students and other teachers until you explicitly publish it.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          placeholder={`E.g., Mid-Term ${category === 'CA' ? 'Assessment' : category}`} 
          {...register("title")} 
          className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
        {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 relative">
          <Label htmlFor="subjectId">Subject</Label>
          <div className="relative">
            <select
              {...register("subjectId")}
              disabled={isLoadingSubjects}
              className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="">{isLoadingSubjects ? "Loading subjects..." : "Select Subject..."}</option>
              {!isLoadingSubjects && (subjects as any[]).map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {isLoadingSubjects && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400 pointer-events-none" />}
          </div>
          {errors.subjectId && <p className="text-red-500 text-xs">{errors.subjectId.message}</p>}
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="teacherId">Assigned Teacher (Optional)</Label>
          <div className="relative">
            <select
              {...register("teacherId")}
              disabled={isLoadingTeachers || isPersonal}
              className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="">{isLoadingTeachers ? "Loading teachers..." : "Assign to yourself"}</option>
              {!isLoadingTeachers && (teachers as any[]).map((t: any) => (
                <option key={t.id} value={t.id}>{t.name || t.email || t.user?.name}</option>
              ))}
            </select>
            {isLoadingTeachers && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400 pointer-events-none" />}
          </div>
          {errors.teacherId && <p className="text-red-500 text-xs">{errors.teacherId.message}</p>}
        </div>
      </div>

      <div className="space-y-2 relative">
        <Label htmlFor="classId">Class</Label>
        <div className="relative">
          <select
            {...register("classId")}
            disabled={isLoadingClasses}
            className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
          >
            <option value="">{isLoadingClasses ? "Loading classes..." : "Select Class..."}</option>
            {!isLoadingClasses && (classes as any[]).map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {isLoadingClasses && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400 pointer-events-none" />}
        </div>
        {errors.classId && <p className="text-red-500 text-xs">{errors.classId.message}</p>}
      </div>

      {/* Target Departments Selector */}
      {!isPersonal && departments && departments.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 size={13} className="text-purple-500" />
              Target Departments <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
            </Label>
            {selectedDepartmentIds.length > 0 && (
              <button
                type="button"
                onClick={() => setValue("departmentIds", [])}
                className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
              >
                Clear ({selectedDepartmentIds.length})
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {departments.map((d: any) => {
              const isSelected = selectedDepartmentIds.includes(d.id);
              return (
                <div
                  key={d.id}
                  onClick={() => toggleDepartment(d.id)}
                  className={`cursor-pointer group flex items-center gap-2 p-2 rounded-xl border transition-all duration-200 select-none text-left ${
                    isSelected
                      ? "bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors shrink-0 ${
                      isSelected ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-transparent"
                    }`}
                  >
                    <Check size={9} strokeWidth={4} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate leading-tight">{d.name}</span>
                    {d.code && (
                      <span className="text-[9px] uppercase font-bold opacity-50 tracking-wider">
                        {d.code}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date (Optional)</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              id="startDate" 
              type="datetime-local"
              {...register("startDate")} 
              className="pl-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resultReleaseAt">Result Release (Optional)</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              id="resultReleaseAt" 
              type="datetime-local"
              {...register("resultReleaseAt")} 
              className="pl-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
          <Input 
            id="durationMinutes" 
            type="number"
            {...register("durationMinutes")} 
            className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
          {errors.durationMinutes && <p className="text-red-500 text-xs">{errors.durationMinutes.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalMarks">Total Marks</Label>
          <Input 
            id="totalMarks" 
            type="number"
            {...register("totalMarks")} 
            className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
          {errors.totalMarks && <p className="text-red-500 text-xs">{errors.totalMarks.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea 
          id="description" 
          placeholder="Brief description or instructions for the students..." 
          {...register("description")}
          className="min-h-[100px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
        {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
      </div>

      <div className="pt-4 flex justify-end">
        <Button 
          type="submit" 
          disabled={mutation.isPending}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            `Create ${
              category === 'EXAM' ? 'Single Paper Exam' :
              category === 'CA' ? 'Continuous Assessment' :
              category === 'QUIZ' ? 'Test (Quizzes)' : category
            }`
          )}
        </Button>
      </div>
    </form>
  );
}
