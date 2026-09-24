"use client";

import { Check, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCalculatePaperSync } from "@/lib/api/hooks/useRecords";
import { toast } from "react-toastify";

interface SyncProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultId: string;
  studentIds: string[];
  onComplete: (results: any[]) => void;
}

export function SyncProgressModal({
  isOpen,
  onClose,
  resultId,
  studentIds,
  onComplete
}: SyncProgressModalProps) {
  const [steps, setSteps] = useState([
    { id: "assignment", label: "Assignment", status: "pending" as "pending" | "loading" | "success" | "error" },
    { id: "ca", label: "CA", status: "pending" as "pending" | "loading" | "success" | "error" },
    { id: "quiz", label: "Quiz", status: "pending" as "pending" | "loading" | "success" | "error" },
    { id: "exam", label: "Exam", status: "pending" as "pending" | "loading" | "success" | "error" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const calculateSyncMutation = useCalculatePaperSync();

  useEffect(() => {
    if (isOpen) {
      setSteps(prev => prev.map(s => ({ ...s, status: "pending" })));
      startSync();
    }
  }, [isOpen]);

  const startSync = async () => {
    setIsProcessing(true);
    let hasError = false;
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: "loading" } : s));
      
      try {
        const results = await calculateSyncMutation.mutateAsync({ 
          id: resultId, 
          studentIds,
          category: step.id
        });
        onComplete(results);
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: "success" } : s));
      } catch (error) {
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: "error" } : s));
        hasError = true;
      }
    }
    
    setIsProcessing(false);
    if (!hasError) {
      toast.success("All scores synced successfully!");
      // We don't auto close immediately so they can see the success state and cancel it themselves.
      // But we will auto close after a short delay if they don't do it.
      // The user mentioned it takes time to cancel the popup, so we show the close button immediately when done.
    } else {
      toast.error("Some scores failed to sync");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1b2e] w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Syncing Papers
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {step.label}
              </span>
              <div>
                {step.status === "pending" && <span className="text-xs text-slate-400 font-medium">Waiting...</span>}
                {step.status === "loading" && <Loader2 className="w-5 h-5 animate-spin text-[#5B5CE6]" />}
                {step.status === "success" && <Check className="w-5 h-5 text-emerald-500" />}
                {step.status === "error" && <X className="w-5 h-5 text-rose-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
