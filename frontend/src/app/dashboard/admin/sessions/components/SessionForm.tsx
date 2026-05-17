import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService, CreateSessionDTO, Session } from "@/lib/api/services/sessionService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Loader2, Calendar, Plus, Zap, Save, X } from "lucide-react";
import { useEffect } from "react";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";

const sessionSchema = z.object({
  name: z.string().min(5, "Session name must be at least 5 characters (e.g. 2025/2026 Academic Session)"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  schoolId: z.string().min(1, "School ID is required"),
  termDates: z.array(z.object({
    term: z.enum(["FIRST", "SECOND", "THIRD"]),
    startDate: z.string().min(1, "Term start date is required"),
    endDate: z.string().min(1, "Term end date is required"),
  })).min(3, "All three terms must have dates"),
}).superRefine((data, ctx) => {
  const sessionStart = new Date(data.startDate);
  const sessionEnd = new Date(data.endDate);

  // 1. Session dates validation
  if (sessionStart >= sessionEnd) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Session start date must be before end date",
      path: ["endDate"],
    });
  }

  // 2. Term dates validation
  data.termDates.forEach((term, index) => {
    const termStart = new Date(term.startDate);
    const termEnd = new Date(term.endDate);

    // Term internal order
    if (termStart >= termEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${term.term} Term start must be before end`,
        path: ["termDates", index, "endDate"],
      });
    }

    // Term within session bounds
    if (termStart < sessionStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${term.term} Term cannot start before the session starts`,
        path: ["termDates", index, "startDate"],
      });
    }
    if (termEnd > sessionEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${term.term} Term cannot end after the session ends`,
        path: ["termDates", index, "endDate"],
      });
    }

    // 3. Sequential terms validation
    if (index > 0) {
      const prevTerm = data.termDates[index - 1];
      const prevTermEnd = new Date(prevTerm.endDate);
      
      if (termStart <= prevTermEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${term.term} Term must start after ${prevTerm.term} Term ends`,
          path: ["termDates", index, "startDate"],
        });
      }
    }
  });
});

type SessionFormValues = z.infer<typeof sessionSchema>;

// Helper to format date for input[type="date"]
const formatDateForInput = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split('T')[0];
};

export function SessionForm({ 
  schoolId, 
  initialData, 
  onSuccess,
  onCancel
}: { 
  schoolId: string; 
  initialData?: Session; 
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema) as any,
    mode: "onChange",
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      schoolId: schoolId,
      termDates: [
        { term: "FIRST", startDate: "", endDate: "" },
        { term: "SECOND", startDate: "", endDate: "" },
        { term: "THIRD", startDate: "", endDate: "" },
      ],
    },
  });

  // Populate form if editing
  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name);
      setValue("startDate", formatDateForInput(initialData.startDate));
      setValue("endDate", formatDateForInput(initialData.endDate));
      
      if (initialData.termPeriods && initialData.termPeriods.length > 0) {
        const sortedTerms = [...initialData.termPeriods].sort((a, b) => {
          const order = { FIRST: 0, SECOND: 1, THIRD: 2 };
          return order[a.term] - order[b.term];
        });

        sortedTerms.forEach((tp, idx) => {
          setValue(`termDates.${idx}.startDate` as any, formatDateForInput(tp.startDate));
          setValue(`termDates.${idx}.endDate` as any, formatDateForInput(tp.endDate));
          setValue(`termDates.${idx}.term` as any, tp.term);
        });
      }
    }
  }, [initialData, setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: SessionFormValues) => 
      isEditing 
        ? sessionService.updateSession(initialData.id, data)
        : sessionService.createSession(data),
    onSuccess: () => {
      toast.success(isEditing ? "Session updated successfully!" : "Academic session created successfully!");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      reset(); // Always clear the form on success
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} session`);
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
            <Label htmlFor="name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Name</Label>
            <Zap size={14} className="text-slate-300" />
        </div>
        <Input
          id="name"
          placeholder="e.g. 2025/2026 Academic Session"
          {...register("name")}
          className="h-14 px-6 rounded-2xl bg-slate-50/50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/5 focus:border-primary transition-all font-bold text-slate-700 dark:text-slate-200"
          style={{ '--tw-ring-color': `${primaryColor}20` } as any}
        />
        {errors.name && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="startDate" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Start Date</Label>
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
          <Label htmlFor="endDate" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session End Date</Label>
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

      {/* Term Tracking Section */}
      <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-white/5">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Term Schedule</h3>
        
        {["FIRST", "SECOND", "THIRD"].map((term, index) => (
          <div key={term} className="space-y-4 p-4 rounded-2xl bg-slate-50/30 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{term} TERM</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Start Date</Label>
                <Input
                  type="date"
                  {...register(`termDates.${index}.startDate` as any)}
                  className="h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-xs font-bold"
                />
                {(errors.termDates as any)?.[index]?.startDate && (
                  <p className="text-red-500 text-[9px] font-black uppercase tracking-tight">
                    {(errors.termDates as any)[index].startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">End Date</Label>
                <Input
                  type="date"
                  {...register(`termDates.${index}.endDate` as any)}
                  className="h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-xs font-bold"
                />
                {(errors.termDates as any)?.[index]?.endDate && (
                  <p className="text-red-500 text-[9px] font-black uppercase tracking-tight">
                    {(errors.termDates as any)[index].endDate.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 flex flex-col gap-4">
          <Button
            type="submit"
            disabled={isPending}
            style={{ backgroundColor: primaryColor }}
            className="w-full h-16 rounded-[2rem] text-white font-black uppercase tracking-widest gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all border-none"
          >
            {isPending ? (
              <span className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                {isEditing ? 'SAVING...' : 'CREATING SESSION...'}
              </span>
            ) : (
              <span className="flex items-center gap-3">
                {isEditing ? <Save size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
                {isEditing ? 'SAVE CHANGES' : 'CREATE SESSION'}
              </span>
            )}
          </Button>

          {isEditing && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="w-full h-12 rounded-2xl text-slate-400 font-bold uppercase tracking-widest gap-2 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <X size={16} />
              Cancel Edit
            </Button>
          )}
      </div>
      
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center italic">
        * Only administrators can {isEditing ? 'modify' : 'create'} sessions
      </p>
    </form>
  );
}

