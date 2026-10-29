import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService, Session } from "@/lib/api/services/sessionService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Loader2, Calendar, Plus, Save, X, Info } from "lucide-react";
import { useEffect } from "react";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";

// Each term is individually optional. If both dates are blank, that term is skipped.
// If only one date is filled, the other becomes required.
const termDateSchema = z.object({
  term: z.enum(["FIRST", "SECOND", "THIRD"]),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
}).superRefine((data, ctx) => {
  const hasStart = !!data.startDate;
  const hasEnd   = !!data.endDate;
  if (hasStart && !hasEnd) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date is required when start date is set", path: ["endDate"] });
  }
  if (!hasStart && hasEnd) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start date is required when end date is set", path: ["startDate"] });
  }
  if (hasStart && hasEnd && new Date(data.startDate!) >= new Date(data.endDate!)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start date must be before end date", path: ["endDate"] });
  }
});

const sessionSchema = z.object({
  name: z.string().min(5, "Session name must be at least 5 characters (e.g. 2025/2026 Academic Session)"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  schoolId: z.string().min(1, "School ID is required"),
  termDates: z.array(termDateSchema),
}).superRefine((data, ctx) => {
  const sessionStart = new Date(data.startDate);
  const sessionEnd   = new Date(data.endDate);
  if (sessionStart >= sessionEnd) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Session start date must be before end date", path: ["endDate"] });
  }
  data.termDates.forEach((term, index) => {
    if (!term.startDate || !term.endDate) return; // skip unfilled terms
    const termStart = new Date(term.startDate);
    const termEnd   = new Date(term.endDate);
    if (termStart < sessionStart) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${term.term} Term cannot start before the session starts`, path: ["termDates", index, "startDate"] });
    }
    if (termEnd > sessionEnd) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${term.term} Term cannot end after the session ends`, path: ["termDates", index, "endDate"] });
    }
    if (index > 0) {
      const prevTerm = data.termDates[index - 1];
      if (prevTerm.startDate && prevTerm.endDate && termStart <= new Date(prevTerm.endDate)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${term.term} Term must start after ${prevTerm.term} Term ends`, path: ["termDates", index, "startDate"] });
      }
    }
  });
});

const TERM_LABELS: Record<string, { label: string; color: string }> = {
  FIRST:  { label: "First Term",  color: "bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/60" },
  SECOND: { label: "Second Term", color: "bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900/60" },
  THIRD:  { label: "Third Term",  color: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/60" },
};

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
    watch,
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
        { term: "FIRST",  startDate: "", endDate: "" },
        { term: "SECOND", startDate: "", endDate: "" },
        { term: "THIRD",  startDate: "", endDate: "" },
      ],
    },
  });

  const watchedTermDates = watch("termDates");

  // Populate form if editing — map each term by key so missing terms stay blank
  useEffect(() => {
    if (!initialData) return;
    setValue("name", initialData.name);
    setValue("startDate", formatDateForInput(initialData.startDate));
    setValue("endDate", formatDateForInput(initialData.endDate));
    const termOrder: Array<"FIRST" | "SECOND" | "THIRD"> = ["FIRST", "SECOND", "THIRD"];
    termOrder.forEach((termKey, idx) => {
      const found = initialData.termPeriods?.find((t) => t.term === termKey);
      setValue(`termDates.${idx}.term` as any, termKey);
      setValue(`termDates.${idx}.startDate` as any, found ? formatDateForInput(found.startDate) : "");
      setValue(`termDates.${idx}.endDate` as any, found ? formatDateForInput(found.endDate) : "");
    });
  }, [initialData, setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: SessionFormValues) => {
      // Strip completely empty term entries before sending to the API
      const filteredTermDates = data.termDates.filter((t) => !!t.startDate && !!t.endDate);
      const payload = { ...data, termDates: filteredTermDates };
      return isEditing
        ? sessionService.updateSession(initialData!.id, payload)
        : sessionService.createSession(payload);
    },
    onSuccess: () => {
      toast.success(isEditing ? "Session updated successfully!" : "Academic session created successfully!");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} session`);
    },
  });

  const onSubmit = (data: SessionFormValues) => {
    mutate(data);
  };

  useEffect(() => {
    setValue("schoolId", schoolId);
  }, [schoolId, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
            <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Session Name</Label>
        </div>
        <Input
          id="name"
          placeholder="e.g. 2025/2026 Academic Session"
          {...register("name")}
          className="h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary transition-all text-sm font-medium text-slate-900 dark:text-white"
        />
        {errors.name && <p className="text-red-500 text-xs font-medium mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Session Start Date</Label>
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
              className="h-10 pl-9 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary transition-all text-sm font-medium text-slate-900 dark:text-white"
            />
          </div>
          {errors.startDate && <p className="text-red-500 text-xs font-medium mt-1">{errors.startDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Session End Date</Label>
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              id="endDate"
              type="date"
              {...register("endDate")}
              className="h-10 pl-9 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary transition-all text-sm font-medium text-slate-900 dark:text-white"
            />
          </div>
          {errors.endDate && <p className="text-red-500 text-xs font-medium mt-1">{errors.endDate.message}</p>}
        </div>
      </div>

      {/* Term Schedule — all terms are individually optional */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Term Schedule</h3>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Optional
          </span>
        </div>
        <p className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
          <Info size={13} className="mt-0.5 shrink-0 text-slate-400" />
          You can set dates for individual terms now and fill in the others later. Leave both fields blank to skip a term.
        </p>

        {(["FIRST", "SECOND", "THIRD"] as const).map((term, index) => {
          const style = TERM_LABELS[term];
          const hasAny = !!(watchedTermDates?.[index]?.startDate || watchedTermDates?.[index]?.endDate);
          return (
            <div
              key={term}
              className={`space-y-3 p-4 rounded-xl border transition-all ${
                hasAny ? style.color : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{style.label}</p>
                {hasAny
                  ? <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">&#9679; Set</span>
                  : <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 italic">Not set</span>
                }
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500">
                    Start Date <span className="text-slate-400 font-normal">(optional)</span>
                  </Label>
                  <Input
                    type="date"
                    {...register(`termDates.${index}.startDate` as any)}
                    className="h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />
                  {(errors.termDates as any)?.[index]?.startDate && (
                    <p className="text-red-500 text-[10px] font-medium mt-1">
                      {(errors.termDates as any)[index].startDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500">
                    End Date <span className="text-slate-400 font-normal">(optional)</span>
                  </Label>
                  <Input
                    type="date"
                    {...register(`termDates.${index}.endDate` as any)}
                    className="h-9 px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />
                  {(errors.termDates as any)?.[index]?.endDate && (
                    <p className="text-red-500 text-[10px] font-medium mt-1">
                      {(errors.termDates as any)[index].endDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 flex flex-col gap-3">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-10 rounded-xl text-white font-medium gap-2 shadow-sm bg-primary hover:bg-primary/90 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all border-none"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditing ? 'Saving...' : 'Creating Session...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {isEditing ? <Save size={16} /> : <Plus size={16} />}
                {isEditing ? 'Save Changes' : 'Create Session'}
              </span>
            )}
          </Button>

          {isEditing && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="w-full h-10 rounded-xl text-slate-500 font-medium gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={14} />
              Cancel Edit
            </Button>
          )}
      </div>
      
      <p className="text-xs text-slate-400 text-center">
        * Only administrators can {isEditing ? 'modify' : 'create'} sessions
      </p>
    </form>
  );
}

