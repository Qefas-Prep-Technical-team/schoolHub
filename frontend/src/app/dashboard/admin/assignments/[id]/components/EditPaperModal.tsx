/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/lib/api/services/examService";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { Loader2, BookOpen, Clock, FileText, UserCircle, Save, Eye, Edit3, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";

const paperSchema = z.object({
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
  title: z.string().min(3, "Title is too short"),
  instructions: z.string().min(5, "Please provide instructions"),
  readingContent: z.string().optional(),
  durationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  creationMode: z.enum(["MANUAL", "AI", "OMR"]).default("MANUAL"),
});

type PaperFormValues = z.infer<typeof paperSchema>;

interface EditPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: any;
  subjects: any[];
  teachers: any[];
  isLoadingData: boolean;
}

export default function EditPaperModal({
  isOpen,
  onClose,
  paper,
  subjects,
  teachers,
  isLoadingData
}: EditPaperModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PaperFormValues>({
    resolver: zodResolver(paperSchema) as any,
    defaultValues: {
      subjectId: paper?.subjectId || "",
      teacherId: paper?.teacherId || "",
      title: paper?.title || "",
      instructions: paper?.instructions || "",
      readingContent: paper?.readingContent || "",
      durationMinutes: paper?.durationMinutes || 60,
      creationMode: paper?.creationMode || "MANUAL",
    },
  });

  const watchInstructions = watch("instructions");
  const watchReadingContent = watch("readingContent");

  useEffect(() => {
    if (paper) {
      reset({
        subjectId: paper.subjectId || "",
        teacherId: paper.teacherId || "",
        title: paper.title || "",
        instructions: paper.instructions || "",
        readingContent: paper.readingContent || "",
        durationMinutes: paper.durationMinutes || 60,
        creationMode: paper.creationMode || "MANUAL",
      });
    }
  }, [paper, reset, isOpen]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PaperFormValues) => examService.updateSubjectPaper(paper.id, data),
    onSuccess: () => {
      toast.success("Subject paper updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["paper", paper.id] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update paper");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl rounded-[2rem]">
        <div className="bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-8 pb-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <FileText size={20} />
              </div>
              Edit Paper Settings
            </DialogTitle>
            <DialogDescription className="text-gray-500 font-medium pt-1">
              Refine the subject, timing, and instructions for this paper.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-8 pt-2 custom-scrollbar">
          <div className="flex justify-end mb-6">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("edit")}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "edit" ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Edit3 size={12} /> Edit Mode
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  activeTab === "preview" ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Eye size={12} /> Preview Mode
              </button>
            </div>
          </div>

          <form id="edit-paper-form" onSubmit={handleSubmit((data) => mutate(data))} className="space-y-8">
            {activeTab === "edit" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Basic Details */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paper Title</Label>
                    <Input {...register("title")} placeholder="e.g. Mathematics Midterm" className="rounded-2xl h-12 border-slate-200" />
                    {errors.title && <p className="text-red-500 text-[10px] font-bold">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <BookOpen size={12} /> Subject
                    </Label>
                    <select
                      {...register("subjectId")}
                      disabled={isLoadingData}
                      className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">No Subject (Optional)</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Settings size={12} /> Creation Mode
                    </Label>
                    <select
                      {...register("creationMode")}
                      disabled={isLoadingData}
                      className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="MANUAL">Manual Setup</option>
                      <option value="AI">Generate with AI</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <UserCircle size={12} /> Assigned Teacher
                    </Label>
                    <select
                      {...register("teacherId")}
                      disabled={isLoadingData}
                      className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">No Teacher (Optional)</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Clock size={12} /> Duration (Minutes)
                    </Label>
                    <Input type="number" {...register("durationMinutes")} className="rounded-2xl h-12 border-slate-200" />
                    {errors.durationMinutes && <p className="text-red-500 text-[10px] font-bold">{errors.durationMinutes.message}</p>}
                  </div>
                </div>

                {/* Right Column: Content */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Instructions</Label>
                    <Textarea 
                      {...register("instructions")} 
                      placeholder="Answer all questions..." 
                      className="rounded-2xl min-h-[120px] border-slate-200 resize-none font-medium leading-relaxed" 
                    />
                    {errors.instructions && <p className="text-red-500 text-[10px] font-bold">{errors.instructions.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reading Passage (Optional)</Label>
                    <Textarea 
                      {...register("readingContent")} 
                      placeholder="Paste comprehension passage here..." 
                      className="rounded-2xl min-h-[160px] border-slate-200 resize-none font-medium leading-relaxed bg-slate-50/30" 
                    />
                    <p className="text-[10px] text-slate-400 italic">Supports LaTeX ($x^2$) and Markdown.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/10 pb-2">Instructions Preview</h4>
                  <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900 shadow-inner min-h-[100px]">
                    {watchInstructions ? (
                      <LaTeXRenderer content={watchInstructions} />
                    ) : (
                      <p className="text-sm text-slate-400 italic">No instructions provided.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-xs font-black uppercase tracking-widest text-primary border-b border-primary/10 pb-2">Reading Passage Preview</h4>
                   <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 shadow-inner min-h-[200px]">
                    {watchReadingContent ? (
                       <LaTeXRenderer content={watchReadingContent} />
                    ) : (
                       <p className="text-sm text-slate-400 italic">No reading passage provided.</p>
                    )}
                   </div>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-2xl font-bold h-12 px-6 border-slate-200"
          >
            Cancel
          </Button>
          <Button
            form="edit-paper-form"
            type="submit"
            disabled={isPending}
            className="rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 h-12 px-8 flex items-center gap-2"
          >
            {isPending ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Save size={18} />
            )}
            Save All Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
