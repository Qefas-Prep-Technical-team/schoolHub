'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { teacherService } from '@/lib/api/services/teacherService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';

const assignmentSchema = z.object({
  title: z.string().min(3, "Title is required (min 3 characters)"),
  subjectId: z.string().min(1, "Subject is required"),
  classId: z.string().min(1, "Class is required"),
  instructions: z.string().optional(),
  totalMarks: z.coerce.number().min(1, "Total marks must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface CreateAssignmentFormProps {
  onSuccess?: (assignmentId: string) => void;
}

export default function CreateAssignmentForm({ onSuccess }: CreateAssignmentFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { selectedSchoolId } = useDashboardStore();
  const isPersonal = selectedSchoolId === user?.id || !selectedSchoolId;

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['teacher-assigned-subjects', selectedSchoolId],
    queryFn: () => teacherService.getSubjects({ schoolId: isPersonal ? undefined : selectedSchoolId }),
    enabled: !!selectedSchoolId,
  });

  const { data: classesData = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['teacher-classes', selectedSchoolId],
    queryFn: () => teacherService.getClasses({ schoolId: isPersonal ? undefined : selectedSchoolId }),
    enabled: !!selectedSchoolId,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      title: '',
      subjectId: '',
      classId: '',
      instructions: '',
      totalMarks: 100,
      dueDate: '',
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: AssignmentFormValues) => {
      return teacherService.createAssignment({
        ...data,
        classIds: [data.classId], // Backend expects array
        schoolId: isPersonal ? undefined : selectedSchoolId,
        teacherId: user?.id,
      });
    },
    onSuccess: (data: any) => {
      toast.success('Assignment created successfully!');
      queryClient.invalidateQueries({ queryKey: ['teacher-exams'] });
      if (onSuccess && data?.data?.[0]?.id) {
        onSuccess(data.data[0].id);
      }
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    }
  });

  const onSubmit = (data: AssignmentFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          placeholder="E.g., Week 1 Math Assignment" 
          {...register("title")} 
          className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
        {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subjectId">Subject</Label>
          <select
            {...register("subjectId")}
            disabled={isLoadingSubjects}
            className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select Subject...</option>
            {!isLoadingSubjects && (subjects as any[]).map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.subjectId && <p className="text-red-500 text-xs">{errors.subjectId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="classId">Class</Label>
          <select
            {...register("classId")}
            disabled={isLoadingClasses}
            className="w-full h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select Class...</option>
            {!isLoadingClasses && (classesData as any[]).map((c: any) => (
              <option key={c.id || c.class?.id} value={c.class?.id || c.id}>{c.class?.name || c.name}</option>
            ))}
          </select>
          {errors.classId && <p className="text-red-500 text-xs">{errors.classId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input 
            id="dueDate" 
            type="datetime-local"
            {...register("dueDate")} 
            className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
          {errors.dueDate && <p className="text-red-500 text-xs">{errors.dueDate.message}</p>}
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
        <Label htmlFor="instructions">Instructions (Optional)</Label>
        <Textarea 
          id="instructions" 
          placeholder="Brief instructions for the assignment..." 
          {...register("instructions")}
          className="min-h-[80px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        />
        {errors.instructions && <p className="text-red-500 text-xs">{errors.instructions.message}</p>}
      </div>

      <div className="pt-4 flex justify-end">
        <Button 
          type="submit" 
          disabled={mutation.isPending}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Assignment'
          )}
        </Button>
      </div>
    </form>
  );
}
