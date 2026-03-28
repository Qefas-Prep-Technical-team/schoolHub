/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService, CreateSessionDTO } from "@/lib/api/services/sessionService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Loader2, Calendar, Plus } from "lucide-react";
import { useEffect } from "react";

const sessionSchema = z.object({
  name: z.string().min(5, "Session name must be at least 5 characters (e.g. 2025/2026 Academic Session)"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  schoolId: z.string().min(1, "School ID is required"),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

export function CreateSessionForm({ schoolId, onSuccess }: { schoolId: string; onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  console.log("school id", schoolId);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      schoolId: schoolId,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateSessionDTO) => sessionService.createSession(data),
    onSuccess: () => {
      toast.success("Academic session created successfully!");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create session");
    },
  });

  const onSubmit = (data: SessionFormValues) => {
    console.log("Form data:", data);
    mutate(data);
  };
  // Add this to ensure the form stays synced with the prop
  useEffect(() => {
    setValue("schoolId", schoolId);
  }, [schoolId, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold">Session Name</Label>
        <Input
          id="name"
          placeholder="e.g. 2025/2026 Academic Session"
          {...register("name")}
          className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        />
        {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm font-semibold">Start Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
              className="h-12 pl-10 rounded-xl bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>
          {errors.startDate && <p className="text-red-500 text-xs font-medium">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-sm font-semibold">End Date</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="endDate"
              type="date"
              {...register("endDate")}
              className="h-12 pl-10 rounded-xl bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>
          {errors.endDate && <p className="text-red-500 text-xs font-medium">{errors.endDate.message}</p>}
        </div>
      </div>

      {/* <input type="hidden" {...register("schoolId")} /> */}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-200 dark:shadow-none"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving Session...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Plus size={18} />
            Initialize Session
          </span>
        )}
      </Button>
    </form>
  );
}
