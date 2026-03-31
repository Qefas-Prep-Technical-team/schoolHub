"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, X, Maximize2, Minimize2 } from "lucide-react";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import { useState } from "react";

interface StudentReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  subjectName: string;
}

export default function StudentReadingModal({
  isOpen,
  onClose,
  content,
  subjectName
}: StudentReadingModalProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`
        ${isFullScreen ? 'max-w-[95vw] h-[90vh]' : 'sm:max-w-4xl h-[70vh]'} 
        rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl transition-all duration-300 ease-in-out focus:outline-none flex flex-col
      `}>
        <div className="bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-transparent to-primary/5 p-8 pb-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <BookOpen size={20} />
                </div>
                {subjectName} - Reading Passage
              </DialogTitle>
              <DialogDescription className="text-gray-500 font-medium hidden sm:block">
                Read the passage carefully before answering the questions.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm"
              >
                {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm text-slate-400 hover:text-red-500"
              >
                <X size={20} />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50/30 dark:bg-transparent custom-scrollbar">
            <div className="max-w-3xl mx-auto p-10 sm:p-16">
               <LaTeXRenderer 
                content={content} 
                className="text-lg leading-[1.8] text-slate-800 dark:text-slate-200 font-serif selection:bg-primary/20"
               />
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-center shrink-0">
            <Button
              onClick={onClose}
              className="rounded-2xl font-black bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/25 h-14 px-12 text-base tracking-wide"
            >
              Continue to Questions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
