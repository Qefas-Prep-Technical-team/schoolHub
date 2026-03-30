/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/lib/api/services/examService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { Loader2, BookOpen, Clock, FileText, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const paperSchema = z.object({
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
  title: z.string().min(3, "Title is too short"),
  instructions: z.string().min(5, "Please provide instructions"),
  durationMinutes: z.number().min(1, "Duration is required"),
});

type PaperFormValues = z.infer<typeof paperSchema>;

export function CreatePaperForm({
  examId,
  schoolId,
  subjects,
  teachers,
  isLoadingData,
  redirectOnSuccess
}: {
  examId?: string;
  schoolId?: string;
  subjects: any[];
  teachers: any[];
  isLoadingData: boolean;
  redirectOnSuccess?: string;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaperFormValues>({
    resolver: zodResolver(paperSchema) as any,
    defaultValues: {
      subjectId: "",
      teacherId: "",
      title: "",
      instructions: "",
      durationMinutes: 60,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PaperFormValues) => examService.createSubjectPaper(examId || "", { ...data, schoolId } as any),
    onSuccess: (response: any) => {
      toast.success("Subject paper created!");
      queryClient.invalidateQueries({ queryKey: ["exam-papers", examId] });
      queryClient.invalidateQueries({ queryKey: ["subject-papers"] });

      if (redirectOnSuccess) {
        router.push(redirectOnSuccess.replace("[id]", response?.id || ""));
      } else {
        reset();
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create paper");
    },
  });

  return (
    <form onSubmit={handleSubmit((data: PaperFormValues) => mutate(data))} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subject Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <BookOpen size={16} className="text-blue-500" /> Subject <span className="text-xs font-normal text-gray-400">(Optional)</span>
          </Label>
          <select
            {...register("subjectId")}
            disabled={isLoadingData}
            className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 shadow-sm"
          >
            <option value="">Select a subject...</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.subjectId && <p className="text-red-500 text-xs mt-1">{errors.subjectId.message}</p>}
        </div>

        {/* Teacher Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <UserCircle size={16} className="text-emerald-500" /> Assigned Teacher <span className="text-xs font-normal text-gray-400">(Optional)</span>
          </Label>
          <select
            {...register("teacherId")}
            disabled={isLoadingData}
            className="w-full h-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50 shadow-sm"
          >
            {isLoadingData ? (
              <option>Loading teachers...</option>
            ) : (
              <>
                <option value="">Select a teacher...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </>
            )}
          </select>
          {errors.teacherId && <p className="text-red-500 text-xs mt-1">{errors.teacherId.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Paper Title</Label>
        <Input
          {...register("title")}
          placeholder="e.g. Mathematics Midterm"
          className="h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:ring-blue-500/20"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Instructions</Label>
        <Textarea
          {...register("instructions")}
          placeholder="Answer all questions..."
          className="rounded-xl min-h-[100px] border-gray-200 dark:border-gray-800 focus:ring-blue-500/20"
        />
        {errors.instructions && <p className="text-red-500 text-xs mt-1">{errors.instructions.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Clock size={16} className="text-orange-500" /> Duration (Minutes)
        </Label>
        <Input
          type="number"
          {...register("durationMinutes", { valueAsNumber: true })}
          className="h-12 rounded-xl border-gray-200 dark:border-gray-800 focus:ring-blue-500/20 w-32"
        />
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          disabled={isPending || isLoadingData}
          className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-100 dark:shadow-none flex items-center justify-center gap-2 text-sm"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <FileText size={20} />
          )}
          {examId ? "Add to Examination" : "Create Standalone Paper"}
        </Button>
      </div>
    </form>
  );
}
