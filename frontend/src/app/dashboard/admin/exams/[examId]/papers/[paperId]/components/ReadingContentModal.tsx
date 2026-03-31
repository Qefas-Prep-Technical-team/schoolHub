"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Loader2, BookOpen, Save, Eye, Edit3 } from "lucide-react";
import { examService } from "@/lib/api/services/examService";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import { cn } from "@/lib/utils";

interface ReadingContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paperId: string;
  initialContent?: string;
}

export default function ReadingContentModal({
  isOpen,
  onClose,
  paperId,
  initialContent = ""
}: ReadingContentModalProps) {
  const [content, setContent] = useState(initialContent || "");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const queryClient = useQueryClient();

  useEffect(() => {
    setContent(initialContent || "");
  }, [initialContent, isOpen]);

  const updateMutation = useMutation({
    mutationFn: (newContent: string) => 
      examService.updateSubjectPaper(paperId, { readingContent: newContent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Reading content updated successfully!");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update reading content");
    }
  });

  const handleSave = () => {
    updateMutation.mutate(content);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl focus:outline-none">
        <div className="bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-8 pb-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen size={20} />
              </div>
              Reading Comprehension Content
            </DialogTitle>
            <DialogDescription className="text-gray-500 font-medium ml-13">
              Paste or write the comprehension passage that students will read before answering questions.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 pt-2">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Content Editor
              </Label>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    activeTab === "edit" ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Edit3 size={12} /> Edit
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    activeTab === "preview" ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Eye size={12} /> Preview
                </button>
              </div>
            </div>

            {activeTab === "edit" ? (
              <div className="space-y-4">
                <Textarea
                  id="readingContent"
                  placeholder="Paste your comprehension passage here..."
                  className="min-h-[400px] rounded-2xl border-slate-200 focus:ring-primary/20 resize-none font-medium leading-relaxed p-6 text-base"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 font-medium italic">
                  Tip: You can use **Markdown** and **LaTeX** (e.g. $x^2$) for formatting.
                </p>
              </div>
            ) : (
              <div className="min-h-[400px] max-h-[500px] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-8 custom-scrollbar">
                {content ? (
                  <LaTeXRenderer content={content} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                    <BookOpen size={48} className="opacity-20" />
                    <p className="text-sm font-medium italic">Nothing to preview yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-2xl font-bold h-12 px-6 border-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 h-12 px-8 flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Save size={18} />
            )}
            Save Content
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
