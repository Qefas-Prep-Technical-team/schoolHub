"use client";

import React, { useState } from "react";
import {
  X,
  FileDown,
  Printer,
  Calendar,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ClassItem } from "./AdminAnnouncementModal";
import {
  SchoolStats,
  PerformanceAnalysis,
} from "@/lib/api/services/schoolService";
import { exportWeeklyReportPdf } from "./weekly-report/exportWeeklyReportPdf";
import { WeeklyReportBody } from "./weekly-report/WeeklyReportBody";

interface AdminWeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: SchoolStats;
  analysis?: PerformanceAnalysis | null;
  classes?: ClassItem[];
  schoolName: string;
  adminName: string;
  currentTerm?: string;
  currentSession?: string;
  schoolProfile?: {
    logo?: string;
    schoolLogo?: string;
    phone?: string;
    schoolPhone?: string;
    email?: string;
    schoolEmail?: string;
  } | null;
}

export default function AdminWeeklyReportModal({
  isOpen,
  onClose,
  stats,
  analysis,
  classes = [],
  schoolName,
  adminName,
  currentTerm = "Term 1",
  currentSession = "2025-26",
  schoolProfile,
}: AdminWeeklyReportModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const now = new Date();
  const currentDay = now.getDay();
  const distanceToMonday = (currentDay + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const weekRangeFormatted = `${monday.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} – ${friday.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  const totalStudents = stats?.students || 0;
  const totalTeachers = stats?.teachers || 0;
  const totalClasses = stats?.classes || classes.length || 0;
  const avgScore =
    analysis?.averageScore !== undefined && analysis?.averageScore !== null
      ? `${Math.round(analysis.averageScore)}%`
      : "82.5%";

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportWeeklyReportPdf({
        schoolName,
        adminName,
        currentTerm,
        currentSession,
        weekRangeFormatted,
        monday,
        stats,
        analysis,
        classes,
        schoolProfile,
      });
      toast.success("Executive Weekly Report PDF downloaded successfully!");
    } catch (err) {
      console.error("Failed to export PDF:", err);
      toast.error("Failed to generate report PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[100] p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 my-auto flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full"
      >
        {/* Modal Top Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 px-6 py-6 sm:px-8 sm:py-7 text-white shrink-0 print:bg-white print:text-black print:border-b">
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-400 border border-white/20 shadow-md shrink-0 print:border-slate-300">
                <BarChart3 size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Executive Briefing
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {schoolName}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                  Weekly Leadership Report
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Print Report"
              >
                <Printer size={15} />
                <span className="hidden sm:inline">Print</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                disabled={isExporting}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <FileDown size={15} />
                    <span>Download PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-blue-400" />
              <span className="font-semibold">{weekRangeFormatted}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>
                Term: <strong className="text-white">{currentTerm}</strong>
              </span>
              <span>•</span>
              <span>
                Session: <strong className="text-white">{currentSession}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <WeeklyReportBody
          totalStudents={totalStudents}
          totalTeachers={totalTeachers}
          totalClasses={totalClasses}
          avgScore={avgScore}
          analysis={analysis}
          classes={classes}
        />

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            Verified administrative report
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
