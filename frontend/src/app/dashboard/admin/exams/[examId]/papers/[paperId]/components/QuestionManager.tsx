"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { toast } from "react-toastify";

interface QuestionManagerProps {
  paperId: string;
  examId: string;
  paper: any;
}

export default function QuestionManager({
  paperId,
  examId,
  paper,
}: QuestionManagerProps) {
  const queryClient = useQueryClient();

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      await apiClient.delete(`/exams/questions/${questionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Question deleted");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Questions</h3>
        <Button className="rounded-xl font-bold bg-primary text-white flex items-center gap-2">
          <PlusCircle size={16} /> Add Question
        </Button>
      </div>

      <div className="space-y-4">
        {(paper?.questions || []).map((q: any, idx: number) => (
          <div key={q.id} className="p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-slate-400">
                {idx + 1}
              </span>
              <div>
                <p className="text-slate-900 dark:text-white font-black text-lg mb-2">{q.text}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                    {q.type || 'MULTIPLE_CHOICE'}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/70 bg-primary/5 px-2 py-1 rounded-lg">
                    {q.marks} Marks
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary rounded-xl">
                <Edit size={18} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-red-500 rounded-xl"
                onClick={() => deleteQuestionMutation.mutate(q.id)}
                disabled={deleteQuestionMutation.isPending}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        ))}

        {(paper?.questions || []).length === 0 && (
          <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 font-black uppercase text-sm tracking-widest">No questions added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
