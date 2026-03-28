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

const paperSchema = z.object({
  subjectId: z.string().min(1, "Please select a subject"),
  teacherId: z.string().min(1, "Please select a teacher"),
  title: z.string().min(3, "Title is too short"),
  instructions: z.string().min(5, "Please provide instructions"),
  durationMinutes: z.coerce.number().min(1, "Duration is required"),
});

type PaperFormValues = z.infer<typeof paperSchema>;

export function CreatePaperForm({
  examId,
  subjects,
  teachers,
  isLoadingData
}: {
  examId: string;
  subjects: any[];
  teachers: any[];
  isLoadingData: boolean;
}) {
  const queryClient = useQueryClient();
  console.log("Teachers in CreatePaperForm:", teachers);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaperFormValues>({
    resolver: zodResolver(paperSchema),
    defaultValues: {
      subjectId: "",
      teacherId: "",
      title: "",
      instructions: "",
      durationMinutes: 60,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PaperFormValues) => examService.createSubjectPaper(examId, data),
    onSuccess: () => {
      toast.success("Subject paper added!");
      queryClient.invalidateQueries({ queryKey: ["exam-papers", examId] });
      reset();
    },
    onError: (error: any) => {
      toast.error("Failed to add paper");
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-5">

      {/* Subject Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <BookOpen size={14} className="text-blue-500" /> Subject
        </Label>
        <select
          {...register("subjectId")}
          disabled={isLoadingData}
          className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
        >
          <option value="">Select a subject...</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {errors.subjectId && <p className="text-red-500 text-[10px] font-bold">{errors.subjectId.message}</p>}
      </div>

      {/* Teacher Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <UserCircle size={14} className="text-emerald-500" /> Assigned Teacher
        </Label>
        <select
          {...register("teacherId")}
          disabled={isLoadingData}
          className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
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
        {errors.teacherId && <p className="text-red-500 text-[10px] font-bold">{errors.teacherId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Paper Title</Label>
        <Input {...register("title")} placeholder="e.g. Mathematics Midterm" className="rounded-xl" />
        {errors.title && <p className="text-red-500 text-[10px] font-bold">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Instructions</Label>
        <Textarea {...register("instructions")} placeholder="Answer all questions..." className="rounded-xl min-h-[80px]" />
        {errors.instructions && <p className="text-red-500 text-[10px] font-bold">{errors.instructions.message}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold flex items-center gap-2">
          <Clock size={14} /> Duration (Mins)
        </Label>
        <Input type="number" {...register("durationMinutes")} className="rounded-xl" />
      </div>

      <Button
        type="submit"
        disabled={isPending || isLoadingData}
        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-100 dark:shadow-none"
      >
        {isPending ? <Loader2 className="animate-spin mr-2" size={18} /> : <FileText size={18} className="mr-2" />}
        Add Subject Paper
      </Button>
    </form>
  );
}