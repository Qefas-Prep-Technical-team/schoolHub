import React, { useState, useEffect } from "react";
import { X, Copy, Calendar, AlertTriangle } from "lucide-react";
import { useReplicateTimetable } from "@/lib/api/hooks/useClasses";
import { toast } from "react-toastify";

interface ReplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  sourceTermPeriodId: string;
  sourceSessionName: string;
  sourceTermName: string;
  sessions: any[];
}

export default function ReplicateModal({
  isOpen,
  onClose,
  classId,
  sourceTermPeriodId,
  sourceSessionName,
  sourceTermName,
  sessions
}: ReplicateModalProps) {
  const [targetSessionName, setTargetSessionName] = useState("");
  const [targetTermName, setTargetTermName] = useState("First Term");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const replicateMutation = useReplicateTimetable(classId);

  useEffect(() => {
    if (isOpen) {
      setTargetSessionName(sourceSessionName);
      // Default to next term or different term
      if (sourceTermName === "First Term") {
        setTargetTermName("Second Term");
      } else if (sourceTermName === "Second Term") {
        setTargetTermName("Third Term");
      } else {
        setTargetTermName("First Term");
      }
    }
  }, [isOpen, sourceSessionName, sourceTermName]);

  if (!isOpen) return null;

  const selectedSessionObj = sessions.find((s) => s.name === targetSessionName);
  const targetTerm =
    targetTermName === "First Term"
      ? "FIRST"
      : targetTermName === "Second Term"
      ? "SECOND"
      : "THIRD";
  const targetTermPeriodId =
    selectedSessionObj?.termPeriods?.find((tp: any) => tp.term === targetTerm)?.id || "";

  const isSameTerm = sourceTermPeriodId === targetTermPeriodId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sourceTermPeriodId) {
      toast.error("Source term period is invalid.");
      return;
    }

    if (!targetTermPeriodId) {
      toast.error("Selected target term is not configured in this session.");
      return;
    }

    if (isSameTerm) {
      toast.error("Source and target terms cannot be the same.");
      return;
    }

    setIsSubmitting(true);
    try {
      await replicateMutation.mutateAsync({
        sourceTermPeriodId,
        targetTermPeriodId
      });
      toast.success("Timetable successfully replicated!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to replicate timetable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Dialog container */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-950 p-8 shadow-2xl border border-slate-100 dark:border-white/10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Copy className="text-purple-500" size={22} />
              Replicate Timetable
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Copy timetable layout and periods to another term or session
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Source Info */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Source Timetable (Copying From)
            </span>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-350">
              <Calendar size={16} className="text-slate-400" />
              <span>
                {sourceSessionName} &mdash; {sourceTermName}
              </span>
            </div>
          </div>

          {/* Destination Form */}
          <div className="space-y-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Destination Target (Copying To)
            </span>

            {/* Target Session Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Target Session
              </label>
              <select
                value={targetSessionName}
                onChange={(e) => setTargetSessionName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                required
              >
                <option value="">Select a Session...</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} {s.isActive ? "(Active)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Term Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Target Term
              </label>
              <select
                value={targetTermName}
                onChange={(e) => setTargetTermName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all outline-none"
                required
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>
          </div>

          {/* Validation Alert */}
          {isSameTerm && (
            <div className="flex gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-semibold leading-relaxed">
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <span>
                You have selected the same source and target term. Timetable replication requires choosing a different target session or term.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded-xl text-sm font-bold transition-all"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || isSameTerm || !targetTermPeriodId}
              className="flex-1 flex items-center justify-center gap-2 h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-purple-500/10"
            >
              <Copy size={16} />
              <span>{isSubmitting ? "Copying..." : "Replicate Now"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
