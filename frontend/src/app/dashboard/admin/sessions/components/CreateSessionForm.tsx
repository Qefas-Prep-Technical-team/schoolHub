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
import { Loader2, Calendar, Plus, Zap, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

const sessionSchema = z.object({
  name: z.string().min(5, "Session name must be at least 5 characters (e.g. 2025/2026 Academic Session)"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  schoolId: z.string().min(1, "School ID is required"),
});

type SessionFormValues = z.infer<typeof sessionSchema>;

export function CreateSessionForm({ schoolId, onSuccess }: { schoolId: string; onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema) as any,
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
    mutate(data);
  };

  useEffect(() => {
    setValue("schoolId", schoolId);
  }, [schoolId, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
            <Label htmlFor="name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Designation</Label>
            <Zap size={14} className="text-slate-300" />
        </div>
        <Input
          id="name"
          placeholder="e.g. 2025/2026 ACADEMIC REGISTRY"
          {...register("name")}
          className="h-14 px-6 rounded-2xl bg-slate-50/50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 focus:border-primary transition-all font-bold text-slate-700 dark:text-slate-200"
          style={{ '--tw-ring-color': `${primaryColor}20` } as any}
        />
        {errors.name && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="startDate" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Ingress</Label>
          <div className="relative group">
            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
              className="h-14 pl-14 pr-6 rounded-2xl bg-slate-50/50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 focus:border-primary transition-all font-bold text-slate-700 dark:text-slate-200"
            />
          </div>
          {errors.startDate && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-3">
          <Label htmlFor="endDate" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Egress</Label>
          <div className="relative group">
            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              id="endDate"
              type="date"
              {...register("endDate")}
              className="h-14 pl-14 pr-6 rounded-2xl bg-slate-50/50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 focus:border-primary transition-all font-bold text-slate-700 dark:text-slate-200"
            />
          </div>
          {errors.endDate && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{errors.endDate.message}</p>}
        </div>
      </div>

      <div className="pt-4">
          <Button
            type="submit"
            disabled={isPending}
            style={{ backgroundColor: primaryColor }}
            className="w-full h-16 rounded-[2rem] text-white font-black uppercase tracking-widest gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all border-none"
          >
            {isPending ? (
              <span className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                SYNCING REGISTRY...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <ShieldCheck size={20} strokeWidth={3} />
                INITIALIZE NODE
              </span>
            )}
          </Button>
      </div>
      
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center italic">
        * NODE INITIALIZATION REQUIRES INSTITUTIONAL PRIVILEGE
      </p>
    </form>
  );
}

