"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Award } from "lucide-react";

interface PaperPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: any;
}

export default function PaperPreviewModal({
  isOpen,
  onClose,
  paper,
}: PaperPreviewModalProps) {
  if (!paper) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2.5rem]">
        <DialogHeader className="p-8 bg-slate-900 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                {paper.title}
              </DialogTitle>
              <div className="flex items-center gap-4 mt-2 text-slate-400">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                  <Clock size={14} /> {paper.durationMinutes} Minutes
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                  <Award size={14} /> {paper.totalMarks} Total Marks
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-8 pb-10">
            {paper.readingContent && (
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Reading Passage</h3>
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                  {paper.readingContent}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <FileText size={14} /> 
                Assessment Questions ({(paper.questions?.length || 0)})
              </h3>
              
              {(paper.questions || []).length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No questions added to this paper yet.</p>
                </div>
              ) : (
                paper.questions.map((q: any, idx: number) => (
                  <div key={q.id} className="p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                    <div className="flex items-start gap-4">
                      <span className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-slate-400 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-900 dark:text-white font-black text-lg mb-4">{q.text}</p>
                        {q.options && Object.keys(q.options).length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(q.options).map(([key, val]: [string, any]) => (
                              <div key={key} className={`p-4 rounded-xl border flex items-center gap-3 ${q.correctAnswer === key ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-500/5' : 'border-slate-100 dark:border-slate-800'}`}>
                                <span className={`size-6 rounded-lg flex items-center justify-center text-[10px] font-black ${q.correctAnswer === key ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                  {key.toUpperCase()}
                                </span>
                                <span className="font-bold text-slate-600 dark:text-slate-400">{val}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{q.marks} Pts</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl px-8 font-bold border-2">
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
